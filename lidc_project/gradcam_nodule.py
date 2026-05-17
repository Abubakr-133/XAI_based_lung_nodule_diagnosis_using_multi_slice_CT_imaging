import torch
import numpy as np
import os
import cv2
import matplotlib.pyplot as plt
from PIL import Image

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from model import LungNoduleModel

# =========================
# CONFIG
# =========================
model_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\best_densenet121_binary.pth"
folder_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\series_36_nodule_0"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Load slices
# =========================
slice_files = sorted([f for f in os.listdir(folder_path) if f.endswith(".png")])

best_slice = None
best_prob = -1
best_img_np = None
best_input_tensor = None

# =========================
# Find best slice
# =========================
for file in slice_files:
    path = os.path.join(folder_path, file)

    img = Image.open(path).convert("RGB")
    img = img.resize((224, 224))

    img_np = np.array(img).astype(np.float32) / 255.0

    # Normalize
    img_norm = (img_np - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]

    tensor = torch.tensor(img_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)

    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, dim=1).cpu().numpy()[0]

    pred_class = np.argmax(probs)
    confidence = probs[pred_class]

    print(f"{file} → {probs}")

    if confidence > best_prob:
        best_prob = confidence
        best_slice = file
        best_img_np = img_np
        best_input_tensor = tensor
        best_pred_class = pred_class

print("\nBest slice:", best_slice)
print("Confidence:", best_prob)

# =========================
# Grad-CAM
# =========================
target_layers = [model.backbone.features[-1]]
cam = GradCAM(model=model, target_layers=target_layers)

targets = [ClassifierOutputTarget(best_pred_class)]
grayscale_cam = cam(input_tensor=best_input_tensor, targets=targets)[0]

# Smooth CAM
grayscale_cam = cv2.GaussianBlur(grayscale_cam, (25, 25), 0)
grayscale_cam = (grayscale_cam - grayscale_cam.min()) / (grayscale_cam.max() + 1e-8)

# =========================
# Overlay
# =========================
heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
heatmap = np.float32(heatmap) / 255.0

overlay = best_img_np * 0.75 + heatmap * 0.25
overlay = np.clip(overlay, 0, 1)

# =========================
# Plot
# =========================
plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.title("Original")
plt.imshow(best_img_np)
plt.axis("off")

plt.subplot(1, 3, 2)
plt.title("Grad-CAM")
plt.imshow(grayscale_cam, cmap="jet")
plt.axis("off")

plt.subplot(1, 3, 3)
plt.title("Overlay")
plt.imshow(overlay)
plt.axis("off")

plt.suptitle(f"Best Slice: {best_slice} | Confidence: {best_prob:.4f}")
plt.tight_layout()
plt.show()