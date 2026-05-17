import torch
import torch.nn as nn
import torchvision.models as models
from torchvision.models import DenseNet121_Weights


class LungNoduleModel(nn.Module):
    def __init__(self, num_classes=3):
        super(LungNoduleModel, self).__init__()

        # Load pretrained DenseNet121
        self.backbone = models.densenet121(weights=DenseNet121_Weights.DEFAULT)

        # Replace classifier
        in_features = self.backbone.classifier.in_features
        self.backbone.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.backbone(x)