/**
 * Ticket detail page functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get ticket ID from URL
    const path = window.location.pathname;
    const ticketId = path.split('/').pop();
    
    // Load ticket details
    loadTicketDetails(ticketId);
    
    // Set up event listeners
    setupEventListeners(ticketId);
});

/**
 * Sets up event listeners
 * @param {string} ticketId - The ticket ID
 */
function setupEventListeners(ticketId) {
    // Status change handler
    const statusSelect = document.getElementById('ticket-status');
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            updateTicket(ticketId, { status: this.value });
        });
    }
    
    // Priority change handler
    const prioritySelect = document.getElementById('ticket-priority');
    if (prioritySelect) {
        prioritySelect.addEventListener('change', function() {
            updateTicket(ticketId, { priority: this.value });
        });
    }
    
    // Delete ticket button
    const deleteButton = document.getElementById('delete-ticket-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            openDeleteConfirmation(ticketId);
        });
    }
    
    // Comment form
    const commentForm = document.getElementById('add-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addComment(ticketId);
        });
    }
}

/**
 * Loads ticket details
 * @param {string} ticketId - The ticket ID
 */
function loadTicketDetails(ticketId) {
    fetch(`/api/ticket/${ticketId}`)
        .then(response => response.json())
        .then(data => {
            if (data.ticket) {
                renderTicketDetails(data.ticket);
                
                // Render comments if available
                if (data.comments) {
                    renderComments(data.comments);
                }
                
                // Hide loading, show content
                document.getElementById('ticket-loading').style.display = 'none';
                document.getElementById('ticket-info').style.display = 'block';
                
                // Load ticket history
                loadTicketHistory(ticketId);
            } else {
                // Show error message
                document.getElementById('ticket-loading').innerHTML = `
                    <div class="error-message">
                        <p>Failed to load ticket. It may have been deleted or you don't have permission to view it.</p>
                        <a href="/tickets" class="btn btn-primary">Back to Tickets</a>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('ticket-loading').innerHTML = `
                <div class="error-message">
                    <p>Failed to load ticket. Please try again later.</p>
                    <a href="/tickets" class="btn btn-primary">Back to Tickets</a>
                </div>
            `;
        });
}

/**
 * Renders ticket details
 * @param {Object} ticket - The ticket object
 */
function renderTicketDetails(ticket) {
    // Set page title
    document.getElementById('ticket-title').textContent = ticket.summary;
    
    // Set category
    document.getElementById('ticket-category').textContent = ticket.category.name;
    
    // Set created date
    document.getElementById('ticket-created').textContent = formatDate(ticket.createdAt, true);
    
    // Set status badge
    const statusBadge = document.getElementById('ticket-status-badge');
    statusBadge.textContent = formatStatus(ticket.status);
    statusBadge.dataset.status = ticket.status;
    
    // Set priority badge
    const priorityBadge = document.getElementById('ticket-priority-badge');
    priorityBadge.textContent = ticket.priority;
    priorityBadge.dataset.priority = ticket.priority;
    
    // Set submitted by
    document.getElementById('ticket-submitted-by').textContent = ticket.user.email;
    
    // Set description
    document.getElementById('ticket-description').textContent = ticket.description;
    
    // Set dropdown values
    const statusSelect = document.getElementById('ticket-status');
    if (statusSelect) {
        statusSelect.value = ticket.status;
    }
    
    const prioritySelect = document.getElementById('ticket-priority');
    if (prioritySelect) {
        prioritySelect.value = ticket.priority;
    }
}

/**
 * Renders comments
 * @param {Array} comments - Array of comment objects
 */
function renderComments(comments) {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="empty-state small">
                <i class="fas fa-comments empty-icon"></i>
                <h4>No Comments Yet</h4>
                <p>Be the first to add a comment</p>
            </div>
        `;
        return;
    }
    
    // Get comment template
    const commentTemplate = document.getElementById('comment-template');
    
    // Add each comment
    comments.forEach(comment => {
        const commentElement = commentTemplate.content.cloneNode(true);
        
        // Set author name
        commentElement.querySelector('.author-name').textContent = comment.user.email;
        
        // Set date
        commentElement.querySelector('.comment-date').textContent = formatDate(comment.createdAt, true);
        
        // Set content
        commentElement.querySelector('.comment-content').textContent = comment.content;
        
        // Add attachments if any
        const attachmentsContainer = commentElement.querySelector('.comment-attachments');
        if (comment.attachments && comment.attachments.length > 0) {
            comment.attachments.forEach(attachment => {
                const attachmentLink = document.createElement('a');
                attachmentLink.href = `/assets/uploads/comments/${attachment}`;
                attachmentLink.className = 'comment-attachment';
                attachmentLink.target = '_blank';
                attachmentLink.innerHTML = `
                    <i class="fas fa-paperclip"></i>
                    ${attachment.split('-').pop()}
                `;
                attachmentsContainer.appendChild(attachmentLink);
            });
        } else {
            attachmentsContainer.style.display = 'none';
        }
        
        commentsContainer.appendChild(commentElement);
    });
}

/**
 * Loads ticket history
 * @param {string} ticketId - The ticket ID
 */
function loadTicketHistory(ticketId) {
    const historyContainer = document.getElementById('history-container');
    
    fetch(`/api/ticket/${ticketId}/history`)
        .then(response => response.json())
        .then(data => {
            if (data.history && data.history.length > 0) {
                historyContainer.innerHTML = '';
                
                // Get history item template
                const historyTemplate = document.getElementById('history-item-template');
                
                // Add each history item
                data.history.forEach(item => {
                    const historyElement = historyTemplate.content.cloneNode(true);
                    
                    // Set icon based on action
                    const iconElement = historyElement.querySelector('.history-icon i');
                    switch(item.action) {
                        case 'created':
                            iconElement.className = 'fas fa-plus-circle';
                            break;
                        case 'status_changed':
                            iconElement.className = 'fas fa-sync-alt';
                            break;
                        case 'priority_changed':
                            iconElement.className = 'fas fa-flag';
                            break;
                        case 'commented':
                            iconElement.className = 'fas fa-comment';
                            break;
                        default:
                            iconElement.className = 'fas fa-history';
                    }
                    
                    // Set history text
                    const historyText = historyElement.querySelector('.history-text');
                    switch(item.action) {
                        case 'created':
                            historyText.textContent = `${item.user.email} created this ticket`;
                            break;
                        case 'status_changed':
                            historyText.textContent = `${item.user.email} changed status from "${formatStatus(item.prevValue)}" to "${formatStatus(item.newValue)}"`;
                            break;
                        case 'priority_changed':
                            historyText.textContent = `${item.user.email} changed priority from "${item.prevValue}" to "${item.newValue}"`;
                            break;
                        case 'commented':
                            historyText.textContent = `${item.user.email} added a comment`;
                            break;
                        default:
                            historyText.textContent = `${item.user.email} updated the ticket`;
                    }
                    
                    // Set date
                    historyElement.querySelector('.history-date').textContent = timeAgo(item.createdAt);
                    
                    historyContainer.appendChild(historyElement);
                });
            } else {
                historyContainer.innerHTML = `
                    <div class="empty-state small">
                        <i class="fas fa-history empty-icon"></i>
                        <h4>No History</h4>
                        <p>Ticket history will appear here</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            historyContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load history. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Updates a ticket
 * @param {string} ticketId - The ticket ID
 * @param {Object} updateData - Data to update
 */
function updateTicket(ticketId, updateData) {
    fetch(`/api/ticket/${ticketId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Ticket updated successfully') {
            // Show success message
            showToast('success', 'Updated', 'Ticket updated successfully');
            
            // Update ticket details
            renderTicketDetails(data.ticket);
            
            // Reload history
            loadTicketHistory(ticketId);
        } else {
            showToast('error', 'Error', data.message || 'Failed to update ticket');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to update ticket');
    });
}

/**
 * Opens modal to confirm ticket deletion
 * @param {string} ticketId - The ticket ID
 */
function openDeleteConfirmation(ticketId) {
    // Get template
    const template = document.getElementById('delete-confirmation-template');
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'Confirm Delete';
    
    // Clone template content
    const modalContent = template.content.cloneNode(true);
    
    // Add to modal body
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(modalContent);
    
    // Show modal
    openModal();
    
    // Add event listeners
    document.getElementById('cancel-delete').addEventListener('click', closeModal);
    document.getElementById('confirm-delete').addEventListener('click', function() {
        deleteTicket(ticketId);
    });
}

/**
 * Deletes a ticket
 * @param {string} ticketId - The ticket ID
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
            showToast('success', 'Deleted', 'Ticket deleted successfully');
            
            // Redirect to tickets list
            setTimeout(() => {
                window.location.href = '/tickets';
            }, 1000);
        } else {
            showToast('error', 'Error', data.message || 'Failed to delete ticket');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to delete ticket');
    });
}

/**
 * Adds a comment to the ticket
 * @param {string} ticketId - The ticket ID
 */
function addComment(ticketId) {
    const content = document.getElementById('comment-content').value;
    
    if (!content.trim()) {
        showToast('error', 'Error', 'Comment cannot be empty');
        return;
    }
    
    fetch(`/api/comment/${ticketId}/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Comment added successfully') {
            // Clear form
            document.getElementById('comment-content').value = '';
            
            // Show success message
            showToast('success', 'Added', 'Comment added successfully');
            
            // Reload comments
            fetch(`/api/comment/${ticketId}/list`)
                .then(response => response.json())
                .then(commentData => {
                    if (commentData.comments) {
                        renderComments(commentData.comments);
                    }
                });
            
            // Reload history
            loadTicketHistory(ticketId);
        } else {
            showToast('error', 'Error', data.message || 'Failed to add comment');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to add comment');
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