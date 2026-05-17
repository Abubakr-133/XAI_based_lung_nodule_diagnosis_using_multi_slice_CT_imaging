# import torch
# import torch.nn as nn
# import torch.optim as optim
# from torch.utils.data import DataLoader
#
# from dataset import SliceDataset
# from model import LungNoduleModel
#
# # =========================
# # Paths
# # =========================
# csv_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata.csv"
#
# # =========================
# # Device
# # =========================
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# print("Using device:", device)
#
# # =========================
# # Datasets
# # =========================
# train_dataset = SliceDataset(csv_path, split="train")
# val_dataset = SliceDataset(csv_path, split="val")
#
# train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True, num_workers=0)
# val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False, num_workers=0)
#
# # =========================
# # Model
# # =========================
# model = LungNoduleModel(num_classes=3).to(device)
#
# # =========================
# # Loss + Optimizer
# # =========================
# criterion = nn.CrossEntropyLoss()
# optimizer = optim.Adam(model.parameters(), lr=1e-4)
#
# # =========================
# # Training settings
# # =========================
# num_epochs = 10
# best_val_acc = 0.0
#
# # =========================
# # Training Loop
# # =========================
# for epoch in range(num_epochs):
#     print(f"\nEpoch [{epoch+1}/{num_epochs}]")
#
#     # ---- Training ----
#     model.train()
#     train_loss = 0.0
#     train_correct = 0
#     train_total = 0
#
#     for images, labels in train_loader:
#         images = images.to(device)
#         labels = labels.to(device)
#
#         optimizer.zero_grad()
#
#         outputs = model(images)
#         loss = criterion(outputs, labels)
#
#         loss.backward()
#         optimizer.step()
#
#         train_loss += loss.item()
#
#         _, predicted = torch.max(outputs, 1)
#         train_total += labels.size(0)
#         train_correct += (predicted == labels).sum().item()
#
#     train_acc = 100 * train_correct / train_total
#     avg_train_loss = train_loss / len(train_loader)
#
#     # ---- Validation ----
#     model.eval()
#     val_loss = 0.0
#     val_correct = 0
#     val_total = 0
#
#     with torch.no_grad():
#         for images, labels in val_loader:
#             images = images.to(device)
#             labels = labels.to(device)
#
#             outputs = model(images)
#             loss = criterion(outputs, labels)
#
#             val_loss += loss.item()
#
#             _, predicted = torch.max(outputs, 1)
#             val_total += labels.size(0)
#             val_correct += (predicted == labels).sum().item()
#
#     val_acc = 100 * val_correct / val_total
#     avg_val_loss = val_loss / len(val_loader)
#
#     print(f"Train Loss: {avg_train_loss:.4f} | Train Acc: {train_acc:.2f}%")
#     print(f"Val Loss:   {avg_val_loss:.4f} | Val Acc:   {val_acc:.2f}%")
#
#     # ---- Save Best Model ----
#     if val_acc > best_val_acc:
#         best_val_acc = val_acc
#         torch.save(model.state_dict(), "best_densenet121.pth")
#         print("Best model saved.")
#
# print("\nTraining complete.")
# print(f"Best Validation Accuracy: {best_val_acc:.2f}%")

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

import pandas as pd

from dataset import SliceDataset
from model import LungNoduleModel

# =========================
# Paths
# =========================
csv_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata_central.csv"

# =========================
# Device
# =========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load metadata (for class weights)
# =========================
df = pd.read_csv(csv_path)
train_df = df[df["split"] == "train"]

class_counts = train_df["label"].value_counts().sort_index()
print("Class counts:\n", class_counts)

total_samples = class_counts.sum()
class_weights = total_samples / class_counts
class_weights = torch.tensor(class_weights.values, dtype=torch.float32).to(device)

print("Class weights:", class_weights)

# =========================
# Datasets
# =========================
train_dataset = SliceDataset(csv_path, split="train")
val_dataset = SliceDataset(csv_path, split="val")

train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=8, shuffle=False)

# =========================
# Model
# =========================
model = LungNoduleModel(num_classes=3).to(device)

# =========================
# Loss + Optimizer
# =========================
criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=5e-5,
    weight_decay=1e-4   # regularization
)

# =========================
# Training settings
# =========================
num_epochs = 20
best_val_acc = 0.0
patience = 3
patience_counter = 0

# =========================
# Training Loop
# =========================
for epoch in range(num_epochs):
    print(f"\nEpoch [{epoch+1}/{num_epochs}]")

    # ---- Training ----
    model.train()
    train_loss = 0.0
    train_correct = 0
    train_total = 0

    for batch_idx, (images, labels) in enumerate(train_loader):
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        train_loss += loss.item()

        _, predicted = torch.max(outputs, 1)
        train_total += labels.size(0)
        train_correct += (predicted == labels).sum().item()

        if batch_idx % 50 == 0:
            print(f"Batch {batch_idx}/{len(train_loader)} | Loss: {loss.item():.4f}")

    train_acc = 100 * train_correct / train_total
    avg_train_loss = train_loss / len(train_loader)

    # ---- Validation ----
    model.eval()
    val_loss = 0.0
    val_correct = 0
    val_total = 0

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            val_loss += loss.item()

            _, predicted = torch.max(outputs, 1)
            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()

    val_acc = 100 * val_correct / val_total
    avg_val_loss = val_loss / len(val_loader)

    print(f"Train Loss: {avg_train_loss:.4f} | Train Acc: {train_acc:.2f}%")
    print(f"Val Loss:   {avg_val_loss:.4f} | Val Acc:   {val_acc:.2f}%")

    # ---- Early Stopping ----
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), "best_densenet121_central.pth")
        print("Best model saved.")
        patience_counter = 0
    else:
        patience_counter += 1
        print(f"No improvement. Patience: {patience_counter}/{patience}")

        if patience_counter >= patience:
            print("\nEarly stopping triggered.")
            break

print("\nTraining complete.")
print(f"Best Validation Accuracy: {best_val_acc:.2f}%")
