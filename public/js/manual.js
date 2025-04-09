document.addEventListener('DOMContentLoaded', function() {
    // Show user manual based on role
    const showManualBtn = document.getElementById('show-manual-btn');
    if (showManualBtn) {
        showManualBtn.addEventListener('click', openUserManual);
    }
});

function openUserManual() {
    // Get user role
    const userRole = document.querySelector('meta[name="user-role"]')?.content || 'user';
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'User Manual';
    
    // Create content based on role
    let manualContent = '';
    
    switch(userRole) {
        case '1st-line':
            manualContent = createFirstLineManual();
            break;
        case '2nd-line':
            manualContent = createSecondLineManual();
            break;
        case 'admin':
            manualContent = createAdminManual();
            break;
        default:
            manualContent = createUserManual();
    }
    
    // Set modal content
    document.getElementById('modal-body').innerHTML = manualContent;
    
    // Show modal
    openModal();
}

function createUserManual() {
    return `
        <div class="manual-content">
            <h3>Customer User Manual</h3>
            
            <div class="manual-section">
                <h4>Creating a Ticket</h4>
                <p>To create a new support ticket:</p>
                <ol>
                    <li>Click the "New Ticket" button in the sidebar or on the tickets page</li>
                    <li>Fill in the summary and detailed description of your issue</li>
                    <li>Select the appropriate category and priority</li>
                    <li>Click "Create Ticket" to submit</li>
                </ol>
                <p>Your ticket will be assigned to a support agent who will begin working on your issue.</p>
            </div>
            
            <div class="manual-section">
                <h4>Tracking Your Tickets</h4>
                <p>You can view all your tickets on the "Tickets" page. Each ticket will display:</p>
                <ul>
                    <li>Status (Open, In Progress, Resolved, Closed)</li>
                    <li>Priority (Low, Medium, High)</li>
                    <li>Creation date</li>
                </ul>
                <p>Click on any ticket to view its details and conversation history.</p>
            </div>
            
            <div class="manual-section">
                <h4>Responding to Comments</h4>
                <p>When a support agent responds to your ticket, you can reply by:</p>
                <ol>
                    <li>Opening the ticket details</li>
                    <li>Scrolling to the comment section</li>
                    <li>Entering your response</li>
                    <li>Clicking "Add Comment"</li>
                </ol>
            </div>
            
            <div class="manual-section">
                <h4>Providing Feedback</h4>
                <p>When your ticket is marked as "Resolved", you'll be able to provide feedback:</p>
                <ol>
                    <li>Open the resolved ticket</li>
                    <li>Look for the feedback form at the bottom</li>
                    <li>Rate your experience (1-5 stars)</li>
                    <li>Add any additional comments</li>
                    <li>Submit your feedback</li>
                </ol>
                <p>Your feedback helps us improve our support services.</p>
            </div>
        </div>
    `;
}

function createFirstLineManual() {
    return `
        <div class="manual-content">
            <h3>1st Line Support Manual</h3>
            
            <div class="manual-section">
                <h4>Your Role</h4>
                <p>As a 1st Line Support agent, you are responsible for:</p>
                <ul>
                    <li>Initial triage of incoming tickets</li>
                    <li>Resolving common and straightforward issues</li>
                    <li>Escalating complex issues to 2nd Line Support</li>
                    <li>Maintaining clear communication with customers</li>
                </ul>
            </div>
            
            <div class="manual-section">
                <h4>Managing Tickets</h4>
                <p>To handle tickets assigned to you:</p>
                <ol>
                    <li>Go to the "Tickets" page to see all tickets</li>
                    <li>Use filters to view tickets assigned to you</li>
                    <li>Set ticket status to "In Progress" when you start working on it</li>
                    <li>Add comments to communicate with customers</li>
                    <li>Set status to "Resolved" when the issue is fixed</li>
                </ol>
            </div>
            
            <div class="manual-section">
                <h4>Escalating Tickets</h4>
                <p>If a ticket requires 2nd Line Support:</p>
                <ol>
                    <li>Add a comment explaining why you're escalating</li>
                    <li>Contact an admin to reassign the ticket to 2nd Line</li>
                    <li>Inform the customer about the escalation</li>
                </ol>
            </div>
            
            <div class="manual-section">
                <h4>Best Practices</h4>
                <ul>
                    <li>Respond to tickets within 4 hours</li>
                    <li>Use clear, non-technical language with customers</li>
                    <li>Document all troubleshooting steps taken</li>
                    <li>Follow up with customers after resolution</li>
                </ul>
            </div>
        </div>
    `;
}

function createSecondLineManual() {
    return `
        <div class="manual-content">
            <h3>2nd Line Support Manual</h3>
            
            <div class="manual-section">
                <h4>Your Role</h4>
                <p>As a 2nd Line Support agent, you are responsible for:</p>
                <ul>
                    <li>Handling complex technical issues escalated from 1st Line</li>
                    <li>Performing in-depth troubleshooting</li>
                    <li>Coordinating with IT teams for system-wide issues</li>
                    <li>Providing technical guidance to 1st Line Support</li>
                </ul>
            </div>
            
            <div class="manual-section">
                <h4>Managing Escalated Tickets</h4>
                <p>When handling escalated tickets:</p>
                <ol>
                    <li>Review all previous troubleshooting steps</li>
                    <li>Update ticket status to "In Progress"</li>
                    <li>Perform advanced diagnostics</li>
                    <li>Document your findings thoroughly</li>
                    <li>Implement technical solutions</li>
                    <li>Set status to "Resolved" when fixed</li>
                </ol>
            </div>
            
            <div class="manual-section">
                <h4>Knowledge Sharing</h4>
                <p>To improve overall support quality:</p>
                <ul>
                    <li>Document common solutions for recurring issues</li>
                    <li>Provide technical guidance to 1st Line Support</li>
                    <li>Suggest process improvements based on your insights</li>
                </ul>
            </div>
            
            <div class="manual-section">
                <h4>Technical Standards</h4>
                <ul>
                    <li>Maintain detailed technical notes on all tickets</li>
                    <li>Follow security protocols when implementing solutions</li>
                    <li>Test all solutions thoroughly before marking as resolved</li>
                    <li>Communicate complex issues in clear terms to customers</li>
                </ul>
            </div>
        </div>
    `;
}

function createAdminManual() {
    return `
        <div class="manual-content">
            <h3>Administrator Manual</h3>
            
            <div class="manual-section">
                <h4>User Management</h4>
                <p>As an admin, you can manage users by:</p>
                <ol>
                    <li>Going to "Admin" > "Users" in the sidebar</li>
                    <li>Adding new users to the system</li>
                    <li>Assigning roles (User, 1st Line, 2nd Line, Admin)</li>
                    <li>Removing users when necessary</li>
                </ol>
            </div>
            
            <div class="manual-section">
                <h4>Ticket Assignment</h4>
                <p>To assign tickets to support staff:</p>
                <ol>
                    <li>Open the ticket details</li>
                    <li>Click the "Assign" button</li>
                    <li>Select the appropriate agent and support level</li>
                    <li>Click "Assign Ticket" to confirm</li>
                </ol>
            </div>
            
            <div class="manual-section">
                <h4>Statistics & Reporting</h4>
                <p>To view system statistics:</p>
                <ul>
                    <li>Check the dashboard for high-level metrics</li>
                    <li>View detailed statistics by clicking on "Statistics" in the admin menu</li>
                    <li>See tickets by status, priority, and support level</li>
                    <li>Monitor ticket resolution performance by team</li>
                </ul>
            </div>
            
            <div class="manual-section">
                <h4>Category Management</h4>
                <p>To manage ticket categories:</p>
                <ol>
                    <li>Go to "Admin" > "Categories"</li>
                    <li>Add new categories as needed</li>
                    <li>Edit or remove existing categories</li>
                </ol>
            </div>
        </div>
    `;
}