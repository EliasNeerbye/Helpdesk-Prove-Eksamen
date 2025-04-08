/**
 * Main JavaScript file for the HelpDesk application
 */
document.addEventListener('DOMContentLoaded', function() {
    // User dropdown toggle
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!e.target.closest('.user-profile-dropdown')) {
                    dropdownToggle.classList.remove('active');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Logout successful') {
                    window.location.href = '/login';
                } else {
                    showToast('error', 'Logout Failed', 'Failed to log out. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('error', 'Logout Failed', 'Failed to log out. Please try again.');
            });
        });
    }
    
    const createTicketBtn = document.getElementById('create-ticket-btn');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', function() {
            // Check if user is in an organization first
            checkOrganizationMembership().then(inOrganization => {
                if (inOrganization) {
                    // Check if user has a profile
                    checkProfileExists().then(hasProfile => {
                        if (hasProfile) {
                            openCreateTicketModal();
                        } else {
                            showProfileRequiredModal('create a ticket');
                        }
                    });
                } else {
                    showOrganizationRequiredModal();
                }
            });
        });
    }
    
    // Format date display on dashboard
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        currentDateElement.textContent = today.toLocaleDateString('en-US', options);
    }
    
    // Admin stats button
    const statsButton = document.getElementById('stats-button');
    if (statsButton) {
        statsButton.addEventListener('click', function(e) {
            e.preventDefault();
            openStatsModal();
        });
    }
});

/**
 * Check if the current user is a member of an organization
 * @returns {Promise<boolean>} Promise resolving to true if in org, false otherwise
 */
function checkOrganizationMembership() {
    return fetch('/api/org/users')
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    return true; // If we can get users, we're in an org
                });
            } else if (response.status === 404) {
                return false; // 404 likely means "You don't belong to any organization"
            } else {
                throw new Error('Failed to check organization membership');
            }
        })
        .catch(error => {
            console.error('Error checking organization membership:', error);
            return false;
        });
}

/**
 * Show modal explaining organization requirement
 */
function showOrganizationRequiredModal() {
    // Set the modal title
    document.getElementById('modal-title').textContent = 'Organization Required';
    
    // Create modal content
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-building"></i>
            </div>
            <div class="notification-message">
                <h3>Organization Required</h3>
                <p>You need to be a member of an organization to create tickets.</p>
                <p>Please contact your administrator to be added to an organization.</p>
            </div>
            <div class="notification-actions">
                <button class="btn btn-primary" id="close-notification">OK</button>
            </div>
        </div>
    `;
    
    // Show the modal
    openModal();
    
    // Set up close button
    document.getElementById('close-notification').addEventListener('click', closeModal);
}

/**
 * Check if the current user has created a profile
 * @returns {Promise<boolean>} Promise resolving to true if profile exists, false otherwise
 */
function checkProfileExists() {
    return fetch('/api/profile/get')
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    return data.profile != null;
                });
            } else {
                return false;
            }
        })
        .catch(error => {
            console.error('Error checking profile:', error);
            return false;
        });
}

/**
 * Show modal explaining profile requirement
 * @param {string} action - The action requiring a profile
 */
function showProfileRequiredModal(action) {
    // Set the modal title
    document.getElementById('modal-title').textContent = 'Profile Required';
    
    // Create modal content
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="notification-message">
                <h3>Profile Required</h3>
                <p>You need to create your profile before you can ${action}.</p>
            </div>
            <div class="notification-actions">
                <button class="btn btn-secondary" id="cancel-profile-redirect">Cancel</button>
                <a href="/profile" class="btn btn-primary" id="go-to-profile">Go to Profile</a>
            </div>
        </div>
    `;
    
    // Show the modal
    openModal();
    
    // Set up close button
    document.getElementById('cancel-profile-redirect').addEventListener('click', closeModal);
}

/**
 * Opens the create ticket modal
 */
function openCreateTicketModal() {
    // Get the modal template
    const template = document.getElementById('create-ticket-template');
    if (!template) return;
    
    // Set the modal title
    document.getElementById('modal-title').textContent = 'Create Ticket';
    
    // Clone the modal content
    const modalContent = template.content.cloneNode(true);
    
    // Add to modal body
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';
    modalBody.appendChild(modalContent);
    
    // Fetch categories for the dropdown
    fetchCategories().then(categories => {
        const categorySelect = document.getElementById('ticket-category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    });
    
    // Handle form submission
    const form = document.getElementById('quick-ticket-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            summary: document.getElementById('ticket-summary').value,
            description: document.getElementById('ticket-description').value,
            category: document.getElementById('ticket-category').value,
            priority: document.getElementById('ticket-priority').value
        };
        
        fetch('/api/ticket/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Ticket created successfully') {
                closeModal();
                showToast('success', 'Success', 'Ticket created successfully');
                
                // Redirect to the new ticket page
                setTimeout(() => {
                    window.location.href = `/tickets/${data.ticket._id}`;
                }, 1000);
            } else {
                showToast('error', 'Error', data.message || 'Failed to create ticket');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('error', 'Error', 'Failed to create ticket');
        });
    });
    
    // Handle cancel button
    const cancelButton = document.getElementById('cancel-ticket');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeModal);
    }
    
    // Show the modal
    openModal();
}

/**
 * Opens the stats modal for admins
 */
function openStatsModal() {
    // Set the modal title
    document.getElementById('modal-title').textContent = 'Ticket Statistics';
    
    // Create modal content
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading statistics...</p>
        </div>
    `;
    
    // Show the modal
    openModal();
    
    // Fetch ticket stats
    fetch('/api/ticket/stats')
        .then(response => response.json())
        .then(data => {
            if (data.stats) {
                const statsData = data.stats;
                
                // Create stats content
                modalBody.innerHTML = `
                    <div class="stats-container">
                        <div class="stats-header">
                            <h3>Organization: ${data.organization}</h3>
                            <p>Total Tickets: ${statsData.total}</p>
                        </div>
                        
                        <div class="stats-section">
                            <h4>Status Breakdown</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byStatus.open}</span>
                                    <span class="stat-label">Open</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byStatus.inProgress}</span>
                                    <span class="stat-label">In Progress</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byStatus.resolved}</span>
                                    <span class="stat-label">Resolved</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byStatus.closed}</span>
                                    <span class="stat-label">Closed</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byStatus.canceled}</span>
                                    <span class="stat-label">Canceled</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stats-section">
                            <h4>Priority Breakdown</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byPriority.high}</span>
                                    <span class="stat-label">High</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byPriority.medium}</span>
                                    <span class="stat-label">Medium</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${statsData.byPriority.low}</span>
                                    <span class="stat-label">Low</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load statistics. Please try again later.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            modalBody.innerHTML = `
                <div class="error-message">
                    <p>Failed to load statistics. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Fetches categories from the API
 * @returns {Promise} Promise that resolves to an array of categories
 */
function fetchCategories() {
    return fetch('/api/category/list')
        .then(response => response.json())
        .then(data => {
            if (data.categories) {
                return data.categories;
            }
            return [];
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            return [];
        });
}

/**
 * Shows a toast notification
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {string} title - Title of the toast
 * @param {string} message - Message to display
 */
function showToast(type, title, message) {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 5000);
}

/**
 * Formats a date for display
 * @param {string} dateString - ISO date string
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * Returns a human-readable time ago string
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string
 */
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval === 1 ? '1 year ago' : interval + ' years ago';
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval === 1 ? '1 month ago' : interval + ' months ago';
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval === 1 ? '1 day ago' : interval + ' days ago';
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval === 1 ? '1 hour ago' : interval + ' hours ago';
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval === 1 ? '1 minute ago' : interval + ' minutes ago';
    }
    
    return 'Just now';
}