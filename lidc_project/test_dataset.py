from dataset import SliceDataset
from project_paths import SLICE_METADATA_CSV

csv_path = SLICE_METADATA_CSV

train_dataset = SliceDataset(csv_path, split="train")

print("Train dataset size:", len(train_dataset))

img, label = train_dataset[0]

print("Image shape:", img.shape)
print("Label:", label)
