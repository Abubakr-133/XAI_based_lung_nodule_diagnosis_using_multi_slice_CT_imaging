# import torch
# import numpy as np
# import cv2
# import matplotlib.pyplot as plt
# from PIL import Image
#
# from pytorch_grad_cam import GradCAM
# from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
#
# from model import LungNoduleModel
#
# # =========================
# # CONFIG
# # =========================
# model_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\best_densenet121_binary.pth"
# image_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\series_84_nodule_0\slice_5.png"
#
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# print("Using device:", device)
#
# # =========================
# # Load model
# # =========================
# model = LungNoduleModel(num_classes=2).to(device)
# model.load_state_dict(torch.load(model_path, map_location=device))
# model.eval()
#
# # =========================
# # Load image
# # =========================
# img = Image.open(image_path).convert("RGB")
# img = img.resize((224, 224))
#
# # Original image for visualization
# img_np = np.array(img).astype(np.float32) / 255.0
#
# # Normalized image for model input
# img_norm = img_np.copy()
# img_norm = (img_norm - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
#
# input_tensor = torch.tensor(img_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)
#
# # =========================
# # Predict class
# # =========================
# with torch.no_grad():
#     output = model(input_tensor)
#     pred_class = output.argmax(dim=1).item()
#     probs = torch.softmax(output, dim=1).cpu().numpy()[0]
#
# print("Predicted class:", pred_class)
# print("Probabilities:", probs)
# print("Prediction:", "MALIGNANT" if pred_class == 1 else "BENIGN")
#
# # =========================
# # Grad-CAM
# # =========================
# target_layers = [model.backbone.features[-1]]
#
# cam = GradCAM(model=model, target_layers=target_layers)
#
# targets = [ClassifierOutputTarget(pred_class)]
# grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]
#
# # Smooth CAM
# grayscale_cam = cv2.resize(grayscale_cam, (224, 224), interpolation=cv2.INTER_CUBIC)
# grayscale_cam = cv2.GaussianBlur(grayscale_cam, (51, 51), 0)
# grayscale_cam = grayscale_cam - grayscale_cam.min()
# grayscale_cam = grayscale_cam / (grayscale_cam.max() + 1e-8)
#
# # =========================
# # Transparent overlay
# # =========================
# # heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
# # heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
# # heatmap = np.float32(heatmap) / 255.0
# #
# # overlay = img_np * 0.75 + heatmap * 0.25
# # overlay = np.clip(overlay, 0, 1)
# # Threshold important regions
# # =========================
# # Transparent overlay
# # =========================
# heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
# heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
# heatmap = np.float32(heatmap) / 255.0
#
# # Keep only stronger activation regions
# # threshold = 0.4
# # mask = grayscale_cam > threshold
# # heatmap_masked = heatmap * mask[..., np.newaxis]
# soft_mask = np.clip((grayscale_cam - 0.2) / 0.8, 0, 1)
# heatmap_masked = heatmap * soft_mask[..., np.newaxis]
# heatmap_masked = np.clip(heatmap_masked*1.2,0,1)
# # Blend original image + heatmap
# overlay = img_np * 0.75 + heatmap_masked * 0.25
# overlay = np.clip(overlay, 0, 1)
# # =========================
# # Plot
# # =========================
# plt.figure(figsize=(12, 4))
#
# plt.subplot(1, 3, 1)
# plt.title("Original")
# plt.imshow(img_np)
# plt.axis("off")
#
# plt.subplot(1, 3, 2)
# plt.title("Grad-CAM")
# plt.imshow(grayscale_cam, cmap="jet")
# plt.axis("off")
#
# plt.subplot(1, 3, 3)
# plt.title("Overlay")
# plt.imshow(overlay)
# plt.axis("off")
#
# plt.tight_layout()
# plt.show()
import torch
import numpy as np
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
image_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\series_36_nodule_0\slice_2.png"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# =========================
# Load image
# =========================
img = Image.open(image_path).convert("RGB")
img = img.resize((224, 224))

# Original image for visualization
img_np = np.array(img).astype(np.float32) / 255.0

# Normalized image for model input
img_norm = img_np.copy()
img_norm = (img_norm - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]

input_tensor = torch.tensor(img_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)

# =========================
# Predict class
# =========================
with torch.no_grad():
    output = model(input_tensor)
    pred_class = output.argmax(dim=1).item()
    probs = torch.softmax(output, dim=1).cpu().numpy()[0]

print("Predicted class:", pred_class)
print("Probabilities:", probs)
print("Prediction:", "MALIGNANT" if pred_class == 1 else "BENIGN")

# =========================
# Grad-CAM
# =========================
target_layers = [model.backbone.features[-1]]

cam = GradCAM(model=model, target_layers=target_layers)

targets = [ClassifierOutputTarget(pred_class)]
grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]

# Smooth CAM
grayscale_cam = cv2.GaussianBlur(grayscale_cam, (25, 25), 0)
grayscale_cam = grayscale_cam - grayscale_cam.min()
grayscale_cam = grayscale_cam / (grayscale_cam.max() + 1e-8)

# =========================
# Transparent overlay
# =========================
heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
heatmap = np.float32(heatmap) / 255.0

overlay = img_np * 0.75 + heatmap * 0.25
overlay = np.clip(overlay, 0, 1)

# =========================
# Plot
# =========================
plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.title("Original")
plt.imshow(img_np)
plt.axis("off")

plt.subplot(1, 3, 2)
plt.title("Grad-CAM")
plt.imshow(grayscale_cam, cmap="jet")
plt.axis("off")

plt.subplot(1, 3, 3)
plt.title("Overlay")
plt.imshow(overlay)
plt.axis("off")

plt.tight_layout()
plt.show()