from django.urls import path
from fma_app.all_views import api_views


app_name = "fma_app_customerViewAPI"


urlpatterns = [
    path('api/add_ticket/<int:flight_id>/', api_views.add_ticket, name='add_ticket'),
    path('api/get_my_tickets/', api_views.get_my_tickets, name='get_my_tickets'),
    path('api/remove_ticket/<int:ticket_id>/', api_views.remove_ticket, name='remove_ticket'),
    path('api/customer/update/', api_views.update_customer_profile, name='update_customer_profile'),
    path('api/logout/', api_views.logout_view, name='logout_view'),
    path('api/customer/details/', api_views.get_customer_details, name='customer_details'),
    path('api/process-payment/', api_views.process_payment, name='process-payment'),
    
]



