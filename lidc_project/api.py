import os
import uuid
import io
import torch
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from typing import List

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from model import LungNoduleModel

# =========================
# CONFIG
# =========================
MODEL_PATH = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\best_densenet121_binary.pth"
OUTPUT_DIR = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\outputs"

os.makedirs(OUTPUT_DIR, exist_ok=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# =========================
# Load model once
# =========================
model = LungNoduleModel(num_classes=2).to(device)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()

target_layers = [model.backbone.features[-1]]
cam = GradCAM(model=model, target_layers=target_layers)

# =========================
# FastAPI app
# =========================
app = FastAPI(
    title="Lung Nodule Diagnosis API",
    description="Binary classification of lung nodules using multiple CT slices with Grad-CAM explainability",
    version="1.0.0"
)

app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# =========================
# Helper: preprocess uploaded image
# =========================
def preprocess_uploaded_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))

    img_np = np.array(img).astype(np.float32) / 255.0

    img_norm = (img_np - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    input_tensor = torch.tensor(img_norm).permute(2, 0, 1).unsqueeze(0).float().to(device)

    return img_np, input_tensor

# =========================
# Helper: save image
# =========================
def save_image(image_array, output_path):
    image_uint8 = np.uint8(np.clip(image_array, 0, 1) * 255)
    image_bgr = cv2.cvtColor(image_uint8, cv2.COLOR_RGB2BGR)
    cv2.imwrite(output_path, image_bgr)

# =========================
# Helper: generate Grad-CAM outputs
# =========================
def generate_gradcam_outputs(img_np, input_tensor, pred_class, slice_name):
    targets = [ClassifierOutputTarget(pred_class)]
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]

    grayscale_cam = cv2.GaussianBlur(grayscale_cam, (31, 31), 0)
    grayscale_cam = grayscale_cam - grayscale_cam.min()
    grayscale_cam = grayscale_cam / (grayscale_cam.max() + 1e-8)

    heatmap = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    heatmap = np.float32(heatmap) / 255.0

    overlay = img_np * 0.72 + heatmap * 0.28
    overlay = np.clip(overlay, 0, 1)

    uid = uuid.uuid4().hex
    base_name = os.path.splitext(slice_name)[0]

    original_filename = f"{uid}_{base_name}_original.png"
    heatmap_filename = f"{uid}_{base_name}_heatmap.png"
    overlay_filename = f"{uid}_{base_name}_overlay.png"

    original_path = os.path.join(OUTPUT_DIR, original_filename)
    heatmap_path = os.path.join(OUTPUT_DIR, heatmap_filename)
    overlay_path = os.path.join(OUTPUT_DIR, overlay_filename)

    save_image(img_np, original_path)
    save_image(heatmap, heatmap_path)
    save_image(overlay, overlay_path)

    return original_filename, heatmap_filename, overlay_filename

# =========================
# Predict endpoint (UPLOAD FILES)
# =========================
@app.post("/predict")
async def predict(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        return {
            "status": "error",
            "message": "Please upload at least 2 cropped slices."
        }

    slice_results = []
    all_probs = []

    for file in files:
        image_bytes = await file.read()

        img_np, input_tensor = preprocess_uploaded_image(image_bytes)

        with torch.no_grad():
            output = model(input_tensor)
            probs = torch.softmax(output, dim=1).cpu().numpy()[0]
            pred_class = int(np.argmax(probs))

        original_filename, heatmap_filename, overlay_filename = generate_gradcam_outputs(
            img_np=img_np,
            input_tensor=input_tensor,
            pred_class=pred_class,
            slice_name=file.filename
        )

        all_probs.append(probs)

        slice_results.append({
            "slice_name": file.filename,
            "predicted_class": pred_class,
            "prediction": "MALIGNANT" if pred_class == 1 else "BENIGN",
            "probabilities": {
                "benign": round(float(probs[0]), 4),
                "malignant": round(float(probs[1]), 4)
            },
            "outputs": {
                "original_image_url": f"http://127.0.0.1:8000/outputs/{original_filename}",
                "gradcam_heatmap_url": f"http://127.0.0.1:8000/outputs/{heatmap_filename}",
                "gradcam_overlay_url": f"http://127.0.0.1:8000/outputs/{overlay_filename}"
            }
        })

    all_probs = np.array(all_probs)
    avg_probs = np.mean(all_probs, axis=0)
    final_class = int(np.argmax(avg_probs))
    confidence = float(abs(avg_probs[1] - avg_probs[0]))

    return {
        "status": "success",
        "model_info": {
            "model_name": "DenseNet121 Binary Classifier",
            "input_size": [224, 224],
            "aggregation_method": "average_softmax"
        },
        "final_class": final_class,
        "final_prediction": "MALIGNANT" if final_class == 1 else "BENIGN",
        "avg_probabilities": {
            "benign": round(float(avg_probs[0]), 4),
            "malignant": round(float(avg_probs[1]), 4)
        },
        "confidence": round(confidence, 4),
        "num_slices": len(files),
        "slice_results": slice_results
    }