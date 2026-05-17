import os
import torch
import numpy as np
import cv2
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider
from PIL import Image

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from model import LungNoduleModel
from project_paths import BEST_DENSENET121_BINARY_PATH, PROCESSED_DATA_DIR, env_or_path

# =========================
# CONFIG
# =========================
model_path = env_or_path("LND_MODEL_PATH", BEST_DENSENET121_BINARY_PATH)
folder_path = env_or_path(
    "LND_SAMPLE_FOLDER",
    PROCESSED_DATA_DIR / "series_36_nodule_0",
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load model
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

target_layers = [model.backbone.features[-1]]
cam = GradCAM(model=model, target_layers=target_layers)

# =========================
# Load all slices
# =========================
slice_files = sorted([f for f in os.listdir(folder_path) if f.endswith(".png")])

originals = []
heatmaps = []
overlays = []
predictions = []
probabilities = []

print(f"Total slices found: {len(slice_files)}")

for file in slice_files:
    path = os.path.join(folder_path, file)

    img = Image.open(path).convert("RGB")
    img = img.resize((224, 224))
    img_np = np.array(img).astype(np.float32) / 255.0

    # Normalize for model
    img_norm = (img_np - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    input_tensor = torch.tensor(img_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)

    # Prediction
    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1).cpu().numpy()[0]
        pred_class = np.argmax(probs)

    # Grad-CAM
    targets = [ClassifierOutputTarget(pred_class)]
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]

    grayscale_cam = cv2.GaussianBlur(grayscale_cam, (25, 25), 0)
    grayscale_cam = (grayscale_cam - grayscale_cam.min()) / (grayscale_cam.max() + 1e-8)

    heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    heatmap = np.float32(heatmap) / 255.0

    overlay = img_np * 0.75 + heatmap * 0.25
    overlay = np.clip(overlay, 0, 1)

    originals.append(img_np)
    heatmaps.append(grayscale_cam)
    overlays.append(overlay)
    predictions.append(pred_class)
    probabilities.append(probs)

    print(f"{file} → {probs}")

# =========================
# Plot initial slice
# =========================
current_idx = 0

fig, axes = plt.subplots(1, 3, figsize=(14, 5))
plt.subplots_adjust(bottom=0.2)

img1 = axes[0].imshow(originals[current_idx])
axes[0].set_title("Original")
axes[0].axis("off")

img2 = axes[1].imshow(heatmaps[current_idx], cmap="jet")
axes[1].set_title("Grad-CAM")
axes[1].axis("off")

img3 = axes[2].imshow(overlays[current_idx])
axes[2].set_title("Overlay")
axes[2].axis("off")

title = fig.suptitle(
    f"Slice: {slice_files[current_idx]} | "
    f"Prediction: {'MALIGNANT' if predictions[current_idx] == 1 else 'BENIGN'} | "
    f"Prob: {probabilities[current_idx]}"
)

# =========================
# Slider
# =========================
ax_slider = plt.axes([0.2, 0.05, 0.6, 0.03])
slider = Slider(ax_slider, "Slice", 0, len(slice_files)-1, valinit=0, valstep=1)

def update(val):
    idx = int(slider.val)

    img1.set_data(originals[idx])
    img2.set_data(heatmaps[idx])
    img3.set_data(overlays[idx])

    title.set_text(
        f"Slice: {slice_files[idx]} | "
        f"Prediction: {'MALIGNANT' if predictions[idx] == 1 else 'BENIGN'} | "
        f"Prob: {probabilities[idx]}"
    )

    fig.canvas.draw_idle()

slider.on_changed(update)

plt.show()
