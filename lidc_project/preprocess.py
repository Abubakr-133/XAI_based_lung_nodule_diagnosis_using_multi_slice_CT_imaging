import os
import numpy as np
import pandas as pd
import pydicom
import cv2
import xml.etree.ElementTree as ET

# Uses only unblindedReadNodule -> ≥3mm nodules
# Requires ≥2 radiologists
#  Uses full malignancy scale (1–5)
# 3-class mapping (0/1/2)
# Per-slice ROI cropping
# Merges bounding boxes across radiologists
# Adds padding
# Resizes to 224×224
# Stores patient_id
# Error-safe per series


# ==============================
# CONFIG
# ==============================

RAW_DATA_PATH = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\raw_data"
OUTPUT_PATH = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data"

os.makedirs(OUTPUT_PATH, exist_ok=True)

# ==============================
# INITIALIZE
# ==============================

metadata_rows = []
series_counter = 0

# ==============================
# WALK THROUGH RAW DATA
# ==============================

for root_dir, dirs, files in os.walk(RAW_DATA_PATH):
# for i, (root_dir, dirs, files) in enumerate(os.walk(RAW_DATA_PATH)):
#     if i > 50:   # process only first ~50 directories
#         break
    xml_files = [f for f in files if f.endswith(".xml")]
    if len(xml_files) == 0:
        continue

    print(f"\nProcessing series: {root_dir}")

    try:
        # ==============================
        # Extract Patient ID from path
        # ==============================
        path_parts = root_dir.split(os.sep)
        patient_id = None
        # for part in path_parts:
        #     if part.startswith("LIDC-IDRI-"):
        #         patient_id = part
        #         break
        patient_ids = [p for p in path_parts if p.startswith("LIDC-IDRI-")]

        if len(patient_ids) >= 2:
            patient_id = patient_ids[1]  # actual patient
        else:
            patient_id = patient_ids[0]

        # ==============================
        # Load DICOM slices
        # ==============================
        slices = []

        for file in files:
            if file.endswith(".dcm"):
                ds = pydicom.dcmread(os.path.join(root_dir, file))
                slices.append(ds)

        if len(slices) == 0:
            continue

        # Sort by Z position
        # slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))
        valid_slices = []

        for ds in slices:
            if hasattr(ds, "ImagePositionPatient"):
                valid_slices.append(ds)

        if len(valid_slices) < 5:
            # Not a valid CT stack
            continue

        valid_slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))

        slices = valid_slices
        dicom_z_positions = [float(ds.ImagePositionPatient[2]) for ds in slices]

        # ==============================
        # Convert to HU
        # ==============================
        volume = []
        for ds in slices:
            img = ds.pixel_array.astype(np.int16)
            hu = img * ds.RescaleSlope + ds.RescaleIntercept
            volume.append(hu)

        volume = np.stack(volume)

        # ==============================
        # Lung Window
        # ==============================
        window_center = -600
        window_width = 1500

        lower = window_center - window_width // 2
        upper = window_center + window_width // 2

        volume = np.clip(volume, lower, upper)
        volume = ((volume - lower) / (upper - lower)).astype(np.float32)

        # ==============================
        # Parse XML
        # ==============================
        xml_path = os.path.join(root_dir, xml_files[0])
        tree = ET.parse(xml_path)
        root = tree.getroot()

        namespace = {'ns': root.tag.split('}')[0].strip('{')}
        reading_sessions = root.findall(".//ns:readingSession", namespace)

        nodules_dict = {}

        for session in reading_sessions:
            nodules = session.findall(".//ns:unblindedReadNodule", namespace)

            for nodule in nodules:

                malignancy = nodule.find(".//ns:malignancy", namespace)
                if malignancy is None:
                    continue

                score = int(malignancy.text)

                rois = nodule.findall(".//ns:roi", namespace)
                slice_boxes = {}

                for roi in rois:
                    z_tag = roi.find(".//ns:imageZposition", namespace)
                    if z_tag is None:
                        continue

                    z = float(z_tag.text.strip())

                    x_coords = []
                    y_coords = []

                    edge_maps = roi.findall(".//ns:edgeMap", namespace)

                    for edge in edge_maps:
                        x = edge.find(".//ns:xCoord", namespace)
                        y = edge.find(".//ns:yCoord", namespace)

                        if x is not None and y is not None:
                            x_coords.append(int(x.text))
                            y_coords.append(int(y.text))

                    if len(x_coords) == 0:
                        continue

                    min_x, max_x = min(x_coords), max(x_coords)
                    min_y, max_y = min(y_coords), max(y_coords)

                    if z not in slice_boxes:
                        slice_boxes[z] = []

                    slice_boxes[z].append((min_x, max_x, min_y, max_y))

                nodule_key = tuple(sorted(slice_boxes.keys()))

                if nodule_key not in nodules_dict:
                    nodules_dict[nodule_key] = {
                        "scores": [],
                        "slices": {}
                    }

                nodules_dict[nodule_key]["scores"].append(score)

                for z, boxes in slice_boxes.items():
                    if z not in nodules_dict[nodule_key]["slices"]:
                        nodules_dict[nodule_key]["slices"][z] = []

                    nodules_dict[nodule_key]["slices"][z].extend(boxes)

        # ==============================
        # Save Processed Nodules
        # ==============================

        nodule_counter = 0

        for nodule_key, data in nodules_dict.items():

            scores = data["scores"]
            slice_data = data["slices"]

            # Minimum 2 radiologists
            if len(scores) < 2:
                continue

            avg_score = np.mean(scores)

            # 3-Class Label Mapping
            if avg_score <= 2:
                label = 0  # Benign
            elif 2 < avg_score < 4:
                label = 1  # Indeterminate
            elif avg_score >= 4:
                label = 2  # Malignant
            else:
                continue

            nodule_folder = os.path.join(
                OUTPUT_PATH,
                f"series_{series_counter}_nodule_{nodule_counter}"
            )
            os.makedirs(nodule_folder, exist_ok=True)

            saved_slice_count = 0

            for z, boxes in slice_data.items():

                closest_index = min(
                    range(len(dicom_z_positions)),
                    key=lambda i: abs(dicom_z_positions[i] - z)
                )

                slice_img = volume[closest_index]

                all_min_x = min([b[0] for b in boxes])
                all_max_x = max([b[1] for b in boxes])
                all_min_y = min([b[2] for b in boxes])
                all_max_y = max([b[3] for b in boxes])

                padding = 10
                min_x = max(all_min_x - padding, 0)
                min_y = max(all_min_y - padding, 0)
                max_x = min(all_max_x + padding, 511)
                max_y = min(all_max_y + padding, 511)

                cropped = slice_img[min_y:max_y, min_x:max_x]

                if cropped.size == 0:
                    continue

                resized = cv2.resize(cropped, (224, 224))
                slice_img_8bit = (resized * 255).astype(np.uint8)

                cv2.imwrite(
                    os.path.join(nodule_folder, f"slice_{saved_slice_count}.png"),
                    slice_img_8bit
                )

                saved_slice_count += 1

            if saved_slice_count == 0:
                continue

            metadata_rows.append([
                series_counter,
                nodule_counter,
                patient_id,
                label,
                round(avg_score, 2),
                saved_slice_count
            ])

            nodule_counter += 1

        series_counter += 1

    except Exception as e:
        print(f"Error in series {root_dir}: {e}")
        continue

# ==============================
# Save Metadata
# ==============================

metadata_df = pd.DataFrame(
    metadata_rows,
    columns=[
        "series_id",
        "nodule_id",
        "patient_id",
        "label",
        "avg_score",
        "num_slices"
    ]
)

metadata_df.to_csv(os.path.join(OUTPUT_PATH, "metadata.csv"), index=False)

print("\nDataset building complete.")
print("Total nodules:", len(metadata_df))