document.addEventListener('DOMContentLoaded', () => {
  
    const contactsSection = document.getElementById('contacts');
    if (!contactsSection) return;


    const addContactBtn = document.getElementById('add-contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeContactBtn = contactModal.querySelector('.close-btn');
    const contactForm = document.getElementById('contact-form');
    const contactsContainer = document.getElementById('emergency-contacts');

    let emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts')) || [];
    let currentContactId = null;


    function initEmergencyContacts() {
        renderEmergencyContacts();
    }


    function renderEmergencyContacts() {

        const universalContacts = document.querySelectorAll('.emergency-card.universal');
        contactsContainer.innerHTML = '';
        universalContacts.forEach(contact => contactsContainer.appendChild(contact));
        
        if (emergencyContacts.length === 0) return;
        
        emergencyContacts.forEach(contact => {
            const contactCard = document.createElement('div');
            contactCard.className = 'emergency-card';
            contactCard.innerHTML = `
                <div class="emergency-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="emergency-info">
                    <h3>${contact.name}</h3>
                    <p>${contact.relation}</p>
                    <a href="tel:${contact.phone}" class="emergency-call">${contact.phone}</a>
                    ${contact.notes ? `<p class="contact-notes">${contact.notes}</p>` : ''}
                </div>
                <div class="emergency-actions">
                    <button class="emergency-action-btn edit-btn" data-id="${contact.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="emergency-action-btn delete-btn" data-id="${contact.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            contactsContainer.appendChild(contactCard);
        });
        

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editContact(e.target.closest('button').dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteContact(e.target.closest('button').dataset.id));
        });
    }


    function openAddContactModal() {
        currentContactId = null;
        document.getElementById('contact-modal-title').textContent = 'Add Emergency Contact';
        contactForm.reset();
        contactModal.style.display = 'flex';
        document.getElementById('contact-name').focus();
    }


    function editContact(id) {
        const contact = emergencyContacts.find(c => c.id === id);
        if (!contact) return;
        
        currentContactId = id;
        document.getElementById('contact-modal-title').textContent = 'Edit Contact';
        

        document.getElementById('contact-id').value = contact.id;
        document.getElementById('contact-name').value = contact.name;
        document.getElementById('contact-phone').value = contact.phone;
        document.getElementById('contact-relation').value = contact.relation;
        document.getElementById('contact-notes').value = contact.notes || '';
        
        contactModal.style.display = 'flex';
        document.getElementById('contact-name').focus();
    }

    function deleteContact(id) {
        if (confirm('Are you sure you want to delete this emergency contact?')) {
            emergencyContacts = emergencyContacts.filter(c => c.id !== id);
            saveEmergencyContacts();
            renderEmergencyContacts();
            showNotification('Contact deleted successfully');
        }
    }

    function saveEmergencyContacts() {
        localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
    }


    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            id: currentContactId || Date.now().toString(),
            name: document.getElementById('contact-name').value.trim(),
            phone: document.getElementById('contact-phone').value.trim(),
            relation: document.getElementById('contact-relation').value.trim(),
            notes: document.getElementById('contact-notes').value.trim()
        };
        
        if (!formData.name || !formData.phone || !formData.relation) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        

        if (!/^[\d\s\+\-\(\)]{7,}$/.test(formData.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        if (currentContactId) {

            const index = emergencyContacts.findIndex(c => c.id === currentContactId);
            if (index !== -1) {
                emergencyContacts[index] = formData;
                showNotification('Contact updated successfully');
            }
        } else {
  
            emergencyContacts.push(formData);
            showNotification('Contact added successfully');
        }
        
        saveEmergencyContacts();
        renderEmergencyContacts();
        contactModal.style.display = 'none';
    });

    addContactBtn.addEventListener('click', openAddContactModal);
    closeContactBtn.addEventListener('click', () => {
        contactModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });


    initEmergencyContacts();
});