import pandas as pd

from project_paths import SLICE_METADATA_BINARY_CSV, SLICE_METADATA_CENTRAL_CSV

# =========================
# Paths
# =========================
central_csv = SLICE_METADATA_CENTRAL_CSV
binary_csv = SLICE_METADATA_BINARY_CSV

# =========================
# Load datasets
# =========================
central_df = pd.read_csv(central_csv)
binary_df = pd.read_csv(binary_csv)

# =========================
# 1. 3-Class (Central Slices)
# =========================
print("\n==============================")
print("3-CLASS DATASET (CENTRAL SLICES)")
print("==============================")

print("Total Samples:", len(central_df))

print("\nClass Distribution:")
print(central_df["label"].value_counts().sort_index())

print("\nSplit Distribution:")
print(central_df["split"].value_counts())

# =========================
# 2. 2-Class (Binary Dataset)
# =========================
print("\n==============================")
print("2-CLASS DATASET (ALL SELECTED SLICES)")
print("==============================")

print("Total Samples:", len(binary_df))

print("\nClass Distribution:")
print(binary_df["label"].value_counts().sort_index())

print("\nSplit Distribution:")
print(binary_df["split"].value_counts())

# =========================
# 3. 2-Class + Central Slices (FINAL DATASET)
# =========================
print("\n==============================")
print("2-CLASS DATASET (CENTRAL SLICES ONLY - FINAL)")
print("==============================")

# NOTE: binary_csv is already created FROM central_csv
# so this is your final dataset

print("Total Samples:", len(binary_df))

print("\nClass Distribution:")
print(binary_df["label"].value_counts().sort_index())

print("\nSplit Distribution:")
print(binary_df["split"].value_counts())

print("\nSplit × Label Distribution:")
print(binary_df.groupby(["split", "label"]).size())
