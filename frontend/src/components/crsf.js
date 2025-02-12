export async function getCSRFToken() {
    try {
      const response = await fetch('http://localhost:8000/api/csrf/', {
        credentials: 'include', // Important to include cookies
      });
      if (response.ok) {
        const data = await response.json();
        return data.csrfToken;
      } else {
        console.error('Failed to fetch CSRF token');
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }
  