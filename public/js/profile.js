/**
 * Profile page functionality
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the profile page
    initializeProfile();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Initializes the profile page by loading the profile and setting up the UI.
 */
function initializeProfile() {
    fetchProfileData()
        .then(data => {
            const hasProfile = data.profile != null;

            // Show appropriate UI based on profile existence
            const createProfileSection = document.getElementById('create-profile-section');
            const updateProfileSection = document.getElementById('update-profile-section');
            const profileMissingBanner = document.getElementById('profile-missing-banner');

            if (hasProfile) {
                // Profile exists - show update UI
                if (createProfileSection) createProfileSection.style.display = 'none';
                if (updateProfileSection) updateProfileSection.style.display = 'flex';
                if (profileMissingBanner) profileMissingBanner.style.display = 'none';

                // Populate form with existing data
                populateProfileForm(data.profile);

                // Set account creation date
                if (data.user) {
                    const createdAt = formatDate(data.user.createdAt, true);
                    document.getElementById('account-created').textContent = createdAt;
                }

                // Set profile picture
                if (data.profile.profilePicture) {
                    const profileImg = document.getElementById('profile-image');
                    const placeholder = document.getElementById('profile-image-placeholder');
                    const imgUrl = `/assets/uploads/${data.profile.profilePicture}`;

                    if (profileImg) {
                        profileImg.src = imgUrl; // Update the image source
                    } else if (placeholder) {
                        // Replace placeholder with actual image
                        const img = document.createElement('img');
                        img.src = imgUrl;
                        img.alt = 'Profile Photo';
                        img.id = 'profile-image';

                        placeholder.parentNode.replaceChild(img, placeholder);
                    }
                }
            } else {
                // No profile - show create UI
                if (createProfileSection) createProfileSection.style.display = 'block';
                if (updateProfileSection) updateProfileSection.style.display = 'none';
                if (profileMissingBanner) profileMissingBanner.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error initializing profile:', error);
            showToast('error', 'Error', 'Failed to load profile');
        });
}

/**
 * Populates the profile form with existing profile data.
 * @param {Object} profile - The profile data to populate.
 */
function populateProfileForm(profile) {
    if (profile.firstName) document.getElementById('firstName').value = profile.firstName;
    if (profile.lastName) document.getElementById('lastName').value = profile.lastName;
    if (profile.phone) document.getElementById('phone').value = profile.phone;

    // Set profession dropdown if it exists
    if (profile.profession) {
        const professionSelect = document.getElementById('profession');
        if (professionSelect) {
            professionSelect.value = profile.profession._id || profile.profession;
        }
    }
}

/**
 * Reloads the profile only if necessary.
 */
function reloadProfileIfNeeded() {
    fetchProfileData()
        .then(data => {
            const hasProfile = data.profile != null;

            if (hasProfile) {
                // Update the profile form with the latest data
                populateProfileForm(data.profile);
            }
        })
        .catch(error => {
            console.error('Error reloading profile:', error);
            showToast('error', 'Error', 'Failed to reload profile');
        });
}

/**
 * Sets up event listeners
 */
function setupEventListeners() {
    // Create profile form submission
    const createProfileForm = document.getElementById('create-profile-form');
    if (createProfileForm) {
        createProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createProfile();
        });
    }
    
    // Update profile form submission
    const updateProfileForm = document.getElementById('profile-form');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Photo upload button
    const uploadPhotoBtn = document.getElementById('upload-photo-btn');
    const photoInput = document.getElementById('profile-photo-input');
    
    if (uploadPhotoBtn && photoInput) {
        uploadPhotoBtn.addEventListener('click', function() {
            photoInput.click();
        });
        
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                uploadProfilePhoto(this.files[0]);
            }
        });
    }
    
    // Delete profile button
    const deleteProfileBtn = document.getElementById('delete-profile-btn');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', function() {
            openDeleteProfileConfirmation();
        });
    }
}

/**
 * Creates a new profile
 */
function createProfile() {
    const formData = {
        firstName: document.getElementById('create-firstName').value,
        lastName: document.getElementById('create-lastName').value,
        phone: document.getElementById('create-phone').value,
        profession: document.getElementById('create-profession').value || null
    };
    
    fetch('/api/profile/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
    return response.json();
})
    .then(data => {
        if (data.message === 'Profile created successfully') {
            showToast('success', 'Success', 'Profile created successfully');
            
            // Refresh page to show update UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast('error', 'Error', data.message || 'Failed to create profile');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to create profile');
    });
}

/**
 * Updates the user's profile
 */
function updateProfile() {
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        profession: document.getElementById('profession').value || null
    };
    
    fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
    return response.json();
})
    .then(data => {
        if (data.message === 'Profile updated successfully') {
            showToast('success', 'Success', 'Profile updated successfully');
        } else {
            showToast('error', 'Error', data.message || 'Failed to update profile');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to update profile');
    });
}

/**
 * Uploads a profile photo
 * @param {File} file - The file to upload
 */
function uploadProfilePhoto(file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Error', 'Image size should not exceed 5MB');
        return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showToast('error', 'Error', 'Please upload a valid image file (JPEG, PNG, GIF)');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('firstName', document.getElementById("firstName").value); // Dummy field to prevent error
    
    // Send request
    fetch('/api/profile/update', {
        method: 'PUT',
        body: formData
    })
    .then(response => {
    return response.json();
})
    .then(data => {
        if (data.message === 'Profile updated successfully') {
            // Update profile image on page
            const profileImg = document.getElementById('profile-image');
            const placeholder = document.getElementById('profile-image-placeholder');
            if (data.profile && data.profile.profilePicture) {
                const imgUrl = `/assets/uploads/${data.profile.profilePicture}`;
                
                if (profileImg) {
                    profileImg.src = imgUrl;
                } else if (placeholder) {
                    // Replace placeholder with actual image
                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.alt = 'Profile Photo';
                    img.id = 'profile-image';
                    
                    placeholder.parentNode.replaceChild(img, placeholder);
                }
            }
            
            showToast('success', 'Success', 'Profile photo updated successfully');
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast('error', 'Error', data.message || 'Failed to update profile photo');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to update profile photo');
    });
}

/**
 * Opens the delete profile confirmation modal
 */
function openDeleteProfileConfirmation() {
    // Get template
    const template = document.getElementById('delete-profile-confirmation-template');
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'Confirm Delete Profile';
    
    // Clone template content
    const modalContent = template.content.cloneNode(true);
    
    // Add to modal body
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(modalContent);
    
    // Show modal
    openModal();
    
    // Add event listeners
    document.getElementById('cancel-delete-profile').addEventListener('click', closeModal);
    document.getElementById('confirm-delete-profile').addEventListener('click', deleteProfile);
}

/**
 * Deletes the user's profile
 */
function deleteProfile() {
    fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
    return response.json();
})
    .then(data => {
        if (data.message === 'Profile deleted successfully') {
            // Close modal
            closeModal();
            
            // Show success message
            showToast('success', 'Deleted', 'Profile deleted successfully');
            
            // Reload page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast('error', 'Error', data.message || 'Failed to delete profile');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to delete profile');
    });
}

/**
 * Fetches profile data from the server.
 * @returns {Promise<Object>} The profile data.
 */
function fetchProfileData() {
    return fetch('/api/profile/get')
        .then(response => {
    return response.json();
})
        .catch(error => {
            console.error('Error fetching profile:', error);
            throw error;
        });
}