import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pandas as pd
import numpy as np

from dataset import SliceDataset
from model import LungNoduleModel

# =========================
# Paths
# =========================
csv_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata_binary.csv"
model_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\best_densenet121_binary.pth"

# =========================
# Device
# =========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load metadata
# =========================
df = pd.read_csv(csv_path)
test_df = df[df["split"] == "test"].reset_index(drop=True)

print("Total test slices:", len(test_df))

# =========================
# Dataset + Loader
# =========================
test_dataset = SliceDataset(csv_path, split="test",train=False)
test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Get softmax probabilities
# =========================
all_probs = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)

        outputs = model(images)
        probs = F.softmax(outputs, dim=1)

        all_probs.extend(probs.cpu().numpy())

# Add probabilities to dataframe
all_probs = np.array(all_probs)
test_df["prob_0"] = all_probs[:, 0]
test_df["prob_1"] = all_probs[:, 1]

# =========================
# Aggregate to nodule-level
# =========================
grouped = test_df.groupby(["series_id", "nodule_id"])

true_nodule_labels = []
pred_nodule_labels = []

for (series_id, nodule_id), group in grouped:
    true_label = group["label"].iloc[0]

    avg_probs = [
        group["prob_0"].mean(),
        group["prob_1"].mean()
    ]

    final_pred = int(np.argmax(avg_probs))

    true_nodule_labels.append(true_label)
    pred_nodule_labels.append(final_pred)

# =========================
# Metrics
# =========================
acc = accuracy_score(true_nodule_labels, pred_nodule_labels)
cm = confusion_matrix(true_nodule_labels, pred_nodule_labels)
report = classification_report(true_nodule_labels, pred_nodule_labels, digits=4)

print("\n==============================")
print(f"Nodule-Level Test Accuracy (Binary): {acc * 100:.2f}%")
print("==============================\n")

print("Confusion Matrix:")
print(cm)

print("\nClassification Report:")
print(report)

print("\nTotal test nodules:", len(true_nodule_labels))