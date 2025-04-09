document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables for ticket data and filtering
    let allTickets = [];
    const filters = {
        status: 'all',
        priority: 'all',
        category: 'all',
        assigned: 'all',
        query: ''
    };
    
    // Get necessary elements
    const ticketsList = document.getElementById('tickets-body');
    const loadingSpinner = document.getElementById('tickets-loading');
    
    // Get filter elements
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const categoryFilter = document.getElementById('category-filter');
    const assignedFilter = document.getElementById('assigned-filter');
    const searchInput = document.getElementById('ticket-search');
    
    // Get pagination elements
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    // Pagination state
    const pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1
    };
    
    // Load tickets and set up event listeners
    fetchAllTickets();
    setupEventListeners();
    
    /**
     * Set up event listeners for filters and pagination
     */
    function setupEventListeners() {
        // Filter change handlers
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                filters.status = this.value;
                resetPagination();
                applyFilters();
            });
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', function() {
                filters.priority = this.value;
                resetPagination();
                applyFilters();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                filters.category = this.value;
                resetPagination();
                applyFilters();
            });
        }
        
        if (assignedFilter) {
            assignedFilter.addEventListener('change', function() {
                filters.assigned = this.value;
                resetPagination();
                applyFilters();
            });
        }
        
        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function() {
                filters.query = this.value.trim().toLowerCase();
                resetPagination();
                applyFilters();
            }, 300));
            
            // Clear search button
            const clearSearch = document.getElementById('clear-search');
            if (clearSearch) {
                clearSearch.addEventListener('click', function() {
                    searchInput.value = '';
                    filters.query = '';
                    resetPagination();
                    applyFilters();
                });
            }
        }
        
        // Pagination buttons
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (pagination.currentPage > 1) {
                    pagination.currentPage--;
                    renderTickets();
                    updatePaginationUI();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                if (pagination.currentPage < pagination.totalPages) {
                    pagination.currentPage++;
                    renderTickets();
                    updatePaginationUI();
                }
            });
        }
    }
    
    /**
     * Fetch all tickets from the API
     */
    function fetchAllTickets() {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        
        fetch('/api/ticket/list')
            .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            showTaost('error','Error',err.message || 'An error occurred');
        });
    }
    return response.json();
})
            .then(data => {
                if (data.tickets && Array.isArray(data.tickets)) {
                    allTickets = data.tickets;
                    
                    // Initialize filters and rendering
                    loadCategoryOptions();
                    loadAssigneeOptions();
                    applyFilters();
                } else {
                    showEmptyState();
                }
                
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching tickets:', error);
                if (ticketsList) {
                    ticketsList.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center">
                                <div class="error-message">
                                    <p>Error loading tickets. Please try again later.</p>
                                </div>
                            </td>
                        </tr>
                    `;
                }
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            });
    }
    
    /**
     * Load category options for filter dropdown
     */
    function loadCategoryOptions() {
        if (!categoryFilter) return;
        
        // Get unique categories from tickets
        const categories = [...new Set(allTickets.map(ticket => 
            ticket.category && ticket.category._id ? 
            JSON.stringify({id: ticket.category._id, name: ticket.category.name}) : null
        ).filter(Boolean))];
        
        // Clear existing options except "All Categories"
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Add options
        categories.forEach(category => {
            const categoryObj = JSON.parse(category);
            const option = document.createElement('option');
            option.value = categoryObj.id;
            option.textContent = categoryObj.name;
            categoryFilter.appendChild(option);
        });
    }
    
    /**
     * Load assignee options for filter dropdown
     */
    function loadAssigneeOptions() {
        if (!assignedFilter) return;
        
        // Get unique assignees from tickets
        const assignees = [...new Set(allTickets
            .filter(ticket => ticket.assignedTo)
            .map(ticket => JSON.stringify({
                id: ticket.assignedTo._id,
                email: ticket.assignedTo.email,
                role: ticket.assignedRole
            }))
        )];
        
        // Clear existing options except the default ones
        while (assignedFilter.options.length > 2) {
            assignedFilter.remove(2);
        }
        
        // Add options
        assignees.forEach(assignee => {
            const assigneeObj = JSON.parse(assignee);
            const option = document.createElement('option');
            option.value = assigneeObj.id;
            option.textContent = `${assigneeObj.email} (${formatRole(assigneeObj.role)})`;
            assignedFilter.appendChild(option);
        });
    }
    
    /**
     * Apply all filters and update the display
     */
    function applyFilters() {
        // Filter tickets based on current filters
        const filteredTickets = allTickets.filter(ticket => {
            // Status filter
            if (filters.status !== 'all' && ticket.status !== filters.status) {
                return false;
            }
            
            // Priority filter
            if (filters.priority !== 'all' && ticket.priority !== filters.priority) {
                return false;
            }
            
            // Category filter
            if (filters.category !== 'all' && 
                (!ticket.category || ticket.category._id !== filters.category)) {
                return false;
            }
            
            // Assigned filter
            if (filters.assigned === 'unassigned' && ticket.assignedTo) {
                return false;
            } else if (filters.assigned !== 'all' && filters.assigned !== 'unassigned' && 
                       (!ticket.assignedTo || ticket.assignedTo._id !== filters.assigned)) {
                return false;
            }
            
            // Search query
            if (filters.query) {
                const searchFields = [
                    ticket.summary,
                    ticket.description,
                    ticket.category?.name,
                    ticket.user?.email,
                    ticket.assignedTo?.email,
                    ticket.status,
                    ticket.priority
                ].filter(Boolean).map(field => field.toLowerCase());
                
                const queryTerms = filters.query.split(' ').filter(term => term.length > 0);
                
                // Check if all query terms are found in at least one field
                return queryTerms.every(term => 
                    searchFields.some(field => field.includes(term))
                );
            }
            
            return true;
        });
        
        // Sort filtered results
        sortTickets(filteredTickets);
        
        // Update pagination state
        pagination.totalPages = Math.max(1, Math.ceil(filteredTickets.length / pagination.itemsPerPage));
        
        // Show no results message if needed
        if (filteredTickets.length === 0) {
            showNoResultsMessage();
        } else {
            // Store filtered tickets in global scope for pagination
            window.filteredTickets = filteredTickets;
            renderTickets();
        }
        
        // Update pagination UI
        updatePaginationUI();
        
        // Update filter counts
        updateFilterCounts(filteredTickets);
    }
    
    /**
     * Update the counts shown next to filter options
     */
    function updateFilterCounts(tickets) {
        // Skip if elements don't exist
        if (!statusFilter || !priorityFilter) return;
        
        // Count tickets by status
        const statusCounts = {
            open: tickets.filter(t => t.status === 'open').length,
            'in-progress': tickets.filter(t => t.status === 'in-progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            canceled: tickets.filter(t => t.status === 'canceled').length
        };
        
        // Update status filter options with counts
        Array.from(statusFilter.options).forEach(option => {
            if (option.value !== 'all') {
                const count = statusCounts[option.value] || 0;
                option.textContent = `${formatStatus(option.value)} (${count})`;
            }
        });
        
        // Count tickets by priority
        const priorityCounts = {
            high: tickets.filter(t => t.priority === 'high').length,
            medium: tickets.filter(t => t.priority === 'medium').length,
            low: tickets.filter(t => t.priority === 'low').length
        };
        
        // Update priority filter options with counts
        Array.from(priorityFilter.options).forEach(option => {
            if (option.value !== 'all') {
                const count = priorityCounts[option.value] || 0;
                option.textContent = `${capitalize(option.value)} (${count})`;
            }
        });
    }
    
    /**
     * Sort the filtered tickets
     */
    function sortTickets(tickets) {
        // Default sort by date (newest first)
        tickets.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
    
    /**
     * Render the current page of tickets
     */
    function renderTickets() {
        if (!ticketsList || !window.filteredTickets) return;
        
        // Get tickets for current page
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        const currentPageTickets = window.filteredTickets.slice(startIndex, endIndex);
        
        // Clear current rows
        ticketsList.innerHTML = '';
        
        // Check for no tickets
        if (currentPageTickets.length === 0) {
            showNoResultsMessage();
            return;
        }
        
        // Get row template
        const rowTemplate = document.getElementById('ticket-row-template');
        if (!rowTemplate) return;
        
        // Create a row for each ticket
        currentPageTickets.forEach(ticket => {
            const row = rowTemplate.content.cloneNode(true);
            
            // Fill in ticket data
            row.querySelector('.ticket-id').textContent = ticket._id.substring(ticket._id.length - 6);
            row.querySelector('.ticket-summary').textContent = ticket.summary;
            
            // User (if available)
            const userCell = row.querySelector('.ticket-user');
            if (userCell && ticket.user) {
                userCell.textContent = ticket.user.email;
            }
            
            // Category
            const categoryCell = row.querySelector('.ticket-category');
            if (categoryCell) {
                categoryCell.textContent = ticket.category ? ticket.category.name : 'Uncategorized';
            }
            
            // Assignment
            const assigneeCell = row.querySelector('.ticket-assigned-to');
            if (assigneeCell) {
                if (ticket.assignedTo) {
                    assigneeCell.textContent = `${ticket.assignedTo.email} (${formatRole(ticket.assignedRole)})`;
                } else {
                    assigneeCell.textContent = 'Unassigned';
                    assigneeCell.classList.add('unassigned');
                }
            }
            
            // Priority
            const priorityBadge = row.querySelector('.priority-badge');
            if (priorityBadge) {
                priorityBadge.textContent = ticket.priority;
                priorityBadge.dataset.priority = ticket.priority;
            }
            
            // Status
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = formatStatus(ticket.status);
                statusBadge.dataset.status = ticket.status;
            }
            
            // Created date
            const createdCell = row.querySelector('.ticket-created');
            if (createdCell) {
                createdCell.textContent = formatDateAgo(ticket.createdAt);
                createdCell.title = new Date(ticket.createdAt).toLocaleString();
            }
            
            // Actions
            const viewTicketLink = row.querySelector('.view-ticket');
            if (viewTicketLink) {
                viewTicketLink.href = `/tickets/${ticket._id}`;
            }
            
            const deleteBtn = row.querySelector('.delete-ticket');
            if (deleteBtn) {
                // Only enable delete button for resolved/closed tickets
                if (ticket.status === 'resolved' || ticket.status === 'closed') {
                    deleteBtn.addEventListener('click', () => openDeleteConfirmation(ticket));
                } else {
                    deleteBtn.disabled = true;
                    deleteBtn.title = 'Only resolved or closed tickets can be deleted';
                    deleteBtn.classList.add('btn-disabled');
                }
            }
            
            ticketsList.appendChild(row);
        });
    }
    
    /**
     * Show empty state when no tickets are found
     */
    function showNoResultsMessage() {
        if (!ticketsList) return;
        
        ticketsList.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state small">
                        <i class="fas fa-search empty-icon"></i>
                        <h4>No tickets found</h4>
                        <p>No tickets match your current filters or search criteria.</p>
                        <button class="btn btn-secondary btn-sm" id="clear-filters">Clear Filters</button>
                    </div>
                </td>
            </tr>
        `;
        
        // Add event listener to clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
        }
    }
    
    /**
     * Reset all filters to default values
     */
    function clearAllFilters() {
        // Reset filter values
        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        if (categoryFilter) categoryFilter.value = 'all';
        if (assignedFilter) assignedFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        
        // Reset filter state
        filters.status = 'all';
        filters.priority = 'all';
        filters.category = 'all';
        filters.assigned = 'all';
        filters.query = '';
        
        // Reset pagination
        resetPagination();
        
        // Apply filters
        applyFilters();
    }
    
    /**
     * Reset pagination to page 1
     */
    function resetPagination() {
        pagination.currentPage = 1;
    }
    
    /**
     * Update pagination UI elements
     */
    function updatePaginationUI() {
        if (!pageNumbers || !prevPageBtn || !nextPageBtn) return;
        
        // Update page numbers display
        pageNumbers.innerHTML = `
            <span class="current-page">${pagination.currentPage}</span>
            <span class="page-total">of ${pagination.totalPages}</span>
        `;
        
        // Update button states
        prevPageBtn.disabled = pagination.currentPage <= 1;
        nextPageBtn.disabled = pagination.currentPage >= pagination.totalPages;
    }
    
    /**
     * Format a status string for display
     */
    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    /**
     * Format a role string for display
     */
    function formatRole(role) {
        switch(role) {
            case '1st-line': return '1st Line';
            case '2nd-line': return '2nd Line';
            default: return role || 'User';
        }
    }
    
    /**
     * Format a date as time ago (e.g., "2 days ago")
     */
    function formatDateAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffDay > 30) {
            return date.toLocaleDateString();
        } else if (diffDay > 0) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else if (diffHour > 0) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffMin > 0) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
    
    /**
     * Capitalize first letter of a string
     */
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Debounce function to limit how often a function is called
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
});