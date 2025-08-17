// --- Configuration ---
// IMPORTANT: Make sure this URL matches your backend's address and port.
const API_BASE_URL = 'http://localhost:5000';

// --- DOM Elements ---
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

// --- Event Listener ---
loginForm.addEventListener('submit', async (event) => {
    // 1. Prevent the default form submission which reloads the page.
    event.preventDefault();

    // 2. Clear any previous messages.
    messageDiv.textContent = '';
    messageDiv.className = '';

    // 3. Get user input from the form fields.
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 4. Send the data to the backend API.
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        // 5. Handle the server's response.
        if (!response.ok) {
            // If the server returns an error (e.g., 401 Unauthorized), show it.
            throw new Error(data.message || 'Login failed. Please try again.');
        }

        // 6. On successful login, save the token and redirect.
        if (data.token) {
            // Store the token in the browser's localStorage.
            // This allows us to stay logged in across pages.
            localStorage.setItem('authToken', data.token);
            
            // Show a success message.
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.classList.add('success');
            
            // Redirect to the main dashboard after a short delay.
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }

    } catch (error) {
        // 7. If any network error or server error occurs, display it.
        messageDiv.textContent = error.message;
        messageDiv.classList.add('error');
    }
});
