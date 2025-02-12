from django.shortcuts import render, redirect, HttpResponse
from django.contrib import messages
from django.urls import reverse
from django.db.models import Q
from fma_app.facades.facadebase import FacadeBase
from fma_app.forms import FlightFilterForm, AirlineFilterForm


class Airline:
    facadebase = FacadeBase()

    @classmethod
    def get_all_airlines(cls, request):
        try:
            airlines = cls.facadebase.get_all_airlines()

            if request.method == 'POST':
                form = AirlineFilterForm(request.POST)
                if form.is_valid():
                    country = form.cleaned_data['country']
                    if country:
                        airlines = cls.facadebase.get_airline_by_country(country_id=country)
                        return render(request, 'fma_app/airlines.html', {'airlines': airlines})

            form = AirlineFilterForm()
            context = {
                'form': form,
                'airlines': airlines
            }
            return render(request, 'fma_app/airlines.html', context)
        except Exception as e:
            print(f"An error occurred while fetching airlines: {e}")
            return HttpResponse('Oops, something went wrong while fetching airlines.', status=500)


class Flight:
    facadebase = FacadeBase()

    @classmethod
    def get_all_flights(cls, request):
        try:
            all_flights = cls.facadebase.get_all_flights()

            if request.method == 'POST':
                form = FlightFilterForm(request.POST)
                if form.is_valid():
                    origin_country = form.cleaned_data['origin_country']
                    destination_country = form.cleaned_data['destination_country']
                    departure_date = form.cleaned_data['departure_date']
                    landing_date = form.cleaned_data['landing_date']
                    airline_company = form.cleaned_data['airline_company']
                    filtered_flights = all_flights

                    if origin_country:
                        origin_flights = cls.facadebase.get_flights_by_origin_country_id(origin_country.id)
                        filtered_flights = filtered_flights.filter(id__in=origin_flights.values_list('id', flat=True))

                    if destination_country:
                        destination_flights = cls.facadebase.get_flights_by_destination_country_id(destination_country.id)
                        filtered_flights = filtered_flights.filter(id__in=destination_flights.values_list('id', flat=True))

                    if departure_date:
                        filtered_flights = filtered_flights.filter(departure_time__date=departure_date)

                    if landing_date:
                        filtered_flights = filtered_flights.filter(landing_time__date=landing_date)

                    if airline_company:
                        airline_flights = cls.facadebase.get_flights_by_airline_company(airline_company.id)
                        filtered_flights = filtered_flights.filter(id__in=airline_flights.values_list('id', flat=True))

                    if not filtered_flights.exists():
                        messages.error(request, 'No flights found matching your criteria.')
                        return redirect(reverse('fma_app_baseView:get_all_flights'))

                    return render(request, 'fma_app/flights.html', {'form': form, 'all_flights': filtered_flights})

            form = FlightFilterForm()
            context = {
                'form': form,
                'all_flights': all_flights,
            }
            return render(request, 'fma_app/flights.html', context)

        except Exception as e:
            print(f"An error occurred while fetching flights: {e}")
            return HttpResponse('Oops, something went wrong while fetching flights.', status=500)
