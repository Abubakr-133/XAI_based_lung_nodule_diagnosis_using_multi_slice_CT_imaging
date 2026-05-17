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
# Load metadata
# =========================
df = pd.read_csv(csv_path)
test_df = df[df["split"] == "test"].reset_index(drop=True)

print("Total test slices:", len(test_df))

# =========================
# Load dataset
# =========================
test_dataset = SliceDataset(csv_path, split="test")

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Predict all test slices
# =========================
all_probs = []

with torch.no_grad():
    for idx in range(len(test_dataset)):
        image, label = test_dataset[idx]
        image = image.unsqueeze(0).to(device)

        output = model(image)
        probs = F.softmax(output, dim=1).cpu().numpy()[0]
        all_probs.append(probs)

all_probs = np.array(all_probs)

# Add probs to dataframe
test_df["prob_0"] = all_probs[:, 0]
test_df["prob_1"] = all_probs[:, 1]

# =========================
# Aggregate nodule-level
# =========================
grouped = test_df.groupby(["series_id", "nodule_id"])

results = []

for (series_id, nodule_id), group in grouped:
    true_label = int(group["label"].iloc[0])

    avg_prob_0 = group["prob_0"].mean()
    avg_prob_1 = group["prob_1"].mean()
    pred_label = int(np.argmax([avg_prob_0, avg_prob_1]))

    correct = (true_label == pred_label)

    results.append({
        "series_id": series_id,
        "nodule_id": nodule_id,
        "true_label": true_label,
        "pred_label": pred_label,
        "avg_prob_0": round(avg_prob_0, 4),
        "avg_prob_1": round(avg_prob_1, 4),
        "correct": correct
    })

# =========================
# Convert to DataFrame
# =========================
results_df = pd.DataFrame(results)

# Save full results
save_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\binary_test_nodule_predictions.csv"
results_df.to_csv(save_path, index=False)

# =========================
# Print summary
# =========================
print("\n==============================")
print("ALL TEST NODULE RESULTS")
print("==============================\n")

print(results_df)

print("\n==============================")
print("CORRECTLY PREDICTED NODULES")
print("==============================\n")
print(results_df[results_df["correct"] == True])

print("\n==============================")
print("WRONGLY PREDICTED NODULES")
print("==============================\n")
print(results_df[results_df["correct"] == False])

# Accuracy check
acc = results_df["correct"].mean() * 100
print(f"\nVerified Nodule-Level Accuracy: {acc:.2f}%")

print(f"\nSaved results to:\n{save_path}")