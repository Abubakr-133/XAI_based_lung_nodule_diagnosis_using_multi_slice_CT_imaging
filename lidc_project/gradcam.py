import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt

from model import LungNoduleModel
from project_paths import BEST_DENSENET121_BINARY_PATH, PROCESSED_DATA_DIR, env_or_path

# =========================
# Paths
# =========================
model_path = env_or_path("LND_MODEL_PATH", BEST_DENSENET121_BINARY_PATH)
image_path = env_or_path(
    "LND_SAMPLE_IMAGE",
    PROCESSED_DATA_DIR / "series_12_nodule_1" / "slice_5.png",
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
# Disable inplace ReLU
# =========================
for module in model.modules():
    if isinstance(module, nn.ReLU):
        module.inplace = False

# =========================
# Hook storage
# =========================
features = None
gradients = None

def forward_hook(module, input, output):
    global features
    features = output

def backward_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0]

# =========================
# Target layer
# =========================
target_layer = model.backbone.features[-1]

forward_handle = target_layer.register_forward_hook(forward_hook)
backward_handle = target_layer.register_full_backward_hook(backward_hook)

# =========================
# Load and preprocess image
# =========================
img = Image.open(image_path).convert("RGB")
img = img.resize((224, 224))

img_np = np.array(img).astype(np.float32) / 255.0

img_tensor = torch.tensor(img_np).permute(2, 0, 1).unsqueeze(0).float().to(device)

# =========================
# Forward pass
# =========================
output = model(img_tensor)
pred_class = output.argmax(dim=1).item()
probs = F.softmax(output, dim=1).detach().cpu().numpy()[0]

print("Predicted class:", pred_class)
print("Probabilities:", probs)

# =========================
# Backward pass
# =========================
model.zero_grad()
output[0, pred_class].backward()

# =========================
# Grad-CAM computation
# =========================
grads = gradients[0].detach().cpu().numpy()   # [C,H,W]
acts = features[0].detach().cpu().numpy()     # [C,H,W]

weights = np.mean(grads, axis=(1, 2))

cam = np.zeros(acts.shape[1:], dtype=np.float32)
for i, w in enumerate(weights):
    cam += w * acts[i]

cam = np.maximum(cam, 0)

if cam.max() != 0:
    cam = cam / cam.max()

cam = cv2.resize(cam, (224, 224))

# =========================
# Heatmap + overlay
# =========================
heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
heatmap = np.float32(heatmap) / 255.0

overlay = 0.4 * heatmap + 0.6 * img_np
overlay = np.clip(overlay, 0, 1)

# =========================
# Plot
# =========================
plt.figure(figsize=(14, 4))

plt.subplot(1, 3, 1)
plt.title("Original")
plt.imshow(img_np)
plt.axis("off")

plt.subplot(1, 3, 2)
plt.title("Grad-CAM")
plt.imshow(cam, cmap="jet")
plt.axis("off")

plt.subplot(1, 3, 3)
plt.title("Overlay")
plt.imshow(overlay)
plt.axis("off")

plt.tight_layout()
plt.show()

# =========================
# Cleanup
# =========================
forward_handle.remove()
backward_handle.remove()
