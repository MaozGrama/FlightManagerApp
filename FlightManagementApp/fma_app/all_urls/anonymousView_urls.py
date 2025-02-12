from django.urls import path
from fma_app.all_views import api_views
from fma_app.all_views import anonymousView

app_name = "fma_app_anonymousView_login"


urlpatterns = [
    path('',anonymousView.landing_page, name='landing_page'),
    path('api/add_customer/', api_views.add_customer, name='add_customer'),
    path('api/login/', api_views.login_view, name='login_view'),
]