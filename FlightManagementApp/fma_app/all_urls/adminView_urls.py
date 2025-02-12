from django.urls import path
from fma_app.all_views import api_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = "fma_appAdminViewAPI"

urlpatterns = [
    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Management
    path('api/admin/users/', api_views.manage_users, name='manage_users'),  # GET & POST
    path('api/admin/users/<int:user_id>/', api_views.modify_customer, name='modify_user'),  # PUT & DELETE
    path('api/admin/users/<int:user_id>/convert-to-airline/', api_views.convert_to_airline_company, name='convert_to_airline'),

    # Airline Management
    path('api/admin/airlines/', api_views.manage_airlines, name='manage_airlines'),  # GET & POST
    path('api/admin/airlines/<int:airline_id>/', api_views.modify_airline, name='modify_airline'),  # PUT & DELETE

    # Customer Management
    path('api/admin/customers/', api_views.view_customers, name='view_customers'),  # GET
    path('api/admin/customers/<int:customer_id>/', api_views.modify_customer, name='modify_customer'),  # PUT & DELETE

    
]
