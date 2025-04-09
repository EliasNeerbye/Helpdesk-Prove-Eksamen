/**
 * Categories admin page functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load categories
    loadCategories();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Sets up event listeners
 */
function setupEventListeners() {
    // Add category button
    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            openCategoryModal();
        });
    }
}

/**
 * Loads categories from the API
 */
function loadCategories() {
    const categoriesLoading = document.getElementById('categories-loading');
    const categoriesList = document.getElementById('categories-list');
    const emptyCategories = document.getElementById('empty-categories');
    
    fetch('/api/category/list')
        .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
        .then(data => {
            // Hide loading
            categoriesLoading.style.display = 'none';
            
            if (data.categories && data.categories.length > 0) {
                // Show categories list
                categoriesList.style.display = 'block';
                
                // Load each category
                renderCategories(data.categories);
            } else {
                // Show empty state
                emptyCategories.style.display = 'block';
                
                // Add event listener to create button
                const addFirstCategoryBtn = document.getElementById('add-first-category-btn');
                if (addFirstCategoryBtn) {
                    addFirstCategoryBtn.addEventListener('click', openCategoryModal);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            categoriesLoading.innerHTML = `
                <div class="error-message">
                    <p>Failed to load categories. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Renders categories to the table
 * @param {Array} categories - Array of category objects
 */
function renderCategories(categories) {
    const categoriesBody = document.getElementById('categories-body');
    categoriesBody.innerHTML = '';
    
    // Get row template
    const rowTemplate = document.getElementById('category-row-template');
    
    // Add each category
    categories.forEach(category => {
        const row = rowTemplate.content.cloneNode(true);
        
        // Set category data
        row.querySelector('.category-name').textContent = category.name;
        row.querySelector('.category-description').textContent = category.description || 'No description';
        
        // Fetch ticket count for this category
        countTicketsForCategory(category._id)
            .then(count => {
                row.querySelector('.category-tickets-count').textContent = count;
            });
        
        // Set up edit button
        const editBtn = row.querySelector('.edit-category');
        editBtn.addEventListener('click', function() {
            openCategoryModal(category);
        });
        
        // Set up delete button
        const deleteBtn = row.querySelector('.delete-category');
        deleteBtn.addEventListener('click', function() {
            openDeleteCategoryConfirmation(category);
        });
        
        categoriesBody.appendChild(row);
    });
}

/**
 * Counts tickets for a specific category
 * @param {string} categoryId - Category ID
 * @returns {Promise<number>} Promise that resolves to the count
 */
function countTicketsForCategory(categoryId) {
    return fetch('/api/ticket/list')
        .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
        .then(data => {
            if (data.tickets) {
                return data.tickets.filter(ticket => ticket.category._id === categoryId).length;
            }
            return 0;
        })
        .catch(error => {
            console.error('Error counting tickets:', error);
            return 0;
        });
}

/**
 * Opens the category modal for adding or editing
 * @param {Object} category - Category to edit (null for new category)
 */
function openCategoryModal(category = null) {
    // Get template
    const template = document.getElementById('category-form-template');
    
    // Set modal title
    document.getElementById('modal-title').textContent = category ? 'Edit Category' : 'Add Category';
    
    // Clone template content
    const modalContent = template.content.cloneNode(true);
    
    // Fill form if editing
    if (category) {
        modalContent.querySelector('#category-name').value = category.name;
        modalContent.querySelector('#category-description').value = category.description || '';
    }
    
    // Add to modal body
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(modalContent);
    
    // Show modal
    openModal();
    
    // Set up form submission
    const form = document.getElementById('category-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('category-name').value,
            description: document.getElementById('category-description').value
        };
        
        if (category) {
            updateCategory(category._id, formData);
        } else {
            createCategory(formData);
        }
    });
    
    // Set up cancel button
    const cancelBtn = document.getElementById('cancel-category');
    cancelBtn.addEventListener('click', closeModal);
}

/**
 * Creates a new category
 * @param {Object} formData - Form data for the category
 */
function createCategory(formData) {
    fetch('/api/category/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
    .then(data => {
        if (data.message === 'Category created successfully') {
            // Close modal
            closeModal();
            
            // Show success message
            showToast('success', 'Created', 'Category created successfully');
            
            // Reload categories
            loadCategories();
        } else {
            showToast('error', 'Error', data.message || 'Failed to create category');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to create category');
    });
}

/**
 * Updates an existing category
 * @param {string} categoryId - Category ID
 * @param {Object} formData - Form data for the category
 */
function updateCategory(categoryId, formData) {
    fetch(`/api/category/${categoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
    .then(data => {
        if (data.message === 'Category updated successfully') {
            // Close modal
            closeModal();
            
            // Show success message
            showToast('success', 'Updated', 'Category updated successfully');
            
            // Reload categories
            loadCategories();
        } else {
            showToast('error', 'Error', data.message || 'Failed to update category');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to update category');
    });
}

/**
 * Opens the delete category confirmation modal
 * @param {Object} category - Category to delete
 */
function openDeleteCategoryConfirmation(category) {
    // Get template
    const template = document.getElementById('delete-category-confirmation-template');
    
    // Set modal title
    document.getElementById('modal-title').textContent = 'Confirm Delete';
    
    // Clone template content
    const modalContent = template.content.cloneNode(true);
    
    // Update confirmation message
    const message = modalContent.querySelector('.confirmation-message p');
    message.textContent = `Are you sure you want to delete the category "${category.name}"? This may affect existing tickets.`;
    
    // Add to modal body
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-body').appendChild(modalContent);
    
    // Show modal
    openModal();
    
    // Add event listeners
    document.getElementById('cancel-delete-category').addEventListener('click', closeModal);
    document.getElementById('confirm-delete-category').addEventListener('click', function() {
        deleteCategory(category._id);
    });
}

/**
 * Deletes a category
 * @param {string} categoryId - Category ID
 */
function deleteCategory(categoryId) {
    fetch(`/api/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(err.message || 'An error occurred');
        });
    }
    return response.json();
})
    .then(data => {
        if (data.message === 'Category deleted successfully') {
            // Close modal
            closeModal();
            
            // Show success message
            showToast('success', 'Deleted', 'Category deleted successfully');
            
            // Reload categories
            loadCategories();
        } else {
            showToast('error', 'Error', data.message || 'Failed to delete category');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('error', 'Error', 'Failed to delete category');
    });
}