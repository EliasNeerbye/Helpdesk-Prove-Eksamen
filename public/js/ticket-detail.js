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

function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}