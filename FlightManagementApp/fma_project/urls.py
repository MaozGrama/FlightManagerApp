"""fma_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.http import JsonResponse
from fma_app.all_views import api_views
from fma_app.all_views.api_views import get_customer_details
from fma_app.all_views.csrfView import csrf_view
from django.urls import path

@ensure_csrf_cookie
def csrf_token_view(request):
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})


urlpatterns = [
    path('api/csrf/', csrf_view, name='csrf'),
    path('', include("fma_app.all_urls.baseView_urls", namespace='fma_app_baseView')),
    path('', include("fma_app.all_urls.anonymousView_urls", namespace='fma_app_anonymousView')),
    path('', include("fma_app.all_urls.adminView_urls", namespace="fma_appAdminViewAPI")),
    path('', include("fma_app.all_urls.airlineView_urls", namespace='fma_app_airlineView')),
    path('api/login', include('fma_app.all_urls.anonymousView_urls')),
    path('', include('fma_app.all_urls.customerView_urls', namespace="fma_app_customerViewAPI")),
   
]