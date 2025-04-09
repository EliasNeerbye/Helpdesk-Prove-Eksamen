document.addEventListener('DOMContentLoaded', () => {
    const usersList = document.getElementById('users-body');
    const loadingSpinner = document.getElementById('users-loading');
    const usersContainer = document.getElementById('users-list');
    const addUserBtn = document.getElementById('add-user-btn');
    let currentUserIsAdmin = false;
    
    // Fetch and render users
    function fetchUsers() {
        loadingSpinner.style.display = 'flex';
        usersContainer.style.display = 'none';
        
        fetch('/api/org/users')
            .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            showToast('error','Error',err.message || 'An error occurred');
        });
    }
    return response.json();
})
            .then(data => {
                if (data.users && Array.isArray(data.users)) {
                    usersList.innerHTML = '';
                    currentUserIsAdmin = data.currentUserIsAdmin;
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
        
        // Show role
        const roleCell = row.querySelector('.user-role');
        if (user.role === 'admin') {
            roleCell.textContent = 'System Admin';
            roleCell.classList.add('system-admin');
        } else if (user.role === '1st-line') {
            roleCell.textContent = '1st Line Support';
            roleCell.classList.add('support-role');
        } else if (user.role === '2nd-line') {
            roleCell.textContent = '2nd Line Support';
            roleCell.classList.add('support-role');
        } else {
            roleCell.textContent = user.isMainAdmin ? 
                'Organization Owner' : 
                (user.isOrgAdmin ? 'Organization Admin' : 'User');
            
            if (user.isMainAdmin) {
                roleCell.classList.add('main-admin');
            } else if (user.isOrgAdmin) {
                roleCell.classList.add('org-admin');
            }
        }
        
        row.querySelector('.user-profession').textContent = user.profile?.profession?.name || 'Not set';
        row.querySelector('.user-status').textContent = user.profile ? 'Active' : 'Incomplete';
        
        // Get action buttons
        const changeRoleBtn = row.querySelector('.change-role');
        const toggleAdminBtn = row.querySelector('.toggle-admin');
        const deleteBtn = row.querySelector('.delete-user');
        
        // Set up change role button
        if (changeRoleBtn) {
            if (user.isMainAdmin || !currentUserIsAdmin) {
                changeRoleBtn.style.display = 'none';
            } else {
                changeRoleBtn.addEventListener('click', () => {
                    openChangeRoleModal(user);
                });
            }
        }
        
        // Only hide toggle button if user is the main admin
        // Allow toggling orgAdmin status for all users except the main admin
        if (toggleAdminBtn) {
            if (user.isMainAdmin || !currentUserIsAdmin) {
                toggleAdminBtn.style.display = 'none';
            } else {
                // Set button text and icon based on current admin status
                if (user.isOrgAdmin) {
                    toggleAdminBtn.innerHTML = '<i class="fas fa-user"></i>';
                    toggleAdminBtn.classList.remove('btn-primary');
                    toggleAdminBtn.classList.add('btn-warning');
                    toggleAdminBtn.title = 'Demote to Regular User';
                } else {
                    toggleAdminBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
                    toggleAdminBtn.classList.remove('btn-warning');
                    toggleAdminBtn.classList.add('btn-primary');
                    toggleAdminBtn.title = 'Promote to Admin';
                }
                
                toggleAdminBtn.addEventListener('click', () => {
                    const action = user.isOrgAdmin ? 'demote' : 'promote';
                    openToggleAdminConfirmation(user, action);
                });
            }
        }
        
        // Only allow deletion if user is not the main admin and not the current user
        if (deleteBtn) {
            if (user.isMainAdmin || user._id === document.querySelector('meta[name="user-id"]')?.content) {
                deleteBtn.style.display = 'none';
            } else {
                deleteBtn.addEventListener('click', () => openDeleteUserConfirmation(user));
            }
        }
        
        usersList.appendChild(row);
    }
    
    // Open change role modal
    function openChangeRoleModal(user) {
        const template = document.getElementById('change-role-form-template');
        
        document.getElementById('modal-title').textContent = 'Change User Role';
        
        const modalContent = template.content.cloneNode(true);
        document.getElementById('modal-body').innerHTML = '';
        document.getElementById('modal-body').appendChild(modalContent);
        
        // Set current role in dropdown
        const roleSelect = document.getElementById('role-select');
        roleSelect.value = user.role;
        
        // Open modal
        openModal();
        
        // Handle form submission
        document.getElementById('change-role-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newRole = roleSelect.value;
            
            // Submit role change
            fetch('/api/user/change-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user._id,
                    role: newRole
                })
            })
            .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            showToast('error','Error',err.message || 'An error occurred');
        });
    }
    return response.json();
})
            .then(data => {
                if (data.message) {
                    closeModal();
                    showToast('success', 'Role Changed', `User role changed to ${formatRole(newRole)}`);
                    fetchUsers(); // Refresh the list
                } else {
                    showToast('error', 'Error', data.message || 'Failed to change user role');
                }
            })
            .catch(error => {
                console.error('Error changing role:', error);
                showToast('error', 'Error', 'Failed to change user role. Please try again later.');
            });
        });
        
        // Handle cancel button
        document.getElementById('cancel-role-change').addEventListener('click', closeModal);
    }

    // Format role for display
    function formatRole(role) {
        switch(role) {
            case '1st-line': return '1st Line Support';
            case '2nd-line': return '2nd Line Support';
            case 'admin': return 'Administrator';
            default: return 'User';
        }
    }

    // Toggle user's admin status
    function toggleAdminStatus(userId) {
        fetch('/api/org/toggle-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        })
        .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            showToast('error','Error',err.message || 'An error occurred');
        });
    }
    return response.json();
})
        .then(data => {
            if (data.message) {
                closeModal();
                showToast('success', 'Success', data.message);
                fetchUsers(); // Refresh the list
            } else {
                showToast('error', 'Error', data.message || 'Failed to update user status');
            }
        })
        .catch(error => {
            console.error('Error toggling admin status:', error);
            showToast('error', 'Error', 'Failed to update user status. Please try again later.');
        });
    }

    // Open toggle admin confirmation
    function openToggleAdminConfirmation(user, action) {
        const template = document.getElementById('toggle-admin-confirmation-template');
        const isPromote = action === 'promote';
        
        document.getElementById('modal-title').textContent = isPromote ? 'Promote User' : 'Demote User';
        
        const modalContent = template.content.cloneNode(true);
        
        // Update content based on action
        const iconEl = modalContent.querySelector('.confirmation-icon i');
        iconEl.className = isPromote ? 'fas fa-user-shield' : 'fas fa-user';
        
        const titleEl = modalContent.querySelector('h3');
        titleEl.textContent = isPromote ? 'Promote User to Admin' : 'Demote from Admin';
        
        // Update user name in confirmation message
        const userName = user.profile ? 
            `${user.profile.firstName} ${user.profile.lastName}` : user.email;
        
        const messageEl = modalContent.querySelector('.confirmation-message p:first-of-type');
        messageEl.innerHTML = isPromote ? 
            `Are you sure you want to promote <strong class="user-name-placeholder">${userName}</strong> to organization admin?` :
            `Are you sure you want to demote <strong class="user-name-placeholder">${userName}</strong> from organization admin?`;
        
        const descriptionEl = modalContent.querySelector('.confirmation-message p:last-of-type');
        descriptionEl.textContent = isPromote ?
            "This will give them administrative access to manage tickets, users, and organization settings." :
            "This will remove their administrative access to manage tickets, users, and organization settings.";
        
        // Update button
        const confirmBtn = modalContent.querySelector('#confirm-toggle-admin');
        confirmBtn.textContent = isPromote ? 'Promote to Admin' : 'Demote from Admin';
        confirmBtn.className = isPromote ? 'btn btn-primary' : 'btn btn-warning';
        
        document.getElementById('modal-body').innerHTML = '';
        document.getElementById('modal-body').appendChild(modalContent);
        
        openModal();
        
        document.getElementById('cancel-toggle-admin').addEventListener('click', closeModal);
        document.getElementById('confirm-toggle-admin').addEventListener('click', () => {
            toggleAdminStatus(user._id);
        });
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

    // Remove user
    function removeUser(userId) {
        fetch(`/api/org/user/${userId}`, {
            method: 'DELETE'
        })
        .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            showToast('error','Error',err.message || 'An error occurred');
        });
    }
    return response.json();
})
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
            .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            showToast('error','Error',err.message || 'An error occurred');
        });
    }
    return response.json();
})
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