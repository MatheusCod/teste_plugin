# Copyright 2019 The TensorFlow Authors. All Rights Reserved.
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
"""A sample plugin to demonstrate dynamic loading."""
########## NEW IMPORT ##########
import random
########## NEW IMPORT ##########

import json
import os

from tensorboard.plugins import base_plugin
from tensorboard.util import tensor_util
import werkzeug
from werkzeug import wrappers

from IPMI_plugin_tensorboard import metadata

class IPMI_Plugin(base_plugin.TBPlugin):
    plugin_name = metadata.PLUGIN_NAME

    def __init__(self, context):
        """Instantiates ExamplePlugin.

        Args:
        context: A base_plugin.TBContext instance.
        """
        self._multiplexer = context.multiplexer

    def is_active(self):
        """Returns whether there is relevant data for the plugin to process.

        When there are no runs with greeting data, TensorBoard will hide the
        plugin from the main navigation bar.
        """
        return bool(
            self._multiplexer.PluginRunToTagToContent(metadata.PLUGIN_NAME)
        )

    def get_plugin_apps(self):
        return {
            "/index.js": self._serve_js,
            "/tags": self._serve_tags,
            "/summarys": self._serve_summarys,
        }

    def frontend_metadata(self):
        return base_plugin.FrontendMetadata(es_module_path="/index.js")
    
    @wrappers.Request.application
    def _serve_js(self, request):
        del request  # unused
        filepath = os.path.join(os.path.dirname(__file__), "static", "index.js")
        with open(filepath) as infile:
            contents = infile.read()
        return werkzeug.Response(
            contents, content_type="application/javascript"
        )
    
 
    @wrappers.Request.application
    def _serve_tags(self, request):
        del request  # unused
        mapping = self._multiplexer.PluginRunToTagToContent(
            metadata.PLUGIN_NAME
        )
        result = {run: {} for run in self._multiplexer.Runs()}
        for (run, tag_to_content) in mapping.items():
            for tag in tag_to_content:
                summary_metadata = self._multiplexer.SummaryMetadata(run, tag)
                result[run][tag] = {
                    "description": summary_metadata.summary_description,
                }
        contents = json.dumps(result, sort_keys=True)
        return werkzeug.Response(contents, content_type="application/json")

    @wrappers.Request.application
    def _serve_summarys(self, request):

        For details on how to use tags and runs, see
        https://github.com/tensorflow/tensorboard#tags-giving-names-to-data
        """
        run = request.args.get("run")
        tag = request.args.get("tag")
        if run is None or tag is None:
            raise werkzeug.exceptions.BadRequest("Must specify run and tag")
        try:
            data = [
                tensor_util.make_ndarray(event.tensor_proto)
                .item()
                .decode("utf-8")
                for event in self._multiplexer.Tensors(run, tag)
            ]
        except KeyError:
            raise werkzeug.exceptions.BadRequest("Invalid run or tag")
        contents = json.dumps(data, sort_keys=True)
        return werkzeug.Response(contents, content_type="application/json")
