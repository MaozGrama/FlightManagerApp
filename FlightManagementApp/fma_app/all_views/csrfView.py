from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def csrf_view(request):
    """
    View to return a CSRF token as a JSON response.
    Ensures that the client receives a valid CSRF cookie.
    """
    return JsonResponse({'csrfToken': get_token(request)})
