/**
 * Users management functionality for admin panel
 */
document.addEventListener('DOMContentLoaded', () => {
    const usersList = document.getElementById('users-body');
    const loadingSpinner = document.getElementById('users-loading');
    const usersContainer = document.getElementById('users-list');
    const addUserBtn = document.getElementById('add-user-btn');
    
    // Fetch and render users
    function fetchUsers() {
        loadingSpinner.style.display = 'flex';
        usersContainer.style.display = 'none';
        
        fetch('/api/org/users')
            .then(response => response.json())
            .then(data => {
                if (data.users && Array.isArray(data.users)) {
                    usersList.innerHTML = '';
                    data.users.forEach(renderUserRow);
                }
                loadingSpinner.style.display = 'none';
                usersContainer.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                showToast('error', 'Error', 'Failed to load users. Please try again later.');
                loadingSpinner.style.display = 'none';
            });
    }

    // Render a single user row
    function renderUserRow(user) {
        const template = document.getElementById('user-row-template');
        const row = template.content.cloneNode(true);
        
        row.querySelector('.user-email').textContent = user.email;
        row.querySelector('.user-name').textContent = user.profile ? 
            `${user.profile.firstName} ${user.profile.lastName}` : 'No profile';
        row.querySelector('.user-role').textContent = user.role;
        row.querySelector('.user-profession').textContent = user.profile?.profession?.name || 'Not set';
        row.querySelector('.user-status').textContent = user.profile ? 'Active' : 'Incomplete';
        
        const deleteBtn = row.querySelector('.delete-user');
        
        deleteBtn.addEventListener('click', () => openDeleteUserConfirmation(user));
        
        usersList.appendChild(row);
    }


    // Open delete user confirmation
    function openDeleteUserConfirmation(user) {
        const template = document.getElementById('delete-user-confirmation-template');
        document.getElementById('modal-title').textContent = 'Delete User';
        
        const modalContent = template.content.cloneNode(true);
        document.getElementById('modal-body').innerHTML = '';
        document.getElementById('modal-body').appendChild(modalContent);
        
        openModal();
        
        document.getElementById('cancel-delete-user').addEventListener('click', closeModal);
        document.getElementById('confirm-delete-user').addEventListener('click', () => {
            removeUser(user._id);
        });
    }

    // Update user
    function updateUser(userId, data) {
        fetch(`/api/org/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                closeModal();
                fetchUsers();
                showToast('success', 'Success', 'User updated successfully');
            }
        })
        .catch(error => {
            console.error('Error updating user:', error);
            showToast('error', 'Error', 'Failed to update user. Please try again later.');
        });
    }

    // Remove user
    function removeUser(userId) {
        fetch(`/api/org/user/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                closeModal();
                fetchUsers();
                showToast('success', 'Success', 'User removed successfully');
            }
        })
        .catch(error => {
            console.error('Error removing user:', error);
            showToast('error', 'Error', 'Failed to remove user. Please try again later.');
        });
    }

    // Add new user
    addUserBtn.addEventListener('click', () => {
        const template = document.getElementById('edit-user-form-template');
        document.getElementById('modal-title').textContent = 'Add User';
        
        const modalContent = template.content.cloneNode(true);
        const form = modalContent.querySelector('#edit-user-form');
        
        // Add to modal body
        document.getElementById('modal-body').innerHTML = '';
        document.getElementById('modal-body').appendChild(modalContent);
        
        openModal();
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            fetch('/api/org/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.get('email')
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    closeModal();
                    fetchUsers();
                    showToast('success', 'Success', 'User added successfully');
                }
            })
            .catch(error => {
                console.error('Error adding user:', error);
                showToast('error', 'Error', 'Failed to add user. Please try again later.');
            });
        });
        
        document.getElementById('cancel-user').addEventListener('click', closeModal);
    });

    // Initial load
    fetchUsers();
});