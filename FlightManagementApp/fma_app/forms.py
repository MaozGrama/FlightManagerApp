from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from .models import Customer, AirlineCompany, Flight, Country, Administrator
import re

# Use the Custom User Model
CustomUser = get_user_model()

# Login Form for authentication
class LoginForm(forms.Form):
    username = forms.CharField(label='Username')
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

# Custom User Creation Form
class CustomUserForm(UserCreationForm):
    role = forms.ChoiceField(choices=[('customer', 'Customer'), ('airline', 'Airline'), ('admin', 'Admin')], required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'role']

    def clean(self):
        cleaned_data = super().clean()

        # Username Validation
        username = cleaned_data.get('username', '').strip()
        username_pattern = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$')
        if not re.fullmatch(username_pattern, username):
            self.add_error('username', 'Username should contain English letters and numbers only')
        elif len(username) < 8 or len(username) > 20:
            self.add_error('username', 'Username should be between 8-20 characters')

        # Email Validation
        email = cleaned_data.get('email', '').strip()
        email_pattern = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
        if not re.fullmatch(email_pattern, email):
            self.add_error('email', 'Email is not valid')

        # Password Validation
        password1 = cleaned_data.get('password1', '').strip()
        password_pattern = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$')
        if not re.fullmatch(password_pattern, password1):
            self.add_error('password1', 'Password must contain English letters and numbers')
        elif len(password1) < 8 or len(password1) > 30:
            self.add_error('password1', 'Password should be between 8-30 characters')

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()

        # Create related profile based on role
        role = self.cleaned_data.get('role')

        if role == 'admin':
            Administrator.objects.create(user=user, first_name=user.username, last_name=user.username)
        elif role == 'airline':
            airline_company_name = f"Airline {user.username}"
            AirlineCompany.objects.create(user=user, name=airline_company_name, country_id=None)  # Update with appropriate country ID
        elif role == 'customer':
            Customer.objects.create(user=user, first_name=user.username, last_name=user.username,
                                    address='Default Address', phone_no='123456789', credit_card_no='1234567890123456')  # Example default values

        return user

# Update Custom User Form for User Editing
class UpdateCustomUserForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'email']

    def clean(self):
        cleaned_data = super().clean()

        # Username Validation
        username = cleaned_data.get('username', '').strip()
        username_pattern = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$')
        if not re.fullmatch(username_pattern, username):
            self.add_error('username', 'Username should contain English letters and numbers only')
        elif len(username) < 8 or len(username) > 20:
            self.add_error('username', 'Username should be between 8-20 characters')

        # Email Validation
        email = cleaned_data.get('email', '').strip()
        email_pattern = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
        if not re.fullmatch(email_pattern, email):
            self.add_error('email', 'Email is not valid')

        return cleaned_data

# User Profile and Registration Forms
class UserProfile(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2']

    def clean(self):
        cleaned_data = super().clean()

        # Username Validation
        username = cleaned_data.get('username', '').strip()
        username_pattern = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$')
        if not re.fullmatch(username_pattern, username):
            self.add_error('username', 'Username should contain English letters and numbers only')
        elif len(username) < 8 or len(username) > 20:
            self.add_error('username', 'Username should be between 8-20 characters')

        # Email Validation
        email = cleaned_data.get('email', '').strip()
        email_pattern = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
        if not re.fullmatch(email_pattern, email):
            self.add_error('email', 'Email is not valid')

        # Password Validation
        password1 = cleaned_data.get('password1', '').strip()
        password_pattern = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$')
        if not re.fullmatch(password_pattern, password1):
            self.add_error('password1', 'Password must contain English letters and numbers')
        elif len(password1) < 8 or len(password1) > 30:
            self.add_error('password1', 'Password should be between 8-30 characters')

# Add Customer Form
class AddCustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['first_name', 'last_name', 'address', 'phone_no', 'credit_card_no']

    def clean(self):
        cleaned_data = super().clean()

        # First Name Validation
        first_name = cleaned_data.get('first_name', '').strip()
        name_pattern = re.compile(r'^[A-Za-z ]+$')
        if not re.fullmatch(name_pattern, first_name):
            self.add_error('first_name', 'Name should contain only letters and spaces')
        elif len(first_name) < 3 or len(first_name) > 20:
            self.add_error('first_name', 'Name should be between 3-20 characters')

        # Last Name Validation
        last_name = cleaned_data.get('last_name', '').strip()
        if not re.fullmatch(name_pattern, last_name):
            self.add_error('last_name', 'Name should contain only letters and spaces')
        elif len(last_name) < 3 or len(last_name) > 20:
            self.add_error('last_name', 'Name should be between 3-20 characters')

        # Address Validation
        address = cleaned_data.get('address', '').strip()
        address_pattern = re.compile(r'^[A-Za-z0-9 .]+$')
        if not re.fullmatch(address_pattern, address):
            self.add_error('address', 'Address should contain only letters, numbers, spaces, and dots')
        elif len(address) < 5 or len(address) > 20:
            self.add_error('address', 'Address should be between 5-20 characters')

        # Phone Number Validation
        phone_no = cleaned_data.get('phone_no', '').strip()
        phone_pattern = re.compile(r'^\d{9,20}$')
        if not re.fullmatch(phone_pattern, phone_no):
            self.add_error('phone_no', 'Phone should contain 9-20 digits')

        # Credit Card Validation
        credit_card_no = cleaned_data.get('credit_card_no', '').strip()
        if len(credit_card_no) < 12 or len(credit_card_no) > 20:
            self.add_error('credit_card_no', 'Credit card number should be between 12-20 characters')

        return cleaned_data

# Other Forms (AddAirlineForm, AddAdminForm, etc.) remain the same...



class AddAirlineForm(forms.ModelForm):
    class Meta:
        model = AirlineCompany
        fields = ['name', 'country_id']

    def clean(self):
        cleaned_data = super().clean()

        # Name Validation
        name = cleaned_data.get('name', '').strip()
        name_pattern = re.compile(r'^[A-Za-z0-9]+$')
        if not re.fullmatch(name_pattern, name):
            self.add_error('name', 'Name should contain English letters and numbers only')
        elif len(name) < 4 or len(name) > 20:
            self.add_error('name', 'Name should be between 4-20 characters')


class UpdateAirlineForm(AddAirlineForm):
    pass


class AddAdminForm(forms.ModelForm):
    class Meta:
        model = Administrator
        fields = ['first_name', 'last_name']

    def clean(self):
        cleaned_data = super().clean()

        # First Name Validation
        first_name = cleaned_data.get('first_name', '').strip()
        name_pattern = re.compile(r'^[A-Za-z]+$')
        if not re.fullmatch(name_pattern, first_name):
            self.add_error('first_name', 'Name should contain English letters only')
        elif len(first_name) < 3 or len(first_name) > 20:
            self.add_error('first_name', 'Name should be between 3-20 characters')

        # Last Name Validation
        last_name = cleaned_data.get('last_name', '').strip()
        if not re.fullmatch(name_pattern, last_name):
            self.add_error('last_name', 'Name should contain English letters only')
        elif len(last_name) < 3 or len(last_name) > 20:
            self.add_error('last_name', 'Name should be between 3-20 characters')


class AddFlightForm(forms.ModelForm):
    departure_time = forms.DateTimeField(widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}, format='%Y-%m-%dT%H:%M'))
    landing_time = forms.DateTimeField(widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}, format='%Y-%m-%dT%H:%M'))

    class Meta:
        model = Flight
        fields = ['origin_country_id', 'destination_country_id', 'departure_time', 'landing_time', 'remaining_tickets']

    def clean(self):
        cleaned_data = super().clean()

        # Validate different countries
        origin_country_id = cleaned_data.get('origin_country_id')
        destination_country_id = cleaned_data.get('destination_country_id')
        if origin_country_id == destination_country_id:
            self.add_error('destination_country_id', 'Origin and destination countries cannot be the same')

        # Validate flight times
        departure_time = cleaned_data.get('departure_time')
        landing_time = cleaned_data.get('landing_time')
        if landing_time <= departure_time:
            self.add_error('landing_time', 'Landing time must be after departure time')

        # Validate tickets
        remaining_tickets = cleaned_data.get('remaining_tickets')
        if not (300 <= remaining_tickets <= 850):
            self.add_error('remaining_tickets', 'Tickets must be between 300 and 850')


class UpdateFlightForm(AddFlightForm):
    pass


class FlightFilterForm(forms.Form):
    origin_country = forms.ModelChoiceField(queryset=Country.objects.all(), empty_label="Select Origin Country", required=False)
    destination_country = forms.ModelChoiceField(queryset=Country.objects.all(), empty_label="Select Destination Country", required=False)
    departure_date = forms.DateTimeField(required=False, widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}))
    landing_date = forms.DateTimeField(required=False, widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}))
    airline_company = forms.ModelChoiceField(queryset=AirlineCompany.objects.all(), empty_label="Select Airline", required=False)


class AirlineFilterForm(forms.Form):
    country = forms.ModelChoiceField(queryset=Country.objects.all(), empty_label="Select Country", required=False)


class UserFilterForm(forms.Form):
    user_type = forms.ChoiceField(choices=(('customers', 'customers'), ('airlines', 'airlines'), ('admins', 'admins')))
