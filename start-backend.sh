#!/bin/bash

# Start Django Backend for Medical AI Platform

echo "🚀 Starting Medical AI Platform Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
echo "📥 Installing requirements..."
pip install -r requirements-updated.txt

# Run migrations
echo "🗄️ Running Django migrations..."
python manage.py migrate

# Create superuser if needed
echo "👤 Creating superuser (skip if exists)..."
python manage.py createsuperuser --noinput --email admin@medai.com --username admin || echo "Superuser already exists"

# Start Django development server
echo "🌐 Starting Django server on http://localhost:8000"
python manage.py runserver 0.0.0.0:8000
