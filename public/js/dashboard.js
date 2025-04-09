/**
 * Dashboard page functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check prerequisites first
    checkPrerequisites().then(({ inOrganization, hasProfile }) => {
        if (!inOrganization) {
            showOrganizationRequiredMessage();
            showCreateOrgButton();
        } else {
            hideCreateOrgButton();
        }
        
        // Load dashboard components
        loadSummaryCounts();
        loadRecentTickets();
        
        // Load activity feed or ticket stats
        const isAdmin = document.querySelector('.nav-group') !== null;
        if (isAdmin) {
            loadTicketStats();
        } else {
            loadActivityFeed();
        }
    });
});

/**
 * Shows the create organization button
 */
function showCreateOrgButton() {
    const createOrgSection = document.querySelector('.create-org-section');
    if (createOrgSection) {
        createOrgSection.style.display = 'block';
        
        // Set up the create organization modal
        const openCreateOrgModalBtn = document.getElementById('open-create-org-modal');
        if (openCreateOrgModalBtn) {
            openCreateOrgModalBtn.addEventListener('click', function() {
                // Set the modal title
                document.getElementById('modal-title').textContent = 'Create Organization';
                
                // Create the modal content
                const modalBody = document.getElementById('modal-body');
                modalBody.innerHTML = `
                    <form id="create-org-form" class="modal-form">
                        <div class="form-group">
                            <label for="org-name">Organization Name</label>
                            <input type="text" id="org-name" name="name" placeholder="Enter organization name" required>
                        </div>
                        <div class="form-group">
                            <label for="org-description">Description</label>
                            <textarea id="org-description" name="description" placeholder="Enter organization description" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-create-org">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Organization</button>
                        </div>
                    </form>
                `;
                
                // Show the modal
                openModal();
                
                // Handle cancel button
                document.getElementById('cancel-create-org').addEventListener('click', closeModal);
                
                // Handle form submission
                const form = document.getElementById('create-org-form');
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(form);
                    const data = {
                        name: formData.get('name'),
                        description: formData.get('description')
                    };
                    
                    fetch('/api/org/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => {
    return response.json();
})
                    .then(data => {
                        if (data.message === 'Organization created successfully') {
                            // Close modal
                            closeModal();
                            
                            // Show success message
                            showToast('success', 'Success', 'Organization created successfully');
                            
                            // Reload page after short delay
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        } else {
                            showToast('error', 'Error', data.message || 'Failed to create organization');
                        }
                    })
                    .catch(error => {
                        console.error('Error creating organization:', error);
                        showToast('error', 'Error', 'Failed to create organization. Please try again.');
                    });
                });
            });
        }
    }
}

/**
 * Hides the create organization button
 */
function hideCreateOrgButton() {
    const createOrgSection = document.querySelector('.create-org-section');
    if (createOrgSection) {
        createOrgSection.style.display = 'none';
    }
}

/**
 * Checks if prerequisites are met (organization and profile)
 * @returns {Promise<Object>} Object with boolean flags for requirements
 */
function checkPrerequisites() {
    // Check organization membership
    const orgPromise = fetch('/api/org/users')
        .then(response => {
            if (response.ok) {
                return true; // If we can get users, we're in an org
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
        
    // Check profile existence
    const profilePromise = fetch('/api/profile/get')
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
        
    return Promise.all([orgPromise, profilePromise])
        .then(([inOrganization, hasProfile]) => {
            return { inOrganization, hasProfile };
        });
}

/**
 * Shows a message when organization membership is required
 */
function showOrganizationRequiredMessage() {
    // Add notification banner
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        const notificationBanner = document.createElement('div');
        notificationBanner.className = 'alert alert-warning';
        notificationBanner.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Organization Required:</strong> You need to be a member of an organization to use the helpdesk system.
            Please contact your administrator to be added to an organization.
        `;
        
        dashboardContainer.insertBefore(notificationBanner, dashboardContainer.firstChild);
    }
    
    // Update dashboard sections
    const recentTickets = document.getElementById('recent-tickets');
    if (recentTickets) {
        recentTickets.innerHTML = `
            <div class="empty-state small">
                <i class="fas fa-building empty-icon"></i>
                <h4>Organization Required</h4>
                <p>You need to be a member of an organization to view tickets.</p>
            </div>
        `;
    }
    
    const activityFeed = document.getElementById('activity-feed');
    if (activityFeed) {
        activityFeed.innerHTML = `
            <div class="empty-state small">
                <i class="fas fa-building empty-icon"></i>
                <h4>Organization Required</h4>
                <p>You need to be a member of an organization to view activity.</p>
            </div>
        `;
    }
    
    // Update summary counts
    const summaryCountElements = document.querySelectorAll('.summary-count');
    summaryCountElements.forEach(element => {
        element.textContent = '0';
    });
}

/**
 * Loads summary counts for dashboard cards
 */
function loadSummaryCounts() {
    // My tickets count
    fetch('/api/ticket/list')
        .then(response => {
    return response.json();
})
        .then(data => {
            if (data.tickets) {
                document.getElementById('my-tickets-count').textContent = data.tickets.length;
                
                // For regular users, update other counters
                const isAdmin = document.querySelector('.nav-group') !== null;
                if (!isAdmin) {
                    const inProgressCount = data.tickets.filter(ticket => ticket.status === 'in-progress').length;
                    const resolvedCount = data.tickets.filter(ticket => ticket.status === 'resolved').length + data.tickets.filter(ticket => ticket.status === 'closed').length;
                    
                    document.getElementById('in-progress-count').textContent = inProgressCount;
                    document.getElementById('resolved-count').textContent = resolvedCount;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            document.getElementById('my-tickets-count').textContent = 'Error';
        });
    
    // For admins, load additional stats
    const isAdmin = document.querySelector('.nav-group') !== null;
    if (isAdmin) {
        // Open tickets count
        fetch('/api/ticket/stats')
            .then(response => {
    return response.json();
})
            .then(data => {
                if (data.stats) {
                    document.getElementById('open-tickets-count').textContent = data.stats.byStatus.open;
                    
                    // Total users count - fetch from organization users
                    fetch('/api/org/users')
                        .then(response => {
    return response.json();
})
                        .then(userData => {
                            if (userData.users) {
                                document.getElementById('total-users-count').textContent = userData.users.length;
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching users:', error);
                            document.getElementById('total-users-count').textContent = 'Error';
                        });
                }
            })
            .catch(error => {
                console.error('Error fetching ticket stats:', error);
                document.getElementById('open-tickets-count').textContent = 'Error';
            });
    }
}

/**
 * Loads recent tickets for the dashboard
 */
function loadRecentTickets() {
    const ticketsContainer = document.getElementById('recent-tickets');
    
    // First check if user has a profile
    fetch('/api/profile/get')
        .then(response => {
    return response.json();
})
        .then(profileData => {
            const hasProfile = profileData.profile != null;
            
            if (!hasProfile) {
                ticketsContainer.innerHTML = `
                    <div class="empty-state small">
                        <i class="fas fa-user-circle empty-icon"></i>
                        <h4>Profile Required</h4>
                        <p>Please complete your profile to create tickets</p>
                        <a href="/profile" class="btn btn-primary btn-sm">Go to Profile</a>
                    </div>
                `;
                return;
            }
            
            // If has profile, continue to load tickets
            fetch('/api/ticket/list')
                .then(response => {
    return response.json();
})
                .then(data => {
                    if (data.tickets && data.tickets.length > 0) {
                        // Sort by creation date (newest first)
                        const sortedTickets = data.tickets.sort((a, b) => {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        });
                        
                        // Take only the 5 most recent
                        const recentTickets = sortedTickets.slice(0, 5);
                        
                        // Clear loading indicator
                        ticketsContainer.innerHTML = '';
                        
                        // Add tickets to container
                        recentTickets.forEach(ticket => {
                            const ticketElement = document.createElement('div');
                            ticketElement.className = 'ticket-item';
                            
                            ticketElement.innerHTML = `
                                <div class="ticket-item-header">
                                    <div class="ticket-item-title">${ticket.summary}</div>
                                    <div class="priority-badge" data-priority="${ticket.priority}">${ticket.priority}</div>
                                </div>
                                <div class="ticket-item-details">
                                    <span class="status-badge" data-status="${ticket.status}">${formatStatus(ticket.status)}</span>
                                    <span class="ticket-item-date">${timeAgo(ticket.createdAt)}</span>
                                </div>
                                <a href="/tickets/${ticket._id}" class="ticket-item-link">View Ticket</a>
                            `;
                            
                            ticketsContainer.appendChild(ticketElement);
                        });
                    } else {
                        ticketsContainer.innerHTML = `
                            <div class="empty-state small">
                                <i class="fas fa-ticket-alt empty-icon"></i>
                                <h4>No Tickets Yet</h4>
                                <p>Create your first ticket to get started</p>
                                <button class="btn btn-primary btn-sm" id="create-first-ticket">Create Ticket</button>
                            </div>
                        `;
                        
                        const createFirstTicketBtn = document.getElementById('create-first-ticket');
                        if (createFirstTicketBtn) {
                            createFirstTicketBtn.addEventListener('click', function() {
                                openCreateTicketModal();
                            });
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching tickets:', error);
                    ticketsContainer.innerHTML = `
                        <div class="error-message">
                            <p>Failed to load tickets. Please try again later.</p>
                        </div>
                    `;
                });
        })
        .catch(error => {
            console.error('Error checking profile:', error);
            ticketsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load profile information. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Loads ticket statistics for admin dashboard
 */
function loadTicketStats() {
    const statsContainer = document.getElementById('ticket-stats');
    
    fetch('/api/ticket/stats')
        .then(response => {
    return response.json();
})
        .then(data => {
            if (data.stats) {
                const statsData = data.stats;
                
                // Create visual representation of stats
                statsContainer.innerHTML = `
                    <div class="stats-container">
                        <div class="stats-section">
                            <h4>Status Breakdown</h4>
                            <div class="stats-chart">
                                <div class="stats-bar-container">
                                    <div class="stats-bar" style="width: ${calculatePercentage(statsData.byStatus.open, statsData.total)}%">
                                        <span class="stats-bar-label">Open</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byStatus.open}</span>
                                </div>
                                <div class="stats-bar-container">
                                    <div class="stats-bar" style="width: ${calculatePercentage(statsData.byStatus.inProgress, statsData.total)}%">
                                        <span class="stats-bar-label">In Progress</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byStatus.inProgress}</span>
                                </div>
                                <div class="stats-bar-container">
                                    <div class="stats-bar" style="width: ${calculatePercentage(statsData.byStatus.resolved, statsData.total)}%">
                                        <span class="stats-bar-label">Resolved</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byStatus.resolved}</span>
                                </div>
                                <div class="stats-bar-container">
                                    <div class="stats-bar" style="width: ${calculatePercentage(statsData.byStatus.closed, statsData.total)}%">
                                        <span class="stats-bar-label">Closed</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byStatus.closed}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stats-section">
                            <h4>Priority Breakdown</h4>
                            <div class="stats-chart">
                                <div class="stats-bar-container">
                                    <div class="stats-bar stats-bar-high" style="width: ${calculatePercentage(statsData.byPriority.high, statsData.total)}%">
                                        <span class="stats-bar-label">High</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byPriority.high}</span>
                                </div>
                                <div class="stats-bar-container">
                                    <div class="stats-bar stats-bar-medium" style="width: ${calculatePercentage(statsData.byPriority.medium, statsData.total)}%">
                                        <span class="stats-bar-label">Medium</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byPriority.medium}</span>
                                </div>
                                <div class="stats-bar-container">
                                    <div class="stats-bar stats-bar-low" style="width: ${calculatePercentage(statsData.byPriority.low, statsData.total)}%">
                                        <span class="stats-bar-label">Low</span>
                                    </div>
                                    <span class="stats-bar-value">${statsData.byPriority.low}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                statsContainer.innerHTML = `
                    <div class="empty-state small">
                        <i class="fas fa-chart-bar empty-icon"></i>
                        <h4>No Statistics Available</h4>
                        <p>Statistics will appear once tickets are created.</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching ticket stats:', error);
            statsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load statistics. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Loads activity feed for the user dashboard
 */
function loadActivityFeed() {
    const activityContainer = document.getElementById('activity-feed');
    
    // First check if user has a profile
    fetch('/api/profile/get')
        .then(response => {
    return response.json();
})
        .then(profileData => {
            const hasProfile = profileData.profile != null;
            
            if (!hasProfile) {
                activityContainer.innerHTML = `
                    <div class="empty-state small">
                        <i class="fas fa-user-circle empty-icon"></i>
                        <h4>Profile Required</h4>
                        <p>Please complete your profile first</p>
                        <a href="/profile" class="btn btn-primary btn-sm">Go to Profile</a>
                    </div>
                `;
                return;
            }
            
            // Here we're using the ticket history endpoint, but filtering for the current user's activities
            fetch('/api/ticket/list')
                .then(response => {
    return response.json();
})
                .then(data => {
                    if (data.tickets && data.tickets.length > 0) {
                        // Get the most recent 5 tickets for the activity feed
                        const recentTickets = data.tickets
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .slice(0, 5);
                        
                        // Load history for each ticket to build activity feed
                        Promise.all(recentTickets.map(ticket => 
                            fetch(`/api/ticket/${ticket._id}`)
                                .then(response => {
    return response.json();
})
                                .catch(error => {
                                    console.error(`Error fetching ticket ${ticket._id}:`, error);
                                    return null;
                                })
                        ))
                        .then(ticketDetails => {
                            // Filter out any failed requests
                            const validTicketDetails = ticketDetails.filter(detail => detail !== null);
                            
                            if (validTicketDetails.length > 0) {
                                // Clear loading indicator
                                activityContainer.innerHTML = '';
                                
                                // Create activity items
                                validTicketDetails.forEach(detail => {
                                    const ticket = detail.ticket;
                                    const comments = detail.comments || [];
                                    
                                    // First, add ticket creation activity
                                    const activityItem = document.createElement('div');
                                    activityItem.className = 'activity-item';
                                    
                                    activityItem.innerHTML = `
                                        <div class="activity-icon">
                                            <i class="fas fa-ticket-alt"></i>
                                        </div>
                                        <div class="activity-content">
                                            <p class="activity-text">You created a new ticket: <a href="/tickets/${ticket._id}">${ticket.summary}</a></p>
                                            <span class="activity-date">${timeAgo(ticket.createdAt)}</span>
                                        </div>
                                    `;
                                    
                                    activityContainer.appendChild(activityItem);
                                    
                                    // Add comment activities if any
                                    comments.slice(0, 2).forEach(comment => {
                                        const commentItem = document.createElement('div');
                                        commentItem.className = 'activity-item';
                                        
                                        commentItem.innerHTML = `
                                            <div class="activity-icon">
                                                <i class="fas fa-comment"></i>
                                            </div>
                                            <div class="activity-content">
                                                <p class="activity-text">You commented on ticket: <a href="/tickets/${ticket._id}">${ticket.summary}</a></p>
                                                <span class="activity-date">${timeAgo(comment.createdAt)}</span>
                                            </div>
                                        `;
                                        
                                        activityContainer.appendChild(commentItem);
                                    });
                                });
                            } else {
                                activityContainer.innerHTML = `
                                    <div class="empty-state small">
                                        <i class="fas fa-history empty-icon"></i>
                                        <h4>No Activity Yet</h4>
                                        <p>Your recent activities will appear here.</p>
                                    </div>
                                `;
                            }
                        });
                    } else {
                        activityContainer.innerHTML = `
                            <div class="empty-state small">
                                <i class="fas fa-history empty-icon"></i>
                                <h4>No Activity Yet</h4>
                                <p>Your recent activities will appear here.</p>
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    console.error('Error fetching activity:', error);
                    activityContainer.innerHTML = `
                        <div class="error-message">
                            <p>Failed to load activity feed. Please try again later.</p>
                        </div>
                    `;
                });
        })
        .catch(error => {
            console.error('Error checking profile:', error);
            activityContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load profile information. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Calculates percentage for stats visualization
 * @param {number} value - The value to calculate percentage for
 * @param {number} total - The total value
 * @returns {number} The percentage value (capped at 100)
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.min(Math.round((value / total) * 100), 100);
}

/**
 * Formats status string for display
 * @param {string} status - The status value
 * @returns {string} Formatted status string
 */
function formatStatus(status) {
    switch (status) {
        case 'in-progress':
            return 'In Progress';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}