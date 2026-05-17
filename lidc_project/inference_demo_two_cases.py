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

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load dataset + model
# =========================
dataset = SliceDataset(csv_path, split=None)

model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Function to run inference
# =========================
def predict_nodule(series_id, nodule_id):
    df = pd.read_csv(csv_path)

    nodule_df = df[
        (df["series_id"] == series_id) &
        (df["nodule_id"] == nodule_id)
    ].reset_index(drop=True)

    if len(nodule_df) == 0:
        print(f"\n❌ Nodule {series_id}-{nodule_id} not found")
        return

    split = nodule_df["split"].iloc[0]
    true_label = int(nodule_df["label"].iloc[0])

    print("\n==============================")
    print(f"NODULE: series_{series_id}_nodule_{nodule_id}")
    print("==============================")
    print(f"Split: {split}")
    print(f"True Label: {true_label} (0=Benign, 1=Malignant)")

    # Find matching indices
    indices = []
    for i in range(len(dataset.df)):
        row = dataset.df.iloc[i]
        if row["series_id"] == series_id and row["nodule_id"] == nodule_id:
            indices.append(i)

    all_probs = []

    with torch.no_grad():
        for idx in indices:
            image, _ = dataset[idx]
            image = image.unsqueeze(0).to(device)

            output = model(image)
            probs = F.softmax(output, dim=1).cpu().numpy()[0]

            all_probs.append(probs)

            pred = np.argmax(probs)
            print(f"Slice {idx} → {probs} | {'MALIGNANT' if pred else 'BENIGN'}")

    # Aggregate
    all_probs = np.array(all_probs)
    avg_probs = np.mean(all_probs, axis=0)
    final_pred = int(np.argmax(avg_probs))
    confidence = abs(avg_probs[1] - avg_probs[0])

    print("\n--- FINAL ---")
    print("Avg probs:", avg_probs)
    print("Prediction:", "MALIGNANT" if final_pred else "BENIGN")
    print("Confidence:", round(confidence, 4))

    if final_pred == true_label:
        print("✅ CORRECT")
    else:
        print("❌ WRONG")


# =========================
# RUN BOTH CASES
# =========================

# ✅ Malignant case (VAL)
predict_nodule(series_id=36, nodule_id=0)

# ✅ Benign case (TRAIN/VAL)
predict_nodule(series_id=25, nodule_id=0)
