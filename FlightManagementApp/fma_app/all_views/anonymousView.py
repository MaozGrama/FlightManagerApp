from django.shortcuts import render, redirect, HttpResponse
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login
from django.urls import reverse
from django.middleware.csrf import get_token
from fma_app.forms import UserProfile, AddCustomerForm, LoginForm
from fma_app.facades.anonymousfacade import AnonymousFacade, AdministratorFacade, AirlineFacade, CustomerFacade
from fma_app.decorators import allowed_users
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.generic.edit import FormView
from django.contrib.auth.models import User
import json
from django.views.decorators.csrf import csrf_exempt

# Facade instance
facade = AnonymousFacade()

# Facade map for role-based redirection
REDIRECT_MAP = {
    AdministratorFacade: 'fma_app_adminView:admin_generic',
    AirlineFacade: 'fma_app_airlineView:airline_generic',
    CustomerFacade: 'fma_app_customerView:customer_generic',
}

# Helper function for generating JWT token
def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

# Helper function for custom JsonResponse
def custom_response(data, status=200):
    response = JsonResponse(data, status=status)
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Credentials"] = "true"
    return response

def landing_page(request):
    """Displays the landing page with login form."""
    form = LoginForm()
    return render(request, 'fma_temp/landing_page.html', {'form': form})

@csrf_exempt
def add_customer(request):
    """Allows anonymous users to register as customers."""
    if request.method == 'POST':
        user_form = UserProfile(request.POST)
        customer_form = AddCustomerForm(request.POST)

        if user_form.is_valid() and customer_form.is_valid():
            try:
                # Add customer through the AnonymousFacade
                facade.add_customer(user_data=user_form.cleaned_data, data=customer_form.cleaned_data)
                return JsonResponse({'success': True, 'message': 'Customer added successfully'}, status=201)
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        else:
            return JsonResponse({'success': False, 'errors': user_form.errors | customer_form.errors}, status=400)
    
    # Render the signup page with empty forms for GET requests
    user_form = UserProfile()
    customer_form = AddCustomerForm()
    context = {
        'user_form': user_form,
        'customer_form': customer_form,
    }
    return render(request, 'fma_temp/signup.html', context)
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.urls import reverse
import traceback

@csrf_exempt
def login_view(request):
    """Handles user login and redirects based on role."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)

    form = LoginForm(request.POST)
    if not form.is_valid():
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

    try:
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(request, username=username, password=password)

        if user is None:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)

        # Log in the user
        login(request, user)

        # Generate token and determine user facade
        token = get_token_for_user(user)
        print("Token generated:", token)  # Debugging
        right_facade = facade.get_facade_for_user(user=user, token=token)
        print("Facade returned:", right_facade)  # Debugging

        # Role-based redirection
        facade_class = type(right_facade)
        if facade_class in REDIRECT_MAP:
            redirect_url = reverse(REDIRECT_MAP[facade_class])
            return JsonResponse({
                'success': True,
                'redirect_url': redirect_url,
                'token': token
            }, status=200)

        return JsonResponse({'success': False, 'error': 'Invalid user type'}, status=400)

    except Exception as e:
        error_trace = traceback.format_exc()
        print("Error occurred:", error_trace)  # Debugging
        return JsonResponse({'success': False, 'error': 'An internal server error occurred'}, status=500)
