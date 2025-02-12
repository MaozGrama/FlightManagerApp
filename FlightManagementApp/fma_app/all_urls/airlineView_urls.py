from django.urls import path
from fma_app.all_views import api_views

app_name = "fma_app_airlineAPI"

urlpatterns = [
    path('api/airline/airline-company/', api_views.get_airline_company, name='get_airline_company'),
    path('api/airline/countries/', api_views.manage_airline_countries, name='manage_airline_countries'),
    path('api/airline/flights/', api_views.get_all_flights, name='get_all_flights'),
    path('api/airline/flights/create/', api_views.create_flight, name='airline_company_flight_create')
]