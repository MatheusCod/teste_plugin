from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

# Standard imports
from .metadata import metadata
from tensorboard.compat import tf2 as tf


def FairnessIndicators(eval_result_output_dir, step=None, description=None):
  """Write a Fairness Indicators summary.
  Arguments:
    eval_result_output_dir: Directory output created by
      tfma.model_eval_lib.ExtractEvaluateAndWriteResults API, which contains
      'metrics' file having MetricsForSlice results.
    step: Explicit `int64`-castable monotonic step value for this summary. If
      omitted, this defaults to `tf.summary.experimental.get_step()`, which must
      not be None.
    description: Optional long-form description for this summary, as a constant
      `str`. Markdown is supported. Defaults to empty.
  Returns:
    True on success, or false if no summary was written because no default
    summary writer was available.
  Raises:
    ValueError: if a default writer exists, but no step was provided and
      `tf.summary.experimental.get_step()` is None.
  """
  with tf.summary.experimental.summary_scope(metadata.PLUGIN_NAME):
    return tf.summary.write(
        tag=metadata.PLUGIN_NAME,
        tensor=tf.constant(eval_result_output_dir),
        step=step,
        metadata=metadata.CreateSummaryMetadata(description),
    )
