from .facadebase import FacadeBase
from django.contrib.auth import authenticate, login
from fma_app.facades.adminfacade import AdministratorFacade
from fma_app.facades.airlinefacade import AirlineFacade
from fma_app.facades.customerfacade import CustomerFacade
from fma_app.exceptions import AccessDeniedError
from django.db import transaction
import json
import jwt  # PyJWT library


class AnonymousFacade(FacadeBase):

    def get_facade_for_user(self, user, token):
        """
        Determine the correct facade based on user groups and the JWT token.
        """
        try:
            # Decode the JWT token
            decoded_token = jwt.decode(token, options={"verify_signature": False})  # Disable signature verification for testing
            print(f"Decoded token: {decoded_token}")  # Debug: log the decoded token

            # Validate the token structure
            if not isinstance(decoded_token, dict) or 'roles' not in decoded_token:
                raise ValueError("Invalid token structure. Expected a dictionary with a 'roles' key.")

            user_groups = user.groups.all()
            for group in user_groups:
                if group.name == 'admin' and decoded_token['roles'] == ['admin']:
                    return AdministratorFacade()
                elif group.name == 'airline' and decoded_token['roles'] == ['airline']:
                    return AirlineFacade()
                elif group.name == 'customer' and decoded_token['roles'] == ['customer']:
                    return CustomerFacade()

            return AnonymousFacade()  # Default to AnonymousFacade if no role matches

        except jwt.DecodeError:
            raise ValueError("Failed to decode the token. Ensure it is a valid JWT.")
        except Exception as e:
            raise ValueError(f"An error occurred while processing the token: {str(e)}")

    def __init__(self):
        super().__init__(dals=['user_dal', 'customer_dal'])
        self.add_user_allowed = False

    @property
    def accessible_dals(self):
        return [
            ('user_dal', ['add_user'], ['get_user_by_username']),
            ('customer_dal', ['add_customer'])
        ]

    def __enable_add_user(self):
        """Private method to enable adding a user."""
        self.add_user_allowed = True

    def __disable_add_user(self):
        """Private method to disable adding a user."""
        self.add_user_allowed = False

    def add_customer(self, user_data, data):
        """
        Adds a new customer to the system. Ensures transactional integrity.
        """
        if self.check_access('customer_dal', 'add_customer'):
            self.__enable_add_user()
            try:
                group = self.group_dal.get_userRole_by_role(user_role='customer')
                with transaction.atomic():
                    new_user = self.user_dal.add_user(data=user_data)
                    if new_user is not None:
                        new_user.groups.add(group)
                        data['user_id'] = new_user
                        new_customer = self.customer_dal.add_customer(data=data)
                        return new_customer
            except Exception as e:
                print(f"An error occurred while adding a customer: {e}")
                return None
            finally:
                self.__disable_add_user()
        else:
            raise AccessDeniedError("Access denied to add a customer.")