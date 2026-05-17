import pandas as pd
from pathlib import Path


processed_data_dir = Path(__file__).resolve().parent / "lidc_project" / "processed_data"

# Load metadata
df = pd.read_csv(processed_data_dir / "metadata_with_split.csv")

# Remove indeterminate nodules
df = df[df["label"] != 1]

# Convert labels
df["label"] = df["label"].map({0: 0, 2: 1})

# Save updated metadata
# df.to_csv("metadata_binary.csv", index=False)
df.to_csv(processed_data_dir / "metadata_binary.csv", index=False)
print("Updated dataset size:", len(df))
print(df["label"].value_counts())
