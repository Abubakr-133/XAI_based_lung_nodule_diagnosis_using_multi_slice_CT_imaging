from dataset import SliceDataset

csv_path = r"C:\Users\shaik\myProjects\Lung_nodule_diagnosis\lidc_project\processed_data\slice_metadata.csv"

train_dataset = SliceDataset(csv_path, split="train")

print("Train dataset size:", len(train_dataset))

img, label = train_dataset[0]

print("Image shape:", img.shape)
print("Label:", label)