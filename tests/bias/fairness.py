from aif360.datasets import BinaryLabelDataset
from aif360.metrics import BinaryLabelDatasetMetric

import pandas as pd

# Beispieldaten laden
df = pd.read_csv("predictions.csv")

dataset = BinaryLabelDataset(df=df, label_names=['outcome'], protected_attribute_names=['gender'])

metric = BinaryLabelDatasetMetric(dataset, privileged_groups=[{'gender': 1}], unprivileged_groups=[{'gender': 0}])

disparity = metric.disparate_impact()

assert 0.8 <= disparity <= 1.25, f"Disparate Impact zu hoch: {disparity}"