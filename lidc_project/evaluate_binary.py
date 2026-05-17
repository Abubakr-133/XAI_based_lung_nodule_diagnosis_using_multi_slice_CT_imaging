import torch
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from dataset import SliceDataset
from model import LungNoduleModel
from project_paths import BEST_DENSENET121_BINARY_PATH, SLICE_METADATA_BINARY_CSV

# =========================
# Paths
# =========================
csv_path = SLICE_METADATA_BINARY_CSV
model_path = BEST_DENSENET121_BINARY_PATH

# =========================
# Device
# =========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Dataset
# =========================
test_dataset = SliceDataset(csv_path, split="test",train=False)
test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

print("Test dataset size:", len(test_dataset))

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Evaluation
# =========================
all_preds = []
all_labels = []

with torch.no_grad():
    for images, labels in test_loader:
        images = images.to(device)
        labels = labels.to(device)

        outputs = model(images)
        _, preds = torch.max(outputs, 1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

# =========================
# Metrics
# =========================
acc = accuracy_score(all_labels, all_preds)
cm = confusion_matrix(all_labels, all_preds)
report = classification_report(all_labels, all_preds, digits=4)

print("\n==============================")
print(f"Slice-Level Test Accuracy (Binary): {acc * 100:.2f}%")
print("==============================\n")

print("Confusion Matrix:")
print(cm)

print("\nClassification Report:")
print(report)
