import pandas as pd
from pathlib import Path
from PIL import Image

from torch.utils.data import Dataset
from torchvision import transforms

from project_paths import PROJECT_DIR


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

        image_path = self._resolve_image_path(row["image_path"])
        label = int(row["label"])

        image = Image.open(image_path).convert("RGB")
        image = self.transform(image)

        return image, label

    @staticmethod
    def _resolve_image_path(raw_path):
        path_str = str(raw_path)
        path = Path(path_str)

        if path.exists():
            return path

        normalized = path_str.replace("\\", "/")
        marker = "/processed_data/"
        if marker in normalized:
            relative_tail = normalized.split(marker, 1)[1]
            fallback = PROJECT_DIR / "processed_data" / Path(relative_tail)
            if fallback.exists():
                return fallback

        fallback = PROJECT_DIR / path
        return fallback
