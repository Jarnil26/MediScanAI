from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from reports.views import analyze_report

# ✅ Import your custom views
from accounts.views import login_view, register_view, logout_view

urlpatterns = [
    path('admin/', admin.site.urls),

    # ✅ Use your own login, register, logout views
    path('api/auth/login/', login_view, name='custom_login'),
    path('api/auth/register/', register_view, name='custom_register'),
    path('api/auth/logout/', logout_view, name='custom_logout'),

    # ✅ Include accounts.urls if you need more
    path('api/auth/', include('accounts.urls')),
    # path('api/analyze-report/', analyze_report, name='analyze_report'),

    # Other APIs
    path('api/predictions/', include('predictions.urls')),
    path('api/symptoms/', include('symptoms.urls')),
    path('api/reports/', include('reports.urls')),

    # Health check
    path('health/', lambda request: HttpResponse('OK')),
]

# Media & Static (if in DEBUG)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
