document.addEventListener('DOMContentLoaded', function() {
    const showFaqBtn = document.getElementById('show-faq-btn');
    if (showFaqBtn) {
        showFaqBtn.addEventListener('click', openFaqModal);
    }
});

function openFaqModal() {
    // Set modal title
    document.getElementById('modal-title').textContent = 'Frequently Asked Questions';
    
    // Create FAQ content
    const faqContent = `
        <div class="faq-content">
            <div class="faq-section">
                <h3>General Questions</h3>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>How do I create a new support ticket?</h4>
                    </div>
                    <div class="faq-answer">
                        <p>To create a new ticket, click the "New Ticket" button in the sidebar or on the tickets page. Fill in the required information including a summary, detailed description, and select the appropriate category and priority.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>What do the different ticket priorities mean?</h4>
                    </div>
                    <div class="faq-answer">
                        <p><strong>Low:</strong> Issues that have minimal impact on business operations. These will be addressed as resources become available.</p>
                        <p><strong>Medium:</strong> Issues that affect productivity but have workarounds available. The default priority for most tickets.</p>
                        <p><strong>High:</strong> Critical issues that significantly impact business operations and require immediate attention.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>How do I check the status of my ticket?</h4>
                    </div>
                    <div class="faq-answer">
                        <p>You can view the status of all your tickets on the "Tickets" page. The status is displayed in the status column and is color-coded for easy reference.</p>
                    </div>
                </div>
            </div>
            
            <div class="faq-section">
                <h3>Ticket Management</h3>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>What are the different ticket statuses?</h4>
                    </div>
                    <div class="faq-answer">
                        <p><strong>Open:</strong> The ticket has been created but not yet assigned or worked on.</p>
                        <p><strong>In Progress:</strong> A support agent has been assigned and is actively working on the issue.</p>
                        <p><strong>Resolved:</strong> The support agent has completed work on the ticket and believes the issue is fixed.</p>
                        <p><strong>Closed:</strong> The ticket has been resolved and the user has confirmed the solution or provided feedback.</p>
                        <p><strong>Canceled:</strong> The ticket has been canceled for some reason (duplicate, no longer relevant, etc.)</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>How do I provide feedback on a resolved ticket?</h4>
                    </div>
                    <div class="faq-answer">
                        <p>When your ticket is marked as "Resolved", you'll see a feedback form at the bottom of the ticket details page. You can rate your experience (1-5 stars) and provide additional comments. Your feedback helps us improve our support services.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>What is the difference between 1st and 2nd line support?</h4>
                    </div>
                    <div class="faq-answer">
                        <p><strong>1st Line Support:</strong> Handles initial triage and resolution of common issues. They are your first point of contact for all support requests.</p>
                        <p><strong>2nd Line Support:</strong> Handles more complex technical issues that require deeper investigation. Tickets are escalated to 2nd line when they cannot be resolved by 1st line support.</p>
                    </div>
                </div>
            </div>
            
            <div class="faq-section">
                <h3>Account Management</h3>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>How do I update my profile information?</h4>
                    </div>
                    <div class="faq-answer">
                        <p>Click on your name in the sidebar footer or go to the "Profile" page. Here you can update your personal information, add a profile picture, and set your profession.</p>
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">
                        <i class="fas fa-question-circle"></i>
                        <h4>What information is visible to support agents?</h4>
                    </div>
                    <div class="faq-answer">
                        <p>Support agents can see your ticket details, including the description and any comments you've added. They can also see your basic profile information such as name and email address. This helps them provide personalized support.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set modal content
    document.getElementById('modal-body').innerHTML = faqContent;
    
    // Add click handlers for expanding/collapsing FAQ items
    setTimeout(() => {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const item = this.parentElement;
                
                item.classList.toggle('expanded');
                
                if (item.classList.contains('expanded')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    }, 0);
    
    // Show modal
    openModal();
}