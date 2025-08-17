"""
URL patterns for symptoms app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.symptom_list, name='symptom_list'),
    path('by-category/', views.symptoms_by_category, name='symptoms_by_category'),
    path('search/', views.search_symptoms, name='search_symptoms'),
    path('create-samples/', views.create_sample_symptoms, name='create_sample_symptoms'),
]
