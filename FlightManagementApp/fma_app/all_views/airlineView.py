from django.shortcuts import render, redirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseServerError
from django.contrib.auth import logout
from django.contrib import messages
from django.db import transaction
from fma_app.forms import UpdateAirlineForm, UpdateUserForm, AddFlightForm, UpdateFlightForm
from fma_app.facades.airlinefacade import AirlineFacade
from fma_app.decorators import allowed_users

facade = AirlineFacade()

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def airline_generic(request):
    return render(request, 'fma_temp/airline.html')

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def update_airline(request):
    airline_company = request.user.airlinecompany
    user = request.user
    airline_form = UpdateAirlineForm(instance=airline_company)
    user_form = UpdateUserForm(instance=user)

    if request.method == 'POST':
        airline_form = UpdateAirlineForm(request.POST, instance=airline_company)
        user_form = UpdateUserForm(request.POST, instance=user)

        if airline_form.is_valid() and user_form.is_valid():
            try:
                with transaction.atomic():
                    facade.update_airline(id=airline_company.id, data=airline_form.cleaned_data)
                    facade.update_user(id=user.id, data=user_form.cleaned_data)
                    messages.success(request, "Airline details updated successfully.")
                    return redirect('fma_app_airlineView:airline_generic')
            except Exception as e:
                transaction.set_rollback(True)
                messages.error(request, f"An error occurred: {e}")
                return HttpResponseServerError(f"Error: {str(e)}")
    
    context = {
        'airline_form': airline_form,
        'user_form': user_form,
    }
    return render(request, 'fma_temp/updateairline.html', context)

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def get_all_flights(request):
    try:
        airline_company = request.user.airlinecompany
        my_flights = facade.get_all_flights(airline_company_id=airline_company)
        return render(request, 'fma_temp/airline_all_flights.html', {'my_flights': my_flights})
    except Exception as e:
        messages.error(request, f"Error fetching flights: {e}")
        return HttpResponse('Oops, Something Went Wrong')

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def add_flight(request):
    form = AddFlightForm()

    if request.method == 'POST':
        form = AddFlightForm(request.POST)
        if form.is_valid():
            try:
                flight_data = {
                    'airline_company_id': request.user.airlinecompany,
                    'origin_country_id': form.cleaned_data['origin_country_id'],
                    'destination_country_id': form.cleaned_data['destination_country_id'],
                    'departure_time': form.cleaned_data['departure_time'],
                    'landing_time': form.cleaned_data['landing_time'],
                    'remaining_tickets': form.cleaned_data['remaining_tickets'],
                }
                facade.add_flight(data=flight_data)
                messages.success(request, "Flight added successfully.")
                return redirect('fma_app_airlineView:airline_generic')
            except Exception as e:
                messages.error(request, f"Error adding flight: {e}")
    
    context = {
        'form': form,
    }
    return render(request, 'fma_temp/addflight.html', context)

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def update_flight(request, flight_id):
    try:
        flight = facade.get_flight_by_id(id=flight_id)
    except Exception as e:
        messages.error(request, f"Flight not found: {e}")
        return redirect('fma_app_airlineView:get_my_flights')

    flight_form = UpdateFlightForm(instance=flight)
    if request.method == 'POST':
        flight_form = UpdateFlightForm(request.POST, instance=flight)
        if flight_form.is_valid():
            try:
                facade.update_flight(flight_id=flight_id, data=flight_form.cleaned_data)
                messages.success(request, "Flight updated successfully.")
                return redirect('fma_app_airlineView:get_my_flights')
            except Exception as e:
                messages.error(request, f"Error updating flight: {e}")

    context = {
        'flight_form': flight_form,
    }
    return render(request, 'fma_temp/updateflight.html', context)

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def remove_flight(request, flight_id):
    try:
        facade.remove_flight(flight_id=flight_id)
        messages.success(request, "Flight removed successfully.")
        return redirect('fma_app_airlineView:get_my_flights')
    except Exception as e:
        messages.error(request, f"Error removing flight: {e}")
        return HttpResponseServerError('Failed to remove flight: {}'.format(str(e)))

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['airline'])
def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('fma_app_anonymousView:landing_page')
