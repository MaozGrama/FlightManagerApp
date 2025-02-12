from rest_framework import serializers
from fma_app.models import AirlineCompany, Country, CustomUser, Customer, Flight

# --- User Serializer ---
class CUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']
        
# --- Country Serializer ---
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name']
       

# --- Airline Serializer ---
class AirlineSerializer(serializers.ModelSerializer):
    country = CountrySerializer(source='country_id', read_only=True)
    
    class Meta:
        model = AirlineCompany
        fields = ['id', 'name', 'country']

# --- Customer Serializer ---
class CustomerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email', read_only=True)  # keep email read-only if you don't want it updated
    role = serializers.CharField(source='user.role')

    class Meta:
        model = Customer
        fields = [
            'id', 'username', 'email', 'role', 'first_name', 'last_name',
            'address', 'phone_no', 'credit_card_no'
        ]

    def update(self, instance, validated_data):
        # Get the user data from validated_data
        user_data = validated_data.pop('user', {})
        
        # Update the User model
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Update the Customer model
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
    # Custom validation for unique fields
    def validate_phone_no(self, value):
        if Customer.objects.filter(phone_no=value).exists():
            raise serializers.ValidationError("Phone number must be unique.")
        return value

    def validate_credit_card_no(self, value):
        if Customer.objects.filter(credit_card_no=value).exists():
            raise serializers.ValidationError("Credit card number must be unique.")
        return value

# --- Flight Serializer ---
class FlightSerializer(serializers.ModelSerializer):
    origin_country_id = CountrySerializer(read_only=True)
    destination_country_id = CountrySerializer(read_only=True)
    airline_company_id = AirlineSerializer(read_only=True)

    class Meta:
        model = Flight
        fields = [
            'id', 
            'origin_country_id', 
            'destination_country_id', 
            'airline_company_id', 
            'departure_time', 
            'landing_time', 
            'remaining_tickets', 
            'price'
        ]

# --- Serializer for Adding a Flight ---
class AddFlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = [
            'origin_country_id', 'destination_country_id', 
            'departure_time', 'landing_time', 'remaining_tickets'
        ]

    def validate(self, data):
        # Custom validation for flights can go here
        return data

# --- Serializer for Updating a Flight ---
class UpdateFlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = [
            'origin_country_id', 'destination_country_id', 
            'departure_time', 'landing_time', 'remaining_tickets'
        ]

# --- Serializer for Updating an Airline ---
class UpdateAirlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = AirlineCompany
        fields = ['name', 'address', 'contact_number', 'email']

# --- Serializer for Updating a User ---
class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email']
        

