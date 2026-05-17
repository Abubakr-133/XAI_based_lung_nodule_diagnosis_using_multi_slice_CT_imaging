import os
import pandas as pd

# Paths
metadata_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\metadata_with_split.csv"
processed_data_root = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data"
output_csv = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata.csv"

# Load nodule-level metadata
df = pd.read_csv(metadata_path)

slice_rows = []

for _, row in df.iterrows():
    folder_name = f"series_{row['series_id']}_nodule_{row['nodule_id']}"
    folder_path = os.path.join(processed_data_root, folder_name)

    if not os.path.exists(folder_path):
        print(f"Missing folder: {folder_path}")
        continue

    slice_files = sorted([
        f for f in os.listdir(folder_path)
        if f.lower().endswith(".png")
    ])

    for slice_file in slice_files:
        slice_rows.append({
            "image_path": os.path.join(folder_path, slice_file),
            "label": int(row["label"]),
            "split": row["split"],
            "patient_id": row["patient_id"],
            "series_id": row["series_id"],
            "nodule_id": row["nodule_id"]
        })

# Create slice-level dataframe
slice_df = pd.DataFrame(slice_rows)

# Save
slice_df.to_csv(output_csv, index=False)

print("Slice metadata created successfully.")
print("Total slices:", len(slice_df))
print("\nClass distribution:")
print(slice_df["label"].value_counts())

print("\nSplit distribution:")
print(slice_df["split"].value_counts())

print("\nSplit × Label distribution:")
print(slice_df.groupby(["split", "label"]).size())