/**
 * Tickets list page functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Current state
    const state = {
        tickets: [],
        filteredTickets: [],
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        sortField: 'createdAt',
        sortDirection: 'desc',
        filters: {
            status: 'all',
            priority: 'all',
            category: 'all'
        },
        searchQuery: ''
    };
    
    // Page elements
    const elements = {
        statusFilter: document.getElementById('status-filter'),
        priorityFilter: document.getElementById('priority-filter'),
        categoryFilter: document.getElementById('category-filter'),
        searchInput: document.getElementById('ticket-search'),
        ticketsBody: document.getElementById('tickets-body'),
        prevPage: document.getElementById('prev-page'),
        nextPage: document.getElementById('next-page'),
        pageNumbers: document.getElementById('page-numbers'),
        createTicketBtn: document.getElementById('create-ticket-btn-page')
    };
    
    // Initialize
    init();
    
    /**
     * Initializes the page
     */
    function init() {
        // Check for organization and profile requirements first
        checkPrerequisites().then(({ inOrganization, hasProfile }) => {
            if (!inOrganization) {
                showOrganizationRequiredMessage();
                return;
            }
            
            // Initialize the page
            loadTickets();
            loadCategories();
            setupEventListeners();
            
            // Check for filter params in URL
            const urlParams = new URLSearchParams(window.location.search);
            const statusParam = urlParams.get('status');
            if (statusParam) {
                state.filters.status = statusParam;
                if (elements.statusFilter) {
                    elements.statusFilter.value = statusParam;
                }
            }
        });
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
     * Shows message when user is not in an organization
     */
    function showOrganizationRequiredMessage() {
        if (elements.ticketsBody) {
            elements.ticketsBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-building empty-icon"></i>
                            <h3>Organization Required</h3>
                            <p>You need to be a member of an organization to view and create tickets.</p>
                            <p>Please contact your administrator to be added to an organization.</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Disable buttons and filters
        if (elements.createTicketBtn) {
            elements.createTicketBtn.disabled = true;
        }
        
        if (elements.statusFilter) {
            elements.statusFilter.disabled = true;
        }
        
        if (elements.priorityFilter) {
            elements.priorityFilter.disabled = true;
        }
        
        if (elements.categoryFilter) {
            elements.categoryFilter.disabled = true;
        }
        
        if (elements.searchInput) {
            elements.searchInput.disabled = true;
        }
    }
    
    /**
     * Sets up event listeners
     */
    function setupEventListeners() {
        // Filter changes
        if (elements.statusFilter) {
            elements.statusFilter.addEventListener('change', function() {
                state.filters.status = this.value;
                state.currentPage = 1;
                applyFilters();
            });
        }
        
        if (elements.priorityFilter) {
            elements.priorityFilter.addEventListener('change', function() {
                state.filters.priority = this.value;
                state.currentPage = 1;
                applyFilters();
            });
        }
        
        if (elements.categoryFilter) {
            elements.categoryFilter.addEventListener('change', function() {
                state.filters.category = this.value;
                state.currentPage = 1;
                applyFilters();
            });
        }
        
        // Search input
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', function() {
                state.searchQuery = this.value.trim().toLowerCase();
                state.currentPage = 1;
                applyFilters();
            });
        }
        
        // Column sorting
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const field = this.dataset.sort;
                
                // Toggle direction if same field, otherwise default to ascending
                if (state.sortField === field) {
                    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortField = field;
                    state.sortDirection = 'asc';
                }
                
                // Update sort UI
                updateSortUI(this);
                
                // Re-render with new sort
                applyFilters();
            });
        });
        
        // Pagination
        if (elements.prevPage) {
            elements.prevPage.addEventListener('click', function() {
                if (state.currentPage > 1) {
                    state.currentPage--;
                    renderTickets();
                }
            });
        }
        
        if (elements.nextPage) {
            elements.nextPage.addEventListener('click', function() {
                if (state.currentPage < state.totalPages) {
                    state.currentPage++;
                    renderTickets();
                }
            });
        }
        
        // Create ticket button
        if (elements.createTicketBtn) {
            elements.createTicketBtn.addEventListener('click', function() {
                // Check if profile exists
                checkProfileExists().then(hasProfile => {
                    if (hasProfile) {
                        openCreateTicketModal();
                    } else {
                        showProfileRequiredModal('create a ticket');
                    }
                });
            });
        }
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
     * Loads tickets from the API
     */
    function loadTickets() {
        fetch('/api/ticket/list')
            .then(response => response.json())
            .then(data => {
                if (data.tickets && data.tickets.length > 0) {
                    state.tickets = data.tickets;
                    state.filteredTickets = [...state.tickets];
                    calculateTotalPages();
                    renderTickets();
                } else {
                    showEmptyState();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                elements.ticketsBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">
                            <p>Error loading tickets. Please try again later.</p>
                        </td>
                    </tr>
                `;
            });
    }
    
    /**
     * Loads categories for the filter dropdown
     */
    function loadCategories() {
        fetch('/api/category/list')
            .then(response => response.json())
            .then(data => {
                if (data.categories && elements.categoryFilter) {
                    // Add categories to dropdown
                    data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category._id;
                        option.textContent = category.name;
                        elements.categoryFilter.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    }
    
    /**
     * Applies filters and search to the tickets
     */
    function applyFilters() {
        state.filteredTickets = state.tickets.filter(ticket => {
            // Status filter
            if (state.filters.status !== 'all' && ticket.status !== state.filters.status) {
                return false;
            }
            
            // Priority filter
            if (state.filters.priority !== 'all' && ticket.priority !== state.filters.priority) {
                return false;
            }
            
            // Category filter
            if (state.filters.category !== 'all' && ticket.category._id !== state.filters.category) {
                return false;
            }
            
            // Search query
            if (state.searchQuery) {
                const searchFields = [
                    ticket.summary,
                    ticket.description,
                    ticket.category?.name,
                    ticket.user?.email
                ].filter(Boolean).map(field => field.toLowerCase());
                
                return searchFields.some(field => field.includes(state.searchQuery));
            }
            
            return true;
        });
        
        // Apply sorting
        sortTickets();
        
        // Update pagination
        calculateTotalPages();
        renderTickets();
    }
    
    /**
     * Sorts filtered tickets
     */
    function sortTickets() {
        state.filteredTickets.sort((a, b) => {
            let valueA, valueB;
            
            // Handle different field types
            switch(state.sortField) {
                case 'id':
                    valueA = a._id;
                    valueB = b._id;
                    break;
                case 'user':
                    valueA = a.user?.email || '';
                    valueB = b.user?.email || '';
                    break;
                case 'category':
                    valueA = a.category?.name || '';
                    valueB = b.category?.name || '';
                    break;
                case 'createdAt':
                    valueA = new Date(a.createdAt);
                    valueB = new Date(b.createdAt);
                    break;
                default:
                    valueA = a[state.sortField] || '';
                    valueB = b[state.sortField] || '';
            }
            
            // Compare based on direction
            if (state.sortDirection === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    }
    
    /**
     * Updates the sort UI
     * @param {HTMLElement} clickedHeader - The header that was clicked
     */
    function updateSortUI(clickedHeader) {
        // Remove existing sort classes
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add class to clicked header
        clickedHeader.classList.add(`sort-${state.sortDirection}`);
    }
    
    /**
     * Calculates total pages based on filtered tickets
     */
    function calculateTotalPages() {
        state.totalPages = Math.max(1, Math.ceil(state.filteredTickets.length / state.itemsPerPage));
    }
    
    /**
     * Renders tickets to the table
     */
    function renderTickets() {
        // Get current page tickets
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const currentPageTickets = state.filteredTickets.slice(startIndex, endIndex);
        
        // Clear table body
        elements.ticketsBody.innerHTML = '';
        
        // Check if we have tickets to display
        if (currentPageTickets.length === 0) {
            showEmptyState();
            return;
        }
        
        // Get row template
        const rowTemplate = document.getElementById('ticket-row-template');
        
        // Add rows
        currentPageTickets.forEach(ticket => {
            const row = rowTemplate.content.cloneNode(true);
            
            // Fill in data
            row.querySelector('.ticket-id').textContent = ticket._id.substring(ticket._id.length - 6);
            row.querySelector('.ticket-summary').textContent = ticket.summary;
            
            // User (if admin)
            const userCell = row.querySelector('.ticket-user');
            if (userCell) {
                userCell.textContent = ticket.user.email;
            }
            
            // Category
            row.querySelector('.ticket-category').textContent = ticket.category.name;
            
            // Priority
            const priorityBadge = row.querySelector('.priority-badge');
            priorityBadge.textContent = ticket.priority;
            priorityBadge.dataset.priority = ticket.priority;
            
            // Status
            const statusBadge = row.querySelector('.status-badge');
            statusBadge.textContent = formatStatus(ticket.status);
            statusBadge.dataset.status = ticket.status;
            
            // Created date
            row.querySelector('.ticket-created').textContent = formatDate(ticket.createdAt);
            
            // Action buttons
            row.querySelector('.view-ticket').href = `/tickets/${ticket._id}`;
            
            const deleteBtn = row.querySelector('.delete-ticket');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    openDeleteConfirmation(ticket);
                });
            }
            
            // Add to table
            elements.ticketsBody.appendChild(row);
        });
        
        // Update pagination
        updatePagination();
    }
    
    /**
     * Shows empty state when no tickets are found
     */
    function showEmptyState() {
        const emptyTemplate = document.getElementById('empty-tickets-template');
        const emptyContent = emptyTemplate.content.cloneNode(true);
        
        elements.ticketsBody.innerHTML = '';
        elements.ticketsBody.appendChild(emptyContent);
        
        // Add event listener to create ticket button
        const createEmptyTicketBtn = document.getElementById('create-empty-ticket');
        if (createEmptyTicketBtn) {
            createEmptyTicketBtn.addEventListener('click', function() {
                // Check if profile exists
                checkProfileExists().then(hasProfile => {
                    if (hasProfile) {
                        openCreateTicketModal();
                    } else {
                        showProfileRequiredModal('create a ticket');
                    }
                });
            });
        }
    }
    
    /**
     * Updates pagination controls
     */
    function updatePagination() {
        // Update button states
        elements.prevPage.disabled = state.currentPage === 1;
        elements.nextPage.disabled = state.currentPage === state.totalPages;
        
        // Update page numbers
        elements.pageNumbers.innerHTML = `
            <span class="current-page">${state.currentPage}</span>
            <span class="page-total">of ${state.totalPages}</span>
        `;
    }
    
    /**
     * Opens modal to confirm ticket deletion
     * @param {Object} ticket - The ticket to delete
     */
    function openDeleteConfirmation(ticket) {
        // Set modal title
        document.getElementById('modal-title').textContent = 'Confirm Delete';
        
        // Create confirmation content
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirmation-message">
                    <h3>Delete Ticket</h3>
                    <p>Are you sure you want to delete this ticket?</p>
                    <p><strong>${ticket.summary}</strong></p>
                    <p>This action cannot be undone.</p>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" id="cancel-delete">Cancel</button>
                    <button class="btn btn-danger" id="confirm-delete">Delete</button>
                </div>
            </div>
        `;
        
        // Show modal
        openModal();
        
        // Add event listeners to buttons
        document.getElementById('cancel-delete').addEventListener('click', closeModal);
        document.getElementById('confirm-delete').addEventListener('click', function() {
            deleteTicket(ticket._id);
        });
    }
    
    /**
     * Deletes a ticket
     * @param {string} ticketId - ID of the ticket to delete
     */
    function deleteTicket(ticketId) {
        fetch(`/api/ticket/${ticketId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Ticket deleted successfully') {
                // Close modal
                closeModal();
                
                // Show success message
                showToast('success', 'Success', 'Ticket deleted successfully');
                
                // Reload tickets
                loadTickets();
            } else {
                // Show error
                showToast('error', 'Error', data.message || 'Failed to delete ticket');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('error', 'Error', 'Failed to delete ticket');
        });
    }
    
    /**
     * Formats a status string for display
     * @param {string} status - The status to format
     * @returns {string} Formatted status
     */
    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
});