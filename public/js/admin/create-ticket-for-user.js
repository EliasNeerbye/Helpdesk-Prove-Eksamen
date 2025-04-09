document.addEventListener('DOMContentLoaded', function() {
    const createForUserBtn = document.getElementById('create-for-user-btn');
    
    if (!createForUserBtn) return;
    
    createForUserBtn.addEventListener('click', openCreateTicketForUserModal);
    
    function openCreateTicketForUserModal() {
        const template = document.getElementById('create-ticket-for-user-template');
        
        document.getElementById('modal-title').textContent = 'Create Ticket for User';
        
        const modalContent = template.content.cloneNode(true);
        
        document.getElementById('modal-body').innerHTML = '';
        document.getElementById('modal-body').appendChild(modalContent);
        
        openModal();
        
        loadUsers();
        loadCategories('ticket-user-category');
        
        const form = document.getElementById('ticket-for-user-form');
        form.addEventListener('submit', handleFormSubmit);
        
        document.getElementById('cancel-ticket-for-user').addEventListener('click', closeModal);
    }
    
    function loadUsers() {
        const userSelect = document.getElementById('user-select');
        
        if (!userSelect) return;
        
        fetch('/api/org/users')
            .then(response => {
    return response.json();
})
            .then(data => {
                if (data.users && Array.isArray(data.users)) {
                    userSelect.innerHTML = '<option value="">Select a user</option>';
                    
                    data.users.forEach(user => {
                        const option = document.createElement('option');
                        option.value = user._id;
                        
                        if (user.profile && (user.profile.firstName || user.profile.lastName)) {
                            option.textContent = `${user.profile.firstName || ''} ${user.profile.lastName || ''} (${user.email})`;
                        } else {
                            option.textContent = user.email;
                        }
                        
                        userSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading users:', error);
                showToast('error', 'Error', 'Failed to load users');
            });
    }
    
    function loadCategories(selectId) {
        const categorySelect = document.getElementById(selectId);
        
        if (!categorySelect) return;
        
        fetch('/api/category/list')
            .then(response => {
    return response.json();
})
            .then(data => {
                if (data.categories) {
                    categorySelect.innerHTML = '<option value="">Select a category</option>';
                    
                    data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category._id;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                showToast('error', 'Error', 'Failed to load categories');
            });
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            userId: formData.get('userId'),
            summary: formData.get('summary'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority')
        };
        
        if (!data.userId || !data.description || !data.category) {
            showToast('error', 'Error', 'Please fill in all required fields');
            return;
        }
        
        fetch('/api/ticket/create-for-user', {
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
            if (data.message === 'Ticket created successfully for user') {
                closeModal();
                showToast('success', 'Success', 'Ticket created successfully for user');
                
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast('error', 'Error', data.message || 'Failed to create ticket');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('error', 'Error', 'Failed to create ticket');
        });
    }
});