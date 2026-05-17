import pandas as pd

input_csv = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata_central.csv"
output_csv = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata_binary.csv"

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