from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        """
        Creates and returns a regular user with an email and password.
        """
        if not username:
            raise ValueError(_('The Username field must be set'))
        if not password:
            raise ValueError(_('The Password field must be set'))

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """
        Creates and returns a superuser with an email, password, and superuser status.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')  # Ensure role is set to Admin for superuser

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(username, email, password, **extra_fields)


    def validate_username(self, username):
        """
        Ensure the username is unique by checking it against the CustomUser model.
        """
        if self.model.objects.filter(username__iexact=username).exists():
            raise ValidationError(_('Username is already taken'))



class Country(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Countries"


from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('Customer', 'Customer'),
        ('Admin', 'Admin'),
        ('Airline', 'Airline'),
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Customer')

    def is_customer(self):
        return self.role == 'Customer'
    # You can add additional custom fields here if necessary
    
    objects = CustomUserManager()

    def __str__(self):
        return self.username



class Administrator(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.first_name


class AirlineCompany(models.Model):
    name = models.CharField(max_length=255, unique=True)
    country_id = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='airlines')
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Airline companies"




class Customer(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone_no = models.CharField(max_length=255, unique=True)
    credit_card_no = models.CharField(max_length=255, unique=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer')

    def __str__(self):
        return self.first_name


class Flight(models.Model):
    airline_company_id = models.ForeignKey(AirlineCompany, on_delete=models.CASCADE, related_name='flights')
    origin_country_id = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='origin_flights')
    destination_country_id = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='destination_flights')
    departure_time = models.DateTimeField()
    landing_time = models.DateTimeField()
    remaining_tickets = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(departure_time__lt=models.F('landing_time')),
                name='check_departure_before_landing'
            )
        ]


class Ticket(models.Model):
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE, related_name='tickets')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='tickets')
    payment = models.ForeignKey('Payment', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['flight', 'customer'], name='unique_ticket_per_customer')
        ]
class Payment(models.Model):
    PAYMENT_METHODS = (
        ('visa', 'Visa'),
        ('paypal', 'PayPal'),
    )
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']