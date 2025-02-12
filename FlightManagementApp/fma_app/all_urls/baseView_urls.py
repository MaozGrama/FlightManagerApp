from django.urls import path
from fma_app.all_views import baseView , api_views

app_name = "fma_app_baseView"


urlpatterns = [

    # Flights urls
    path('get_all_flights/', baseView.Flight.get_all_flights, name='get_all_flights'),
    #Airlines urls
    path('get_all_airlines/', baseView.Airline.get_all_airlines, name='get_all_airlines'),
    path('api/airlines/', api_views.get_all_airlines, name='get_all_airlines'),
    path('api/flights/', api_views.get_all_flights, name='get_all_flights'),
    path('api/flights/', api_views.flight_list, name='flight_list')



]
