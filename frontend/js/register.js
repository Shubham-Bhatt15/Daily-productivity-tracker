// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000';

// --- DOM Elements ---
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

// --- Event Listener ---
registerForm.addEventListener('submit', async (event) => {
    // 1. Prevent the default form submission which reloads the page.
    event.preventDefault();

    // 2. Clear any previous messages.
    messageDiv.textContent = '';
    messageDiv.className = '';

    // 3. Get user input from the form fields.
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 4. Send the data to the backend API.
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        // 5. Handle the server's response.
        if (!response.ok) {
            // If the server returns an error (e.g., 400 Bad Request), show it.
            throw new Error(data.message || 'Registration failed. Please try again.');
        }

        // 6. On successful registration, show a message and redirect to the login page.
        messageDiv.textContent = 'Registration successful! Redirecting to login...';
        messageDiv.classList.add('success');

        // Redirect to the login page so the user can sign in.
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        // 7. If any network error or server error occurs, display it.
        messageDiv.textContent = error.message;
        messageDiv.classList.add('error');
    }
});
