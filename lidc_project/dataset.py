import pandas as pd
from PIL import Image

from torch.utils.data import Dataset
from torchvision import transforms


class SliceDataset(Dataset):
    def __init__(self, csv_path, split=None, train=False):
        self.df = pd.read_csv(csv_path)

        if split is not None:
            self.df = self.df[self.df["split"] == split].reset_index(drop=True)
        else:
            self.df = self.df.reset_index(drop=True)

        # =========================
        # Transforms
        # =========================
        if train:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomRotation(10),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]

        image_path = row["image_path"]
        label = int(row["label"])

        image = Image.open(image_path).convert("RGB")
        image = self.transform(image)

        return image, label