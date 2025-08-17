import torch
from torchvision import transforms
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model
import torch.nn as nn
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# === MODEL PATHS ===
MODEL_PATHS = {
    "xray": "models/chestmnist_model.pth",
    "breast": "models/breastmnist_model.pth",
    "organ": "models/organmnist_model.pth",
    "brain_mri": "models/braintumor.h5"
}

# === TRANSFORM ===
transform = transforms.Compose([
    transforms.Grayscale(),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

# === CNN used for Chest, Breast, Organ ===
class SimpleCNN(nn.Module):
    def __init__(self, out_classes):
        super(SimpleCNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3), nn.ReLU(), nn.MaxPool2d(2),
        )
        self.classifier = nn.Linear(32 * 6 * 6, out_classes)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

# === Image-based model inference ===
def run_image_model(report_type, image_path):
    if report_type == "brain_mri":
        model = load_model(MODEL_PATHS["brain_mri"])
        img = Image.open(image_path).resize((64, 64))
        img_array = np.array(img.convert("L")) / 255.0
        img_array = img_array.reshape(1, 64, 64, 1)
        prediction = model.predict(img_array)[0][0]
        label = "Tumor Detected" if prediction > 0.5 else "No Tumor"
        confidence = float(prediction * 100)
        return {"prediction": label, "confidence": confidence}

    # For PyTorch models
    num_classes = 2 if report_type == "breast" else 3 if report_type == "brain" else 11
    model = SimpleCNN(out_classes=num_classes).to(device)
    model.load_state_dict(torch.load(MODEL_PATHS[report_type], map_location=device))
    model.eval()

    image = Image.open(image_path)
    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        probs = torch.softmax(output, dim=1)
        predicted = torch.argmax(probs, dim=1).item()
        confidence = float(probs[0][predicted]) * 100

    return {
        "prediction": f"Class {predicted}",
        "confidence": confidence
    }
