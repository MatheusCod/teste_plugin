from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

# Standard imports
from tensorboard.compat.proto import summary_pb2

PLUGIN_NAME = "IMPI_plugin"


def CreateSummaryMetadata(description=None):
  return summary_pb2.SummaryMetadata(
      summary_description=description,
      plugin_data=summary_pb2.SummaryMetadata.PluginData(
          plugin_name=PLUGIN_NAME))
