document.addEventListener('DOMContentLoaded', () => {
    const professionsList = document.getElementById('professions-body');
    const loadingSpinner = document.getElementById('professions-loading');
    const professionsContainer = document.getElementById('professions-list');
    const addProfessionBtn = document.getElementById('add-profession-btn');

    // Fetch and render professions
    function fetchProfessions() {
        loadingSpinner.style.display = 'block';
        professionsContainer.style.display = 'none';
        professionsList.innerHTML = '';

        fetch('/api/profession/list')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch professions');
                }
                return response.json();
            })
            .then(data => {
                loadingSpinner.style.display = 'none';
                if (data.professions && data.professions.length > 0) {
                    professionsContainer.style.display = 'block';
                    data.professions.forEach(profession => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${profession.name}</td>
                            <td>${profession.description || 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-danger delete-profession" data-id="${profession._id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        `;
                        professionsList.appendChild(row);
                    });
                } else {
                    professionsContainer.style.display = 'none';
                }
            })
            .catch(error => {
                loadingSpinner.style.display = 'none';
                console.error('Error fetching professions:', error);
                showToast('error', 'Error', 'Failed to fetch professions. Please try again later.');
            });
    }

    // Open modal for adding a profession
    addProfessionBtn.addEventListener('click', () => {
        // Set modal title
        document.getElementById('modal-title').textContent = 'Add Profession';

        // Create modal content
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <form id="profession-form" class="modal-form">
                <div class="form-group">
                    <label for="profession-name">Profession Name</label>
                    <input type="text" id="profession-name" name="name" placeholder="Enter profession name" required>
                </div>
                <div class="form-group">
                    <label for="profession-description">Description</label>
                    <textarea id="profession-description" name="description" placeholder="Enter profession description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-profession">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Profession</button>
                </div>
            </form>
        `;

        // Show modal
        openModal();

        // Handle form submission
        const form = document.getElementById('profession-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            fetch('/api/profession/create', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create profession');
                }
                return response.json();
            })
            .then(() => {
                closeModal();
                fetchProfessions(); // Refresh the list
                showToast('success', 'Success', 'Profession added successfully');
            })
            .catch(error => {
                console.error('Error creating profession:', error);
                showToast('error', 'Error', 'Failed to create profession. Please try again later.');
            });
        });

        // Handle cancel button
        document.getElementById('cancel-profession').addEventListener('click', closeModal);
    });

    fetchProfessions();
});