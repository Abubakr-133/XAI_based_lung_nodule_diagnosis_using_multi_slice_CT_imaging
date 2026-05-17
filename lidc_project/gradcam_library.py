import torch
import numpy as np
import cv2
import matplotlib.pyplot as plt
from PIL import Image

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from model import LungNoduleModel
from project_paths import BEST_DENSENET121_BINARY_PATH, PROCESSED_DATA_DIR, env_or_path

# =========================
# Paths
# =========================
model_path = env_or_path("LND_MODEL_PATH", BEST_DENSENET121_BINARY_PATH)
image_path = env_or_path(
    "LND_SAMPLE_IMAGE",
    PROCESSED_DATA_DIR / "series_15_nodule_4" / "slice_4.png",
)

# =========================
# Device
# =========================
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

img_np = np.array(img).astype(np.float32) / 255.0
input_tensor = torch.tensor(img_np).permute(2, 0, 1).unsqueeze(0).float().to(device)

# =========================
# Predict class
# =========================
with torch.no_grad():
    output = model(input_tensor)
    pred_class = output.argmax(dim=1).item()
    probs = torch.softmax(output, dim=1).cpu().numpy()[0]

print("Predicted class:", pred_class)
print("Probabilities:", probs)

# =========================
# Grad-CAM
# =========================
target_layers = [model.backbone.features.transition3]
cam = GradCAM(model=model, target_layers=target_layers)

targets = [ClassifierOutputTarget(pred_class)]
grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]
# Smooth the Grad-CAM to reduce blockiness
grayscale_cam = cv2.GaussianBlur(grayscale_cam, (15, 15), 0)
grayscale_cam = grayscale_cam / grayscale_cam.max()
# =========================
# Overlay
# =========================
# Create softer overlay manually
# Normalize CAM
grayscale_cam = grayscale_cam - grayscale_cam.min()
grayscale_cam = grayscale_cam / (grayscale_cam.max() + 1e-8)

# Smooth it
grayscale_cam = cv2.GaussianBlur(grayscale_cam, (25, 25), 0)

# Create heatmap
heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
heatmap = np.float32(heatmap) / 255.0

# 🔥 KEY CHANGE: make it transparent
overlay = img_np * 0.7 + heatmap * 0.3   # <-- lighter heatmap

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
