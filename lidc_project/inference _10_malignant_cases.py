import torch
import torch.nn.functional as F
import pandas as pd
import numpy as np

from dataset import SliceDataset
from model import LungNoduleModel

# =========================
# CONFIG
# =========================
csv_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata_binary.csv"
model_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\best_densenet121_binary.pth"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load data
# =========================
df = pd.read_csv(csv_path)

# Get unique nodules
nodules = df.groupby(["series_id", "nodule_id"]).first().reset_index()

# Filter malignant
malignant = nodules[nodules["label"] == 1]

# Split
train_cases = malignant[malignant["split"] == "train"].head(5)
val_cases = malignant[malignant["split"] == "val"].head(5)

selected_cases = pd.concat([train_cases, val_cases]).reset_index(drop=True)

print("\nSelected Nodules:")
print(selected_cases[["series_id", "nodule_id", "split"]])

# =========================
# Load dataset + model
# =========================
dataset = SliceDataset(csv_path, split=None)

model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Function: predict one nodule
# =========================
def predict_nodule(series_id, nodule_id, true_label, split):

    print("\n==============================")
    print(f"NODULE: series_{series_id}_nodule_{nodule_id}")
    print("==============================")
    print(f"Split: {split}")
    print(f"True Label: {true_label} (MALIGNANT)")

    # Find slice indices
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

    # Aggregate
    all_probs = np.array(all_probs)
    avg_probs = np.mean(all_probs, axis=0)
    final_pred = int(np.argmax(avg_probs))
    confidence = abs(avg_probs[1] - avg_probs[0])

    print("Avg probs:", avg_probs)
    print("Prediction:", "MALIGNANT" if final_pred else "BENIGN")
    print("Confidence:", round(confidence, 4))

    if final_pred == true_label:
        print("✅ CORRECT")
    else:
        print("❌ WRONG")

    return final_pred == true_label


# =========================
# Run all cases
# =========================
correct = 0

for _, row in selected_cases.iterrows():
    result = predict_nodule(
        series_id=row["series_id"],
        nodule_id=row["nodule_id"],
        true_label=row["label"],
        split=row["split"]
    )
    if result:
        correct += 1

# =========================
# Summary
# =========================
print("\n==============================")
print("SUMMARY")
print("==============================")
print(f"Correct: {correct} / {len(selected_cases)}")
print(f"Accuracy: {100 * correct / len(selected_cases):.2f}%")