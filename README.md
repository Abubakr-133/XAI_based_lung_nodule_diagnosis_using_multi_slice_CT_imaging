# Lung Nodule Diagnosis

This repository contains a lung nodule diagnosis system built around a DenseNet121 model, a FastAPI backend, and a Next.js frontend for DICOM slice upload, ROI selection, prediction, and Grad-CAM visualization.

## What works after clone

A fresh clone can run the inference app if you install dependencies:

- FastAPI backend in `lidc_project/`
- Next.js frontend in `frontend/`
- pretrained model weights already in `lidc_project/*.pth`
- metadata CSV files already in `lidc_project/processed_data/`

## What is not included

The following are intentionally not stored in GitHub:

- `lidc_project/raw_data/` LIDC raw dataset
- generated folders like `node_modules/`, `.next/`, `venv/`, `outputs/`
- large local-only preprocessing outputs not currently present in this checkout
- nested local repos `lidc_ui_v0/` and `lidc_project/ui/nextjs-dashboards-template/`

Because the raw LIDC data is not included, full retraining from scratch requires adding your own dataset locally.

## Repository layout

```text
Lung_nodule_diagnosis/
|-- README.md
|-- requirements.txt
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- hooks/
|   |-- lib/
|   |-- public/
|   |-- store/
|   |-- package.json
|   `-- .env.local.example
|-- lidc_project/
|   |-- api.py
|   |-- dataset.py
|   |-- model.py
|   |-- preprocess.py
|   |-- build_slice_metadata.py
|   |-- build_central_slice_metadata.py
|   |-- build_binary_metadata.py
|   |-- train.py
|   |-- train_binary.py
|   |-- evaluate.py
|   |-- evaluate_binary.py
|   |-- project_paths.py
|   |-- best_densenet121_binary.pth
|   |-- best_densenet121_central.pth
|   `-- processed_data/
`-- check_imbalance.py
```

## Backend requirements

- Python 3.10 or newer recommended
- Windows was the original development environment
- CUDA-capable GPU is optional, CPU also works

Install backend dependencies with:

```powershell
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
```

Main Python packages:

- `torch`
- `torchvision`
- `pandas`
- `numpy`
- `pydicom`
- `opencv-python`
- `Pillow`
- `matplotlib`
- `scikit-learn`
- `fastapi`
- `uvicorn`
- `python-multipart`
- `grad-cam`

## Frontend requirements

- Node.js 20 or newer recommended
- npm is used in the checked-in lockfile

Install frontend dependencies with:

```powershell
cd frontend
npm install
```

## Clone-and-run setup

### 1. Clone the repo

```powershell
git clone https://github.com/Abubakr-133/final_year_project.git
cd final_year_project
```

### 2. Create a Python virtual environment

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\venv\Scripts\Activate.ps1
```

### 3. Start the backend

Open terminal 1:

```powershell
cd lidc_project
uvicorn api:app --reload
```

Backend endpoints:

- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- prediction endpoint: [http://127.0.0.1:8000/predict](http://127.0.0.1:8000/predict)

### 4. Start the frontend

Open terminal 2:

```powershell
cd frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Open:

- frontend app: [http://localhost:3000](http://localhost:3000)

The frontend calls its own `/api/predict` route, which forwards requests to the FastAPI backend using:

`PREDICT_BACKEND_URL=http://127.0.0.1:8000/predict`

## How to use the app

1. Start the backend.
2. Start the frontend.
3. Open the frontend in the browser.
4. Upload DICOM slices.
5. Select a contiguous range of slices.
6. Draw an ROI on one selected slice.
7. Run diagnosis.
8. View the final prediction and Grad-CAM outputs.

## Running the backend without the frontend

You can also test directly from FastAPI Swagger UI:

1. start `uvicorn api:app --reload`
2. open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
3. use `POST /predict`
4. upload at least 2 cropped PNG slice images

The backend returns:

- final benign/malignant prediction
- averaged probabilities
- per-slice predictions
- Grad-CAM image URLs served from `/outputs/...`

## Included model files

These model files are present locally in the repo and can be committed for clone-and-run inference:

- `lidc_project/best_densenet121.pth`
- `lidc_project/best_densenet121_binary.pth`
- `lidc_project/best_densenet121_central.pth`
- `lidc_project/best_densenet121_improved.pth`

The API uses `lidc_project/best_densenet121_binary.pth` by default.

## Environment variables

Backend:

- `LND_MODEL_PATH`
  override the model weights file used by `api.py`
- `LND_OUTPUT_DIR`
  override where generated Grad-CAM files are written
- `LND_SAMPLE_IMAGE`
  optional sample image for Grad-CAM helper scripts
- `LND_SAMPLE_FOLDER`
  optional sample folder for nodule Grad-CAM helper scripts

Frontend:

- `PREDICT_BACKEND_URL`
  upstream backend prediction URL used by `frontend/app/api/predict/route.ts`

## Full training pipeline

Full training is possible, but not from GitHub alone. You need to add the raw LIDC-IDRI data locally.

### Step 1: place raw data

Put the LIDC DICOM folders and XML annotations into:

`lidc_project/raw_data/`

### Step 2: preprocess raw data

```powershell
cd lidc_project
py preprocess.py
```

This creates cropped nodule slice folders and base metadata in:

- `lidc_project/processed_data/`
- `lidc_project/processed_data/metadata.csv`

### Step 3: prepare split metadata

Training expects:

`lidc_project/processed_data/metadata_with_split.csv`

This file must contain:

- `series_id`
- `nodule_id`
- `patient_id`
- `label`
- `split`

Expected split values:

- `train`
- `val`
- `test`

### Step 4: create slice metadata

```powershell
py build_slice_metadata.py
py build_central_slice_metadata.py
py build_binary_metadata.py
```

Generated CSV files:

- `processed_data/slice_metadata.csv`
- `processed_data/slice_metadata_central.csv`
- `processed_data/slice_metadata_binary.csv`

### Step 5: train

3-class:

```powershell
py train.py
```

Binary:

```powershell
py train_binary.py
```

### Step 6: evaluate

```powershell
py evaluate.py
py evaluate_binary.py
py evaluate_nodule_level.py
py evaluate_binary_nodule_level.py
```

Useful checks:

```powershell
py test_model.py
py test_dataset.py
py check_data_size.py
```

## Notes

- Backend scripts now use relative project paths through `lidc_project/project_paths.py`.
- The clone-and-run path is aimed at inference and UI usage.
- Full preprocessing and training still depend on local medical image data that is too large to keep in the repo.
