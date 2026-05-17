import pandas as pd

from project_paths import SLICE_METADATA_BINARY_CSV, SLICE_METADATA_CENTRAL_CSV

input_csv = SLICE_METADATA_CENTRAL_CSV
output_csv = SLICE_METADATA_BINARY_CSV

df = pd.read_csv(input_csv)

# Remove indeterminate class (label = 1)
df = df[df["label"] != 1]

# Convert labels:
# 0 → 0 (benign)
# 2 → 1 (malignant)
df["label"] = df["label"].map({0: 0, 2: 1})

df.to_csv(output_csv, index=False)

print("Binary dataset created.")
print("Class distribution:")
print(df["label"].value_counts())

print("\nSplit distribution:")
print(df["split"].value_counts())
