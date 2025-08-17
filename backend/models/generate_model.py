import torch
import torch.nn as nn
from torchvision.models import resnet18

def get_num_classes():
    # Load label mapping if you saved to a file during training
    try:
        with open(r'D:\\AAA_Medical_AI\\medical-ai-platform\\backend\\models\\medmnist_global_labels.txt', 'r') as f:
            return sum(1 for line in f)
    except Exception:
        # Fallback: set manually
        return 29  # <-- change to actual number (len(master_labels))

class ResNet18(nn.Module):
    def __init__(self, in_channels=1, num_classes=None):
        super().__init__()
        if num_classes is None:
            num_classes = get_num_classes()
        self.model = resnet18(weights=None)  # No pretraining, matches training
        # Change the first conv layer if input is not RGB
        if in_channels != 3:
            self.model.conv1 = nn.Conv2d(in_channels, 64, kernel_size=7, stride=2, padding=3, bias=False)
        # Change the final FC layer for the number of classes
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)

    def forward(self, x):
        return self.model(x)

def generate_model(in_channels=1, num_classes=None):
    """
    Returns a ResNet18 model instance for MedMNIST unified classification.
    If num_classes is None, tries to infer from saved label map.
    """
    return ResNet18(in_channels=in_channels, num_classes=num_classes)
