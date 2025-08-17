"""
URL patterns for predictions app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_prediction, name='create_prediction'),
    path('history/', views.prediction_history, name='prediction_history'),
    path('stats/', views.user_stats, name='user_stats'),
    path('<str:prediction_id>/', views.prediction_detail, name='prediction_detail'),
]
