let lastCommentCount = 0;
let lastStatus = '';
let lastPriority = '';
let lastHistoryCount = 0;
let pollingInterval = null;

function startPolling(ticketId) {
    if (!ticketId) return;
    
    // Initialize with current data
    updateDataStates();
    
    // Set up polling interval (every 5 seconds)
    pollingInterval = setInterval(() => {
        checkForUpdates(ticketId);
    }, 5000);
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

function updateDataStates() {
    const commentsContainer = document.getElementById('comments-container');
    if (commentsContainer) {
        lastCommentCount = commentsContainer.querySelectorAll('.comment').length;
    }
    
    const statusBadge = document.getElementById('ticket-status-badge');
    if (statusBadge) {
        lastStatus = statusBadge.dataset.status;
    }
    
    const priorityBadge = document.getElementById('ticket-priority-badge');
    if (priorityBadge) {
        lastPriority = priorityBadge.dataset.priority;
    }
    
    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        lastHistoryCount = historyContainer.querySelectorAll('.history-item').length;
    }
}

function checkForUpdates(ticketId) {
    fetch(`/api/ticket/${ticketId}`)
        .then(response => response.json())
        .then(data => {
            if (data.ticket) {
                if (data.ticket.status !== lastStatus || data.ticket.priority !== lastPriority) {
                    updateTicketUI(data.ticket);
                    showToast('info', 'Ticket Updated', 'Ticket status or priority has been updated');
                }
                
                if (data.comments && data.comments.length !== lastCommentCount && lastCommentCount > 0) {
                    renderComments(data.comments);
                    showToast('info', 'New Comment', 'A new comment has been added to this ticket');
                }
            }
        })
        .catch(error => {
            console.error('Error checking for ticket updates:', error);
        });
    
    fetch(`/api/ticket/${ticketId}/history`)
        .then(response => response.json())
        .then(data => {
            if (data.history && data.history.length !== lastHistoryCount && lastHistoryCount > 0) {
                loadTicketHistory(ticketId);
                showToast('info', 'History Updated', 'Ticket history has been updated');
            }
        })
        .catch(error => {
            console.error('Error checking for history updates:', error);
        });
}

function updateTicketUI(ticket) {
    const statusBadge = document.getElementById('ticket-status-badge');
    if (statusBadge) {
        statusBadge.textContent = formatStatus(ticket.status);
        statusBadge.dataset.status = ticket.status;
    }
    
    const statusSelect = document.getElementById('ticket-status');
    if (statusSelect) {
        statusSelect.value = ticket.status;
    }
    
    const priorityBadge = document.getElementById('ticket-priority-badge');
    if (priorityBadge) {
        priorityBadge.textContent = ticket.priority;
        priorityBadge.dataset.priority = ticket.priority;
    }
    
    const prioritySelect = document.getElementById('ticket-priority');
    if (prioritySelect) {
        prioritySelect.value = ticket.priority;
    }
    
    lastStatus = ticket.status;
    lastPriority = ticket.priority;
}

window.addEventListener('beforeunload', () => {
    stopPolling();
});