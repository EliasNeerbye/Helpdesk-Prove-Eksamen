/**
 * Modal handling functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking on close button
    const modalCloseBtn = document.getElementById('modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking on overlay
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

/**
 * Opens the modal
 */
function openModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('hidden');
        document.body.classList.add('no-scroll');
    }
}

/**
 * Closes the modal
 */
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        
        // Clear modal content after animation completes
        setTimeout(() => {
            const modalBody = document.getElementById('modal-body');
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        }, 300);
    }
}