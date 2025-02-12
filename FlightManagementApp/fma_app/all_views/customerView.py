from django.shortcuts import render, redirect, HttpResponse
from django.http import HttpResponseServerError
from fma_app.forms import UpdateCustomUserForm, UpdateCustomUserForm
from fma_app.facades.customerfacade import CustomerFacade
from fma_app.decorators import allowed_users
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.contrib.auth import logout
from django.urls import reverse

facade = CustomerFacade()

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['customer'])



@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['customer'])
def add_ticket(request, flight_id):
    """
    Allows a customer to book a ticket for a flight.
    """
    try:
        flight = facade.get_flight_by_id(id=flight_id)
        customer = request.user.customer
        ticket_data = {
            'flight_id': flight.id,
            'customer_id': customer.id
        }
        facade.add_ticket(data=ticket_data)
        return render(request, 'fma_temp/customer.html', {'message': 'Ticket booked successfully!'})
    except Exception as e:
        print(f"Error adding ticket: {e}")
        return HttpResponse('Oops, Something Went Wrong')


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['customer'])
def get_my_tickets(request):
    """
    Fetches and displays tickets for the currently logged-in customer.
    """
    try:
        customer = request.user.customer
        my_tickets = facade.get_my_tickets(customer_id=customer.id)
        return render(request, 'fma_temp/customer_mytickets.html', {'my_tickets': my_tickets})
    except Exception as e:
        print(f"Error fetching tickets: {e}")
        return HttpResponse('Oops, Something Went Wrong')


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['customer'])
def remove_ticket(request, ticket_id):
    """
    Removes a ticket based on the ticket ID.
    """
    try:
        facade.remove_ticket(id=ticket_id)
        return redirect('fma_app_customerView:get_my_tickets')
    except Exception as e:
        print(f"Error removing ticket: {e}")
        return HttpResponseServerError('Failed to remove ticket: {}'.format(str(e)))


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['customer'])
def update_customer(request):
    """
    Allows the customer to update their personal details and user account information.
    """
    customer = request.user.customer
    user = request.user
    customer_form = UpdateCustomUserForm(instance=customer)
    user_form = UpdateCustomUserForm(instance=user)

    if request.method == 'POST':
        customer_form = UpdateCustomUserForm(request.POST, instance=customer)
        user_form = UpdateCustomUserForm(request.POST, instance=user)
        if customer_form.is_valid() and user_form.is_valid():
            try:
                with transaction.atomic():
                    facade.update_customer(customer_id=customer.id, data=customer_form.cleaned_data)
                    facade.update_user(id=user.id, data=user_form.cleaned_data)
                    return redirect('fma_app_customerView:customer_generic')
            except Exception as e:
                transaction.set_rollback(True)
                print(f"Error updating customer: {e}")
                return HttpResponseServerError('Failed to update customer and user data: {}'.format(str(e)))

    context = {
        'customer_form': customer_form,
        'user_form': user_form
    }
    return render(request, 'fma_temp/updatecustomer.html', context)


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['customer'])
def logout_view(request):
    """
    Logs out the current customer and redirects to the landing page.
    """
    logout(request)
    return redirect('fma_app_anonymousView:landing_page')   
