# Copyright 2016 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""TensorBoard Plugin abstract base class.

Every plugin in TensorBoard must extend and implement the abstract
methods of this base class.
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function


import mimetypes
import os
import json
from werkzeug import wrappers
import tensorflow.compat.v2 as tf

from tensorboard import errors
from tensorboard.backend import http_util
from tensorboard.plugins import base_plugin
from tensorboard.util import tensor_util
from .metadata import PLUGIN_NAME

#dados obtidos estara nesse diretorio
_PLUGIN_DIRECTORY_PATH_PART = "/data/plugin/IPMI_plugin/"

class IPMI_Plugin(base_plugin.TBPlugin):
    """Using IPMI in TensorBoard to be abble to debbugin POWER in process."""

    plugin_name = PLUGIN_NAME

    def __init__(self, context):
        """Instantiates ExampleRawScalarsPlugin.
        Args:
          context: A base_plugin.TBContext instance.
        """
        self._multiplexer = context.multiplexer
    
    def get_plugin_apps(self):
        return {
            "/scalars": self.scalars_route,
            "/tags": self._serve_tags,
            "/static/*": self._serve_static_file,
        }
    
    
    
    @wrappers.Request.application
    def _serve_tags(self, request):
        """Serves run to tag info.
        Frontend clients can use the Multiplexer's run+tag structure to request data
        for a specific run+tag. Responds with a map of the form:
        {runName: [tagName, tagName, ...]}
        """
        run_tag_mapping = self._multiplexer.PluginRunToTagToContent(
            self.plugin_name
        )
        run_info = {run: list(tags) for (run, tags) in run_tag_mapping.items()}

        return http_util.Respond(request, run_info, "application/json")

    @wrappers.Request.application
    def _serve_static_file(self, request):
       
        static_path_part = request.path[len(_PLUGIN_DIRECTORY_PATH_PART) :]
        resource_name = os.path.normpath(
            os.path.join(*static_path_part.split("/"))
        )
        if not resource_name.startswith("static" + os.path.sep):
            return http_util.Respond(
                request, "Not found", "text/plain", code=404
            )

        resource_path = os.path.join(os.path.dirname(__file__), resource_name)
        with open(resource_path, "rb") as read_file:
            mimetype = mimetypes.guess_type(resource_path)[0]
            return http_util.Respond(
                request, read_file.read(), content_type="application/json"
            )
    def is_active(self):
        """Returns whether there is relevant data for the plugin to process.
        When there are no runs with scalar data, TensorBoard will hide the plugin
        from the main navigation bar.
        """
        return bool(
            self._multiplexer.PluginRunToTagToContent(self.plugin_name)
        )

    def frontend_metadata(self):
        return base_plugin.FrontendMetadata(
            es_module_path="/index.js",
            tab_name='IPMI_Plugin',
            remove_dom=False,
            element_name=None)

    def scalars_impl(self, tag, run):
        """Returns scalar data for the specified tag and run.
        For details on how to use tags and runs, see
        https://github.com/tensorflow/tensorboard#tags-giving-names-to-data
        Args:
          tag: string
          run: string
        Returns:
          A list of ScalarEvents - tuples containing 3 numbers describing entries in
          the data series.
        Raises:
          errors.NotFoundError: if run+tag pair has no scalar data.
        """
        try:
            tensor_events = self._multiplexer.Tensors(run, tag)
            values = [
                (
                    tensor_event.wall_time,
                    tensor_event.step,
                    tensor_util.make_ndarray(tensor_event.tensor_proto).item(),
                )
                for tensor_event in tensor_events
            ]
        except KeyError:
            raise errors.NotFoundError(
                "No scalar data for run=%r, tag=%r" % (run, tag)
            )
        return values

    @wrappers.Request.application
    def scalars_route(self, request):
        """Given a tag and single run, return array of ScalarEvents."""
        tag = request.args.get("tag")
        run = request.args.get("run")
        body = self.scalars_impl(tag, run)
        return http_util.Respond(request, body, "application/json")
