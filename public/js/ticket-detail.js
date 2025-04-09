document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const ticketId = path.split('/').pop();
    
    loadTicketDetails(ticketId);
    setupEventListeners(ticketId);
});

function setupEventListeners(ticketId) {
    const statusSelect = document.getElementById('ticket-status');
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            updateTicket(ticketId, { status: this.value });
        });
    }
    
    const prioritySelect = document.getElementById('ticket-priority');
    if (prioritySelect) {
        prioritySelect.addEventListener('change', function() {
            updateTicket(ticketId, { priority: this.value });
        });
    }
    
    const assignButton = document.getElementById('assign-ticket-btn');
    if (assignButton) {
        assignButton.addEventListener('click', function() {
            openAssignModal(ticketId);
        });
    }
    
    const deleteButton = document.getElementById('delete-ticket-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            openDeleteConfirmation(ticketId);
        });
    }
    
    const commentForm = document.getElementById('add-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addComment(ticketId);
        });
    }
    
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitFeedback(ticketId);
        });
    }
}

function openDeleteConfirmation(ticketId) {
    const template = document.getElementById('delete-confirmation-template');
    
    document.getElementById('modal-title').textContent = 'Confirm Delete';
    
    const modalContent = template.content.cloneNode(true);
    
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(modalContent);
    
    openModal();
    
    document.getElementById('cancel-delete').addEventListener('click', closeModal);
    document.getElementById('confirm-delete').addEventListener('click', function() {
        deleteTicket(ticketId);
    });
}

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
            closeModal();
            showToast('success', 'Deleted', 'Ticket deleted successfully');
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
            document.getElementById('comment-content').value = '';
            showToast('success', 'Added', 'Comment added successfully');
            
            fetch(`/api/comment/${ticketId}/list`)
                .then(response => response.json())
                .then(commentData => {
                    if (commentData.comments) {
                        renderComments(commentData.comments);
                        updateDataStates();
                    }
                });
            
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

function loadTicketDetails(ticketId) {
    fetch(`/api/ticket/${ticketId}`)
        .then(response => response.json())
        .then(data => {
            if (data.ticket) {
                renderTicketDetails(data.ticket);
                
                if (data.comments) {
                    renderComments(data.comments);
                }
                
                document.getElementById('ticket-loading').style.display = 'none';
                document.getElementById('ticket-info').style.display = 'block';
                
                // Check if ticket is resolved to show feedback form
                if (data.ticket.status === 'resolved') {
                    loadFeedbackStatus(ticketId);
                }
                
                loadTicketHistory(ticketId);
                
                // Start polling after initial load is complete
                if (typeof startPolling === 'function') {
                    startPolling(ticketId);
                }
            } else {
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
    
    const commentTemplate = document.getElementById('comment-template');
    
    comments.forEach(comment => {
        const commentElement = commentTemplate.content.cloneNode(true);
        
        commentElement.querySelector('.author-name').textContent = comment.user.email;
        commentElement.querySelector('.comment-date').textContent = formatDate(comment.createdAt, true);
        commentElement.querySelector('.comment-content').textContent = comment.content;
        
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
    
    lastCommentCount = comments.length;
}

function loadTicketHistory(ticketId) {
    const historyContainer = document.getElementById('history-container');
    
    fetch(`/api/ticket/${ticketId}/history`)
        .then(response => response.json())
        .then(data => {
            if (data.history && data.history.length > 0) {
                renderHistory(data.history);
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

function renderHistory(history) {
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '';
    
    const historyTemplate = document.getElementById('history-item-template');
    
    history.forEach(item => {
        const historyElement = historyTemplate.content.cloneNode(true);
        
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
        
        historyElement.querySelector('.history-date').textContent = timeAgo(item.createdAt);
        
        historyContainer.appendChild(historyElement);
    });
    
    lastHistoryCount = history.length;
}

function renderTicketDetails(ticket) {
    document.getElementById('ticket-title').textContent = ticket.summary;
    document.getElementById('ticket-category').textContent = ticket.category.name;
    document.getElementById('ticket-created').textContent = formatDate(ticket.createdAt, true);
    
    const statusBadge = document.getElementById('ticket-status-badge');
    statusBadge.textContent = formatStatus(ticket.status);
    statusBadge.dataset.status = ticket.status;
    
    const priorityBadge = document.getElementById('ticket-priority-badge');
    priorityBadge.textContent = ticket.priority;
    priorityBadge.dataset.priority = ticket.priority;
    
    document.getElementById('ticket-submitted-by').textContent = ticket.user.email;
    document.getElementById('ticket-description').textContent = ticket.description;
    
    // Display assigned agent if available
    const assignedToElem = document.getElementById('ticket-assigned-to');
    if (assignedToElem) {
        if (ticket.assignedTo) {
            assignedToElem.textContent = `${formatRole(ticket.assignedRole)}`;
        } else {
            assignedToElem.textContent = 'Unassigned';
        }
    }
    
    const statusSelect = document.getElementById('ticket-status');
    if (statusSelect) {
        statusSelect.value = ticket.status;
    }
    
    const prioritySelect = document.getElementById('ticket-priority');
    if (prioritySelect) {
        prioritySelect.value = ticket.priority;
    }
}

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
            showToast('success', 'Updated', 'Ticket updated successfully');
            renderTicketDetails(data.ticket);
            loadTicketHistory(ticketId);
            
            // Show feedback form if ticket is now resolved
            if (data.ticket.status === 'resolved') {
                loadFeedbackStatus(ticketId);
            }
            
            updateDataStates();
        } else {
            showToast('error', 'Error', data.message || 'Failed to update ticket');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to update ticket');
    });
}

function openAssignModal(ticketId) {
    // Set modal title
    document.getElementById('modal-title').textContent = 'Assign Ticket';
    
    // Create modal content
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <form id="assign-ticket-form" class="modal-form">
            <div class="form-group">
                <label for="agent-selector">Select Support Agent</label>
                <select id="agent-selector" name="agent" required>
                    <option value="">Select an agent</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="role-selector">Support Level</label>
                <select id="role-selector" name="role" required>
                    <option value="">Select support level</option>
                    <option value="1st-line">1st Line Support</option>
                    <option value="2nd-line">2nd Line Support</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-assign">Cancel</button>
                <button type="submit" class="btn btn-primary">Assign Ticket</button>
            </div>
        </form>
    `;
    
    // Show modal
    openModal();
    
    // Load support agents
    loadSupportAgents();
    
    // Handle form submission
    const form = document.getElementById('assign-ticket-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('agent-selector').value;
        const role = document.getElementById('role-selector').value;
        
        if (!userId || !role) {
            showToast('error', 'Error', 'Please select both an agent and support level');
            return;
        }
        
        assignTicket(ticketId, userId, role);
    });
    
    // Handle cancel button
    document.getElementById('cancel-assign').addEventListener('click', closeModal);
}

function loadSupportAgents() {
    fetch('/api/org/users')
        .then(response => response.json())
        .then(data => {
            if (data.users) {
                const agentSelector = document.getElementById('agent-selector');
                
                // Filter for support agents
                const supportAgents = data.users.filter(user => 
                    user.role === '1st-line' || user.role === '2nd-line' || user.role === 'admin'
                );
                
                supportAgents.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user._id;
                    
                    let name = user.email;
                    if (user.profile && user.profile.firstName) {
                        name = `${user.profile.firstName} ${user.profile.lastName} (${user.email})`;
                    }
                    
                    option.textContent = `${name} - ${formatRole(user.role)}`;
                    agentSelector.appendChild(option);
                });
                
                // Update role selector based on selected agent
                const roleSelector = document.getElementById('role-selector');
                agentSelector.addEventListener('change', function() {
                    const selectedUser = supportAgents.find(u => u._id === this.value);
                    if (selectedUser) {
                        // Set default role based on the agent's role
                        if (selectedUser.role === '1st-line' || selectedUser.role === '2nd-line') {
                            roleSelector.value = selectedUser.role;
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading support agents:', error);
            showToast('error', 'Error', 'Failed to load support agents');
        });
}

function assignTicket(ticketId, userId, role) {
    fetch(`/api/ticket/${ticketId}/assign`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, role })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Ticket assigned successfully') {
            closeModal();
            showToast('success', 'Assigned', 'Ticket assigned successfully');
            
            // Reload ticket details to reflect changes
            loadTicketDetails(ticketId);
        } else {
            showToast('error', 'Error', data.message || 'Failed to assign ticket');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to assign ticket');
    });
}

function loadFeedbackStatus(ticketId) {
    // First check if this is the ticket's owner
    fetch(`/api/ticket/${ticketId}`)
        .then(response => response.json())
        .then(data => {
            if (data.ticket) {
                const currentUserId = document.querySelector('meta[name="user-id"]')?.content;
                const isTicketOwner = currentUserId === data.ticket.user._id;
                
                // Only show feedback form to ticket owner and only for resolved tickets
                if (isTicketOwner && data.ticket.status === 'resolved') {
                    // Check if feedback already exists
                    fetch(`/api/feedback/${ticketId}`)
                        .then(resp => {
                            // If feedback not found (404), show the form
                            if (resp.status === 404) {
                                showFeedbackForm(ticketId);
                            } else if (resp.ok) {
                                // Feedback exists, show a note
                                document.getElementById('feedback-section').innerHTML = `
                                    <div class="alert alert-success">
                                        <i class="fas fa-check-circle"></i>
                                        <span>You've already provided feedback for this ticket.</span>
                                    </div>
                                `;
                            }
                        })
                        .catch(err => {
                            // On error, assume no feedback, show form
                            showFeedbackForm(ticketId);
                        });
                }
            }
        })
        .catch(error => {
            console.error('Error checking ticket ownership:', error);
        });
}

function showFeedbackForm(ticketId) {
    const feedbackSection = document.getElementById('feedback-section');
    if (feedbackSection) {
        feedbackSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Your Feedback</h3>
                </div>
                <div class="card-body">
                    <form id="feedback-form">
                        <div class="form-group">
                            <label>How would you rate our support?</label>
                            <div class="rating-container">
                                <div class="star-rating">
                                    <input type="radio" id="star5" name="rating" value="5" />
                                    <label for="star5"><i class="fas fa-star"></i></label>
                                    <input type="radio" id="star4" name="rating" value="4" />
                                    <label for="star4"><i class="fas fa-star"></i></label>
                                    <input type="radio" id="star3" name="rating" value="3" checked />
                                    <label for="star3"><i class="fas fa-star"></i></label>
                                    <input type="radio" id="star2" name="rating" value="2" />
                                    <label for="star2"><i class="fas fa-star"></i></label>
                                    <input type="radio" id="star1" name="rating" value="1" />
                                    <label for="star1"><i class="fas fa-star"></i></label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="feedback-comment">Additional Comments</label>
                            <textarea id="feedback-comment" name="comment" placeholder="Share your thoughts about our support..." rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Submit Feedback</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Set up form submission
        const form = document.getElementById('feedback-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitFeedback(ticketId);
            });
        }
    }
}

function submitFeedback(ticketId) {
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const comment = document.getElementById('feedback-comment').value;
    
    fetch(`/api/feedback/${ticketId}/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, comment })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Feedback submitted successfully') {
            showToast('success', 'Thank You', 'Your feedback has been submitted');
            
            // Replace form with confirmation message
            document.getElementById('feedback-section').innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>Thank you for your feedback!</span>
                </div>
            `;
            
            // Reload ticket details as status may have changed to closed
            loadTicketDetails(ticketId);
        } else {
            showToast('error', 'Error', data.message || 'Failed to submit feedback');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to submit feedback');
    });
}

function formatRole(role) {
    switch(role) {
        case '1st-line': return '1st Line Support';
        case '2nd-line': return '2nd Line Support';
        case 'admin': return 'Administrator';
        default: return 'User';
    }
}

function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}