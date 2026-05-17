import torch
from model import LungNoduleModel

# Create model
model = LungNoduleModel()

# Dummy input
x = torch.randn(4, 3, 224, 224)

# Forward pass
output = model(x)

print("Output shape:", output.shape)