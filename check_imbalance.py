import pandas as pd
from pathlib import Path

df = pd.read_csv(
    Path(__file__).resolve().parent / "lidc_project" / "processed_data" / "metadata_binary.csv"
)
slice_counts = df.groupby("label")["num_slices"].sum()

print("Total slices per class:")
print(slice_counts)

avg_slices = df.groupby("label")["num_slices"].mean()

print("Average slices per nodule:")
print(avg_slices)

print(df.groupby("label")["num_slices"].describe())
