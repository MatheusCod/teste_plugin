import tensorflow.compat.v2 as tf
from tensorboard.compat.proto import summary_pb2

from . import metadata

def power(tag,data,step):
        return tf.summary.scalar(tag,data, step=step) 