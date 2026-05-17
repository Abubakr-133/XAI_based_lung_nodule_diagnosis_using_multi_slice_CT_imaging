import torch
import torch.nn.functional as F
import pandas as pd
import numpy as np

from dataset import SliceDataset
from model import LungNoduleModel
from project_paths import BEST_DENSENET121_BINARY_PATH, SLICE_METADATA_BINARY_CSV

# =========================
# CONFIG
# =========================
csv_path = SLICE_METADATA_BINARY_CSV
model_path = BEST_DENSENET121_BINARY_PATH

# Choose one nodule
target_series_id = 0
target_nodule_id = 0

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load metadata
# =========================
df = pd.read_csv(csv_path)

# Only test split
test_df = df[df["split"] == "test"].reset_index(drop=True)

# Filter selected nodule
nodule_df = test_df[
    (test_df["series_id"] == target_series_id) &
    (test_df["nodule_id"] == target_nodule_id)
].reset_index(drop=True)

print(f"Total slices for target nodule: {len(nodule_df)}")

if len(nodule_df) == 0:
    raise ValueError("No slices found for this nodule in TEST split.")

true_label = int(nodule_df["label"].iloc[0])
print("True Label:", true_label, "(0=Benign, 1=Malignant)")

# =========================
# Load dataset (official preprocessing)
# =========================
test_dataset = SliceDataset(csv_path, split="test")

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Predict each slice
# =========================
all_probs = []

with torch.no_grad():
    for idx in nodule_df.index:
        image, label = test_dataset[idx]

        image = image.unsqueeze(0).to(device)
        output = model(image)
        probs = F.softmax(output, dim=1).cpu().numpy()[0]

        all_probs.append(probs)
        print(f"Slice {idx} → {probs}")

# =========================
# Aggregate
# =========================
all_probs = np.array(all_probs)
avg_probs = np.mean(all_probs, axis=0)
final_pred = int(np.argmax(avg_probs))

print("\n==============================")
print("NODULE-LEVEL RESULT")
print("==============================")
print("Average Probabilities:", avg_probs)
print("Final Prediction:", final_pred)

if final_pred == 0:
    print("Prediction: BENIGN")
else:
    print("Prediction: MALIGNANT")
