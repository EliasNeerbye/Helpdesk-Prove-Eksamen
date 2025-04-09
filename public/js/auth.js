/**
 * Authentication functionality for login and registration
 */
document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!email || !password) {
                showAuthError('Please enter both email and password');
                return;
            }
            
            // Send login request
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
            .then(data => {
                if (data.message === 'Login successful') {
                    window.location.href = '/dashboard';
                } else {
                    showAuthError(data.message || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAuthError('Login failed. Please try again.');
            });
        });
    }
    
    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const checkPasswordInput = document.getElementById('checkPassword');
        
        // Password validation
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                validatePassword(this.value);
            });
        }
        
        // Form submission
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const checkPassword = checkPasswordInput.value;
            
            // Basic validation
            if (!email || !password || !checkPassword) {
                showAuthError('Please fill in all fields');
                return;
            }
            
            // Check if passwords match
            if (password !== checkPassword) {
                showAuthError('Passwords do not match');
                return;
            }
            
            // Check if password is strong enough
            if (!isPasswordValid(password)) {
                showAuthError('Password does not meet all requirements');
                return;
            }
            
            // Send registration request
            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, checkPassword })
            })
            .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
            .then(data => {
                if (data.message === 'User created successfully') {
                    window.location.href = '/dashboard';
                } else {
                    showAuthError(data.message || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAuthError('Registration failed. Please try again.');
            });
        });
    }
});

/**
 * Validates a password against requirements
 * @param {string} password - Password to validate
 */
function validatePassword(password) {
    // Requirements
    const reqs = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    // Update UI for each requirement
    Object.keys(reqs).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            if (reqs[req]) {
                element.classList.add('valid');
                element.innerHTML = `<i class="fas fa-check"></i> ${element.textContent}`;
            } else {
                element.classList.remove('valid');
                element.innerHTML = element.textContent.replace('<i class="fas fa-check"></i> ', '');
            }
        }
    });
    
    return Object.values(reqs).every(Boolean);
}

/**
 * Checks if a password is valid
 * @param {string} password - Password to check
 * @returns {boolean} Whether the password is valid
 */
function isPasswordValid(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[^A-Za-z0-9]/.test(password);
}

/**
 * Shows an error message on the auth form
 * @param {string} message - Error message to display
 */
function showAuthError(message) {
    // Check if error element already exists
    let errorElement = document.querySelector('.alert-danger');
    
    if (!errorElement) {
        // Create new error element
        errorElement = document.createElement('div');
        errorElement.className = 'alert alert-danger';
        
        // Insert at the top of the form
        const form = document.querySelector('.auth-form');
        form.parentNode.insertBefore(errorElement, form);
    }
    
    // Set error message
    errorElement.textContent = message;
    
    // Scroll to the top to ensure error is visible
    window.scrollTo(0, 0);
}