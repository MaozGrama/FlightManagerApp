from django.shortcuts import render, redirect, HttpResponse
from django.http import HttpResponseServerError
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

from fma_app.facades.adminfacade import AdministratorFacade
from fma_app.decorators import allowed_users
from fma_app.forms import UserProfile, AddCustomerForm, UserFilterForm, AddAirlineForm, AddAdminForm

facade = AdministratorFacade()

@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_generic(request):
    form = UserFilterForm()
    return render(request, 'fma_temp/admin.html', {'form': form})


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def user_choice(request):
    if request.method == 'POST':
        form = UserFilterForm(request.POST)
        if form.is_valid():
            user_type = form.cleaned_data['user_type']
            try:
                if user_type == 'customers':
                    return render(request, 'fma_temp/admin_customers.html', {'customers': facade.get_all_customers()})
                elif user_type == 'airlines':
                    return render(request, 'fma_temp/admin_airlines.html', {'airlines': facade.get_all_airlines()})
                elif user_type == 'admins':
                    return render(request, 'fma_temp/admin_admins.html', {'admins': facade.get_all_admins()})
            except Exception as e:
                messages.error(request, f"An error occurred while fetching data: {e}")
                return HttpResponse('Oops, Something went wrong!')
    else:
        form = UserFilterForm()
    return render(request, 'fma_temp/admin.html', {'form': form})


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_add_customer(request):
    return _handle_add_entity(
        request, 
        entity_name='customer',
        user_form_class=UserProfile,
        specific_form_class=AddCustomerForm,
        success_url='fma_app_adminView:user_choice',
        template='fma_temp/signup.html'
    )


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_add_airline(request):
    return _handle_add_entity(
        request,
        entity_name='airline',
        user_form_class=UserProfile,
        specific_form_class=AddAirlineForm,
        success_url='fma_app_adminView:user_choice',
        template='fma_temp/admin_add_airline.html'
    )


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_add_admin(request):
    return _handle_add_entity(
        request,
        entity_name='admin',
        user_form_class=UserProfile,
        specific_form_class=AddAdminForm,
        success_url='fma_app_adminView:user_choice',
        template='fma_temp/admin_add_admin.html'
    )


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_remove_customer(request, customer_id):
    return _handle_remove_entity(
        request,
        entity_name='customer',
        entity_id=customer_id,
        get_all_entities=facade.get_all_customers,
        error_message='Note! The selected Customer has active/purchased tickets and cannot be removed.',
        success_url='fma_app_adminView:user_choice',
        template='fma_temp/admin_customers.html'
    )


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_remove_airline(request, airline_id):
    return _handle_remove_entity(
        request,
        entity_name='airline',
        entity_id=airline_id,
        get_all_entities=facade.get_all_airlines,
        error_message="""Note! The selected Airline has active flights with purchased tickets, and cannot be removed.""",
        success_url='fma_app_adminView:user_choice',
        template='fma_temp/admin_airlines.html'
    )


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def admin_remove_admin(request, admin_id):
    try:
        facade.remove_administrator(id=admin_id)
        messages.success(request, "Admin removed successfully.")
    except Exception as e:
        messages.error(request, f"Failed to remove admin: {e}")
    return redirect('fma_app_adminView:user_choice')


@login_required(login_url='fma_app_anonymousView:landing_page')
@allowed_users(allowed_roles=['admin'])
def logout_view(request):
    logout(request)
    return redirect('fma_app_anonymousView:landing_page')


# Utility Functions
def _handle_add_entity(request, entity_name, user_form_class, specific_form_class, success_url, template):
    user_form = user_form_class(request.POST or None)
    specific_form = specific_form_class(request.POST or None)
    if request.method == 'POST' and user_form.is_valid() and specific_form.is_valid():
        try:
            add_method = getattr(facade, f'add_{entity_name}')
            add_method(user_data=user_form.cleaned_data, data=specific_form.cleaned_data)
            messages.success(request, f'{entity_name.capitalize()} added successfully!')
            return redirect(success_url)
        except Exception as e:
            messages.error(request, f"An error occurred while adding {entity_name}: {e}")
            return HttpResponse("Oops, Something Went Wrong!")
    context = {'user_form': user_form, f'{entity_name}_form': specific_form}
    return render(request, template, context)


def _handle_remove_entity(request, entity_name, entity_id, get_all_entities, error_message, success_url, template):
    try:
        remove_method = getattr(facade, f'remove_{entity_name}')
        if remove_method(id=entity_id):
            messages.success(request, f"{entity_name.capitalize()} removed successfully.")
            return redirect(success_url)
        else:
            context = {entity_name + 's': get_all_entities(), 'error': error_message}
            return render(request, template, context)
    except Exception as e:
        return HttpResponseServerError(f"Failed to remove {entity_name}: {e}")
