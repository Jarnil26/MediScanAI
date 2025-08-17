"""
URL patterns for reports app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_report, name='analyze_report'),
]
