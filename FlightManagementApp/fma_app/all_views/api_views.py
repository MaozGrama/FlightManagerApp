import json
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from fma_app.dal import CountryDAL
from fma_app.all_views.baseView import Airline
from fma_app.models import AirlineCompany, Flight, Payment, Ticket, Customer
from fma_app.serializers import AirlineSerializer, FlightSerializer, UpdateAirlineSerializer, UpdateFlightSerializer, UpdateUserSerializer, UpdateUserSerializer
from fma_app.facades.customerfacade import CustomerFacade
from fma_app.facades.airlinefacade import AirlineFacade
from fma_app.facades.facadebase import FacadeBase
from fma_app.forms import AirlineFilterForm, FlightFilterForm
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from django.contrib.auth.models import User
from fma_app.serializers import CustomerSerializer  # Assuming you have a serializer
from django.contrib.auth.hashers import make_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework.permissions import IsAdminUser
from fma_app.models import Country, AirlineCompany
from django.utils import timezone
CustomUser = get_user_model()

# Custom response helper
def custom_api_response(data, status_code=status.HTTP_200_OK):
    """Helper function to return consistent API responses."""
    response = JsonResponse(data, status=status_code, safe=False)
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response["Access-Control-Allow-Credentials"] = "true"
    return response

# Flight Views
@api_view(['GET', 'POST'])
def flight_list(request):
    """Handles fetching all flights (GET) or creating a new flight (POST)."""
    if request.method == 'GET':
        try:
            flights = Flight.objects.all()
            serializer = FlightSerializer(flights, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        serializer = FlightSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Customer Views
facade = CustomerFacade()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_ticket(request, flight_id):
    """Allows a customer to book a ticket for a flight."""
    try:
        flight = facade.get_flight_by_id(id=flight_id)
        customer = request.user.customer
        ticket_data = {'flight_id': flight.id, 'customer_id': customer.id}
        facade.add_ticket(data=ticket_data)
        return Response({'message': 'Ticket booked successfully!'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_tickets(request):
    """Fetches and displays tickets for the current customer."""
    try:
        customer = request.user.customer
        my_tickets = facade.get_my_tickets(customer_id=customer.id)
        return Response(my_tickets, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_ticket(request, ticket_id):
    """Removes a ticket based on ticket ID."""
    try:
        facade.remove_ticket(id=ticket_id)
        return Response({'message': 'Ticket removed successfully!'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.contrib.auth import get_user_model
CustomUser = get_user_model()  # If using a custom user model

from rest_framework.response import Response
from rest_framework.decorators import api_view
from fma_app.models import CustomUser, Customer
from fma_app.serializers import CustomerSerializer

@api_view(['POST'])
def add_customer(request):
    
    try:
        data = request.data

        # Debug: Print the incoming request data to the console
        print("Received Data:", data)

        # Define the required fields
        required_fields = [
            'username', 'email', 'password1', 'password2', 
            'first_name', 'last_name', 'address', 
            'phone_no', 'credit_card_no'
        ]
        
        # Validate: Check for missing or empty required fields
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            return Response({'error': f'Missing or empty fields: {", ".join(missing_fields)}'}, status=400)

        # Validate: Check if passwords match
        if data['password1'] != data['password2']:
            return Response({'error': 'Passwords do not match'}, status=400)

        # Validate: Email format
        try:
            validate_email(data['email'])
        except ValidationError:
            return Response({'error': 'Invalid email format'}, status=400)

        # Validate: Check if username already exists
        if CustomUser.objects.filter(username=data['username']).exists():
            return Response({'error': 'Username already exists'}, status=400)

        # Validate: Check if email already exists
        if CustomUser.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already exists'}, status=400)

        # Validate: Ensure phone number contains only digits
        if not data['phone_no'].isdigit():
            return Response({'error': 'Phone number must contain only digits'}, status=400)

        # Validate: Ensure credit card number contains only digits
        if not data['credit_card_no'].isdigit():
            return Response({'error': 'Credit card number must contain only digits'}, status=400)

        # Validate: Ensure password meets Django's standards
        try:
            validate_password(data['password1'])
        except ValidationError as e:
            return Response({'error': f'Password error: {"; ".join(e.messages)}'}, status=400)

        # Create user and customer in a transaction to ensure atomicity
        with transaction.atomic():
            # Create the user
            user = CustomUser.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password1']
            )

            # Create the Customer instance
            customer = Customer.objects.create(
                user=user,
                first_name=data['first_name'],
                last_name=data['last_name'],
                address=data['address'],
                phone_no=data['phone_no'],
                credit_card_no=data['credit_card_no'],
            )

        # Serialize and return the customer data
        customer_data = CustomerSerializer(customer).data
        return Response({
            'message': 'Customer created successfully.',
            'customer': customer_data
        }, status=201)

    except Exception as e:
        # Log or print the exception for debugging
        print(f"Unexpected error: {e}")
        return Response({'error': 'An unexpected error occurred. Please try again.'}, status=400)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request, flight_id):
    """Process payment for a flight ticket."""
    try:
        flight = Flight.objects.get(id=flight_id)
        payment_method = request.data.get('payment_method')
        payment_details = request.data.get('payment_details', {})
        amount = request.data.get('amount')

        # Validate payment method
        if payment_method not in ['visa', 'paypal']:
            return Response(
                {'error': 'Invalid payment method'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Process payment based on method
        if payment_method == 'visa':
            # Validate credit card details
            required_fields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName']
            if not all(field in payment_details for field in required_fields):
                return Response(
                    {'error': 'Missing required credit card details'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Here you would typically integrate with a payment processor
            # For demonstration, we'll simulate payment processing
            payment_successful = True  # In reality, this would be the result of payment processing
            
        elif payment_method == 'paypal':
            # Here you would typically redirect to PayPal or process PayPal payment
            # For demonstration, we'll simulate payment processing
            payment_successful = True  # In reality, this would be the result of PayPal processing

        if payment_successful:
            # Create payment record
            payment = Payment.objects.create(
                user=request.user,
                amount=amount,
                payment_method=payment_method,
                status='completed'
            )
            
            return Response({
                'status': 'success',
                'payment_id': payment.id
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'failed',
                'error': 'Payment processing failed'
            }, status=status.HTTP_400_BAD_REQUEST)

    except Flight.DoesNotExist:
        return Response(
            {'error': 'Flight not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_customer_details(request):
    """Fetches the details of the customer including payment methods."""
    try:
        user = request.user
        customer = Customer.objects.get(user=user)
        
        # Get customer's tickets with payment information
        tickets = Ticket.objects.filter(customer=customer).select_related('payment')
        
        # Get available flights
        available_flights = Flight.objects.filter(
            departure_time__gt=timezone.now()
        ).exclude(
            id__in=tickets.values_list('flight_id', flat=True)
        )

        response_data = {
            'username': user.username,
            'tickets': [{
                'flight_id': ticket.flight.id,
                'date': ticket.flight.departure_time,
                'payment_method': ticket.payment.payment_method if ticket.payment else None,
                'payment_status': ticket.payment.status if ticket.payment else None
            } for ticket in tickets],
            'available_flights': [{
                'id': flight.id,
                'origin': flight.origin_country_id.name,
                'destination': flight.destination_country_id.name,
                'price': flight.price,
                'departure_time': flight.departure_time
            } for flight in available_flights]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Customer.DoesNotExist:
        return Response(
            {'error': 'Customer not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# Profile Update Vie`ws`
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_customer_profile(request):
    """Allows customers to update their profile."""
    customer = request.user.customer
    serializer = UpdateUserSerializer(customer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Logout View
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logs out the current user."""
    logout(request)
    return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)

# Login View with JWT
def get_token_for_user(user):
    """Generates a JWT token for the given user."""
    refresh = RefreshToken.for_user(user)
    refresh['roles'] = [group.name for group in user.groups.all()]
    refresh['username'] = user.username
    return str(refresh.access_token)

@api_view(['POST'])
def login_view(request):
    """Handles user login via API and redirects based on user role."""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        token = get_token_for_user(user)

        # Check user role and assign correct redirect URL
        if user.role == 'Admin' or user.is_superuser:
            redirect_url = '/admin/dashboard/'  # Admin dashboard route
        elif 'customer' in [group.name for group in user.groups.all()]:
            redirect_url = '/customer/dashboard/'  # Customer dashboard route
        elif 'airline' in [group.name for group in user.groups.all()]:
            redirect_url = '/airline/dashboard/'  # Airline dashboard route
        else:
            redirect_url = '/'  # Default route

        return Response({
        'token': token,
        'redirect_url': redirect_url,
        'username': user.username,
         "role": user.role,  # Send the user's role to frontend
},      status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# fma_app/all_views/api_views.py

@api_view(['GET'])
def get_all_flights(request):
    """Fetches all flights from the database."""
    try:
        flights = Flight.objects.all()
        serializer = FlightSerializer(flights, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Airline Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_airlines(request):
    """Fetches all airlines or filters them by country."""
    facade = FacadeBase()
    try:
        airlines = facade.get_all_airlines()
        if request.method == 'POST':
            form = AirlineFilterForm(request.data)
            if form.is_valid():
                country = form.cleaned_data['country']
                airlines = facade.get_airline_by_country(country_id=country)
        return Response({'airlines': [airline.to_dict() for airline in airlines]}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Flight Filtering Views
@api_view(['GET', 'POST'])
def get_my_flights(request):
    """Fetches all flights or filters them based on given criteria."""
    facade = FacadeBase()
    try:
        all_flights = facade.get_my_flights()
        if request.method == 'POST':
            form = FlightFilterForm(request.data)
            if form.is_valid():
                filtered_flights = all_flights

                # Apply filters from the form data
                if form.cleaned_data['origin_country']:
                    filtered_flights = filtered_flights.filter(
                        origin_country=form.cleaned_data['origin_country']
                    )
                if form.cleaned_data['destination_country']:
                    filtered_flights = filtered_flights.filter(
                        destination_country=form.cleaned_data['destination_country']
                    )
                if form.cleaned_data['departure_date']:
                    filtered_flights = filtered_flights.filter(
                        departure_time=form.cleaned_data['departure_date']
                    )
                if form.cleaned_data['landing_date']:
                    filtered_flights = filtered_flights.filter(
                        landing_time=form.cleaned_data['landing_date']
                    )
                if form.cleaned_data['airline_company']:
                    filtered_flights = filtered_flights.filter(
                        airline_company=form.cleaned_data['airline_company']
                    )

                return Response({'flights': [flight.to_dict() for flight in filtered_flights]}, status=status.HTTP_200_OK)

        return Response({'flights': [flight.to_dict() for flight in all_flights]}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET', 'POST'])
def airline_generic(request):
    """Handles generic airline-related actions."""
    if request.method == 'GET':
        # Logic for getting airline-related data
        return Response({'message': 'Airline data retrieved successfully'})

    elif request.method == 'POST':
        # Logic for creating or updating airline data
        data = request.POST
        # Process the data, e.g.:
        # airline = Airline.objects.create(name=data['name'], ...)
        return Response({'message': 'Airline data saved successfully'}, status=201)
# Airline Update Views
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def update_airline(request):
    """Update airline company details."""
    if request.method == 'GET':
        airline = request.user.airlinecompany
        user = request.user
        airline_data = UpdateAirlineSerializer(airline).data
        user_data = UpdateUserSerializer(user).data
        return Response({"airline": airline_data, "user": user_data}, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        airline = request.user.airlinecompany
        user = request.user
        airline_serializer = UpdateAirlineSerializer(airline, data=request.data)
        user_serializer = UpdateUserSerializer(user, data=request.data)

        if airline_serializer.is_valid() and user_serializer.is_valid():
            airline_serializer.save()
            user_serializer.save()
            return Response({"message": "Airline updated successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"errors": airline_serializer.errors + user_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
def add_flight(request):
    """Adds a new flight to the system."""
    try:
        # Deserialize the incoming data
        serializer = FlightSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['PUT'])
def update_flight(request, flight_id):
    """Updates the details of a specific flight."""
    try:
        # Fetch the flight to update
        flight = Flight.objects.get(id=flight_id)
        serializer = UpdateFlightSerializer(flight, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Flight.DoesNotExist:
        return Response({'error': 'Flight not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['DELETE'])
def remove_flight(request, flight_id):
    """Deletes a specific flight."""
    try:
        # Fetch the flight to delete
        flight = Flight.objects.get(id=flight_id)
        flight.delete()
        return Response({'message': 'Flight deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Flight.DoesNotExist:
        return Response({'error': 'Flight not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User, Group, Permission

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import Group
from fma_app.models import CustomUser
from django.core.exceptions import ObjectDoesNotExist

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_statistics(request):
    """
    Fetch statistics for the admin dashboard.
    """
    try:
        customer_count = CustomUser.objects.filter(groups__name='Customer').count()
        airline_count = CustomUser.objects.filter(groups__name='Airline').count()
        admin_count = CustomUser.objects.filter(groups__name='Admin').count()
        return Response({
            "customer_count": customer_count,
            "airline_count": airline_count,
            "admin_count": admin_count,
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET', 'POST', 'DELETE', 'PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def manage_users(request):
    """
    Manage users: retrieve, create, delete, or update.
    """
    try:
        if request.method == 'GET':  # Retrieve users
            users = CustomUser.objects.all().values('id', 'username', 'email', 'is_active', 'date_joined')
            return Response(list(users), status=200)

        if request.method == 'POST':  # Create user
            data = request.data
            role = data.pop('role', None)
            user = CustomUser.objects.create_user(**data)
            if role:
                group, _ = Group.objects.get_or_create(name=role)
                user.groups.add(group)
            return Response({'message': 'User created successfully.'}, status=201)

        if request.method == 'DELETE':  # Delete user
            user_id = request.data.get('user_id')
            user = CustomUser.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully.'}, status=200)

        if request.method == 'PUT':  # Update user (Full Update)
            user_id = request.data.get('user_id')
            updates = request.data.get('updates', {})
            user = CustomUser.objects.get(id=user_id)
            for key, value in updates.items():
                setattr(user, key, value)
            user.save()
            return Response({'message': 'User updated successfully.'}, status=200)

        if request.method == 'PATCH':  # Update user (Partial Update)
            user_id = request.data.get('user_id')
            updates = request.data
            user = CustomUser.objects.get(id=user_id)
            for key, value in updates.items():
                setattr(user, key, value)
            user.save()
            return Response({'message': 'User updated successfully.'}, status=200)

    except ObjectDoesNotExist:
        return Response({'error': 'User not found.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

# --- Helper Functions ---
def assign_role_to_user(user, role_name):
    group, _ = Group.objects.get_or_create(name=role_name)
    user.groups.clear()  # Remove from all groups
    user.groups.add(group)

# --- Admin User Management ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_admin(request):
    """Create a new admin user."""
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not all([username, email, password]):
        return Response({"error": "All fields are required."}, status=400)

    if CustomUser.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=400)

    if CustomUser.objects.filter(email=email).exists():
        return Response({"error": "Email already exists."}, status=400)

    user = CustomUser.objects.create_user(username=username, email=email, password=password)
    assign_role_to_user(user, "Admin")
    return Response({"message": "Admin user created successfully."}, status=201)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def remove_user(request, user_id):
    """Delete a user by ID."""
    try:
        user = CustomUser.objects.get(id=user_id)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=200)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

# --- Airline Management ---
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def manage_airlines(request):
    """Add or view all airlines."""
    if request.method == "GET":
        airlines = AirlineCompany.objects.all()
        serializer = AirlineSerializer(airlines, many=True)
        return Response(serializer.data, status=200)

    elif request.method == "POST":
        serializer = AirlineSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def modify_airline(request, airline_id):
    """Edit or delete an airline."""
    try:
        airline = AirlineCompany.objects.get(id=airline_id)
        if request.method == "PUT":
            serializer = AirlineSerializer(airline, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)

        elif request.method == "DELETE":
            airline.delete()
            return Response({"message": "Airline deleted successfully."}, status=204)
    except AirlineCompany.DoesNotExist:
        return Response({"error": "Airline not found."}, status=404)

# --- Customer Management ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def view_customers(request):
    """View all customers."""
    customers = Customer.objects.all()
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data, status=200)

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from fma_app.models import Customer
from fma_app.serializers import CUserSerializer, CustomerSerializer

User = get_user_model()

@api_view(["PUT", "DELETE"])
@permission_classes([IsAdminUser])
def modify_customer(request, user_id):
    """Edit or delete a user (Customer, Admin, or Airline)."""
    try:
        # 🔹 Check if user exists in CustomUser model
        user = User.objects.get(id=user_id)
        
        # 🔹 Check if user is also a Customer (optional)
        try:
            customer = Customer.objects.get(user=user)
        except Customer.DoesNotExist:
            customer = None  # User is not a Customer, but still exists
        
        if request.method == "PUT":
            print("Received data:", request.data)  # Debug print
            
            # 🔹 If user is a Customer, use CustomerSerializer
            if customer:
                serializer = CustomerSerializer(customer, data=request.data, partial=True)
            else:
                serializer = CUserSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                print("Validated data:", serializer.validated_data)  # Debug print
                serializer.save()
                print("After save:", serializer.data)  # Debug print
                return Response(serializer.data, status=200)
                
            print("Serializer errors:", serializer.errors)  # Debug print
            return Response(serializer.errors, status=400)

        elif request.method == "DELETE":
            if customer:
                customer.delete()  # Delete customer profile if exists
            user.delete()  # Delete user from CustomUser
            return Response({"message": "User deleted successfully."}, status=204)

    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manage_airline_countries(request):
    """List all countries"""
    if request.user.role != 'Airline':
        return Response({
            'error': 'Only airline users can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get all countries from the database using your DAL
    countries = CountryDAL.get_all_countries()
    
    if countries:
        return Response({
            'countries': [{'id': country.id, 'name': country.name} for country in countries]
        })
    else:
        return Response({
            'error': 'No countries found'
        }, status=status.HTTP_404_NOT_FOUND)

    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_flight(request):
    # Ensure the user is an airline
    try:
        airline = AirlineCompany.objects.get(user=request.user)
    except AirlineCompany.DoesNotExist:
        return Response({
            'error': 'Only airline companies can create flights'
        }, status=status.HTTP_403_FORBIDDEN)

    # Validate and create the flight
    serializer = FlightSerializer(data={
        **request.data,
        'airline_company_id': airline.id
    })

    if serializer.is_valid():
        try:
            # Validate countries exist
            origin_country = Country.objects.get(id=request.data.get('origin_country_id'))
            destination_country = Country.objects.get(id=request.data.get('destination_country_id'))

            # Create the flight
            flight = serializer.save(
                airline_company_id=airline,
                origin_country_id=origin_country,
                destination_country_id=destination_country
            )

            return Response(FlightSerializer(flight).data, status=status.HTTP_201_CREATED)
        
        except Country.DoesNotExist:
            return Response({
                'error': 'Invalid origin or destination country'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_airline_company(request):
    try:
        airline = AirlineCompany.objects.get(user=request.user)
        serializer = AirlineSerializer(airline)
        return Response({'airline': serializer.data})
    except AirlineCompany.DoesNotExist:
        return Response({'error': 'Airline not found'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def convert_to_airline_company(request, user_id):
    try:
        # Detailed logging
        print(f"Convert to Airline Company - User ID: {user_id}")
        print(f"Request User: {request.user}")
        print(f"Request User Role: {getattr(request.user, 'role', 'No Role')}")

        # Fetch the user
        user = CustomUser.objects.get(id=user_id)
        
        # More detailed logging
        print(f"Found User: {user}")
        print(f"User Role: {user.role}")
        
        # Verify user role is Airline
        if user.role != 'Airline':
            return Response({
                'error': 'User role is not Airline',
                'current_role': user.role
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if airline company already exists
        existing_airline = AirlineCompany.objects.filter(user=user).first()
        if existing_airline:
            return Response({
                'message': 'Airline company already exists',
                'airline_company_id': existing_airline.id
            }, status=status.HTTP_200_OK)
        
        # Logging country information
        first_country = Country.objects.first()
        print(f"First Country: {first_country}")
        
        # Create AirlineCompany record - Pass the Country instance directly
        airline_company = AirlineCompany.objects.create(
            user=user,
            name=user.username,
            country_id=first_country  # Just pass the Country instance directly
        )
        
        return Response({
            'message': 'Airline company created successfully',
            'airline_company_id': airline_company.id
        }, status=status.HTTP_201_CREATED)
    
    except CustomUser.DoesNotExist:
        print(f"User not found: {user_id}")
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Comprehensive error logging
        print(f"Conversion error: {str(e)}")
        print(f"Error Type: {type(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'error': 'Internal server error during conversion',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

import stripe  # You'll need to pip install stripe

stripe.api_key = 'your_stripe_secret_key'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    try:
        payment_method = request.data.get('method')
        amount = request.data.get('amount')
        flight_id = request.data.get('flightId')

        if payment_method == 'visa':
            # Create Stripe payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency='usd',
                payment_method_types=['card'],
                metadata={'flight_id': flight_id}
            )
            
            return Response({
                'success': True,
                'client_secret': payment_intent.client_secret
            })
            
        elif payment_method == 'paypal':
            # Implement PayPal payment logic here
            pass

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)