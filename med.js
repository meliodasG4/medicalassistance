document.addEventListener('DOMContentLoaded', () => {
   
    const medicationsSection = document.getElementById('medications');
    if (!medicationsSection) return;

   
    const medList = document.getElementById('medication-list');
    const addMedBtn = document.getElementById('add-med-btn');
    const medModal = document.getElementById('med-modal');
    const closeBtn = document.querySelector('.close-btn');
    const medForm = document.getElementById('med-form');
    const modalTitle = document.getElementById('modal-title');
    
   
    let medications = JSON.parse(localStorage.getItem('medications')) || [];
    let currentMedId = null;

    
    setupTimeInputs();

    function renderMedications() {
        medList.innerHTML = '';
        
        if (medications.length === 0) {
            medList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pills" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
                    <h3>No Medications Added</h3>
                    <p>Click "Add Medication" to get started</p>
                </div>
            `;
            return;
        }
        
        medications.forEach(med => {
            const medCard = document.createElement('div');
            medCard.className = 'medication-card';
            medCard.innerHTML = `
                <h3 class="med-name">${med.name}</h3>
                <div class="med-details">
                    <div><i class="fas fa-prescription-bottle-alt"></i> <strong>Dosage:</strong> ${med.dosage}</div>
                    <div><i class="fas fa-clock"></i> <strong>Frequency:</strong> ${med.frequency}</div>
                    ${med.times.length > 0 ? 
                        `<div><i class="fas fa-calendar-day"></i> <strong>Times:</strong> ${med.times.join(', ')}</div>` : ''}
                    ${med.notes ? `<div><i class="fas fa-sticky-note"></i> <strong>Notes:</strong> ${med.notes}</div>` : ''}
                </div>
                <div class="med-actions">
                    <button class="action-btn edit-btn" data-id="${med.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${med.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            medList.appendChild(medCard);
        });
        
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editMedication(e.target.closest('button').dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteMedication(e.target.closest('button').dataset.id));
        });
    }

    
    function openAddModal() {
        currentMedId = null;
        modalTitle.textContent = 'Add New Medication';
        medForm.reset();
        setTimeInputs([]); 
        medModal.style.display = 'flex';
        document.getElementById('med-name').focus();
    }

    
    function editMedication(id) {
        const med = medications.find(m => m.id === id);
        if (!med) return;
        
        currentMedId = id;
        modalTitle.textContent = 'Edit Medication';
        
        
        document.getElementById('med-id').value = med.id;
        document.getElementById('med-name').value = med.name;
        document.getElementById('med-dosage').value = med.dosage;
        document.getElementById('med-frequency').value = med.frequency;
        document.getElementById('med-notes').value = med.notes || '';
        
      
        setTimeInputs(med.times);
        
        medModal.style.display = 'flex';
        document.getElementById('med-name').focus();
    }

    function deleteMedication(id) {
        if (confirm('Are you sure you want to delete this medication?')) {
            medications = medications.filter(m => m.id !== id);
            saveMedications();
            renderMedications();
            
           
            showNotification('Medication deleted successfully');
        }
    }

    
    function saveMedications() {
        localStorage.setItem('medications', JSON.stringify(medications));
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

    
    medForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            id: currentMedId || Date.now().toString(),
            name: document.getElementById('med-name').value.trim(),
            dosage: document.getElementById('med-dosage').value.trim(),
            frequency: document.getElementById('med-frequency').value,
            times: getTimeInputs(),
            notes: document.getElementById('med-notes').value.trim()
        };
        
        if (!formData.name || !formData.dosage || !formData.frequency || formData.times.length === 0) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (currentMedId) {
            
            const index = medications.findIndex(m => m.id === currentMedId);
            if (index !== -1) {
                medications[index] = formData;
                showNotification('Medication updated successfully');
            }
        } else {
           
            medications.push(formData);
            showNotification('Medication added successfully');
        }
        
        saveMedications();
        renderMedications();
        medModal.style.display = 'none';
    });

    
    addMedBtn.addEventListener('click', openAddModal);
    
    closeBtn.addEventListener('click', () => {
        medModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === medModal) {
            medModal.style.display = 'none';
        }
    });

   
    function setupTimeInputs() {
        const timeInputsContainer = document.getElementById('time-inputs');
        const addTimeBtn = document.getElementById('add-time-btn');
        
        addTimeBtn.addEventListener('click', addTimeInput);
    }

    function addTimeInput(timeValue = '') {
        const timeInputsContainer = document.getElementById('time-inputs');
        const timeId = `time-${Date.now()}`;
        
        const timeInputDiv = document.createElement('div');
        timeInputDiv.className = 'time-input-container';
        timeInputDiv.innerHTML = `
            <input type="time" id="${timeId}" value="${timeValue}" required>
            <button type="button" class="remove-time-btn" data-timeid="${timeId}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        timeInputsContainer.appendChild(timeInputDiv);
        
      
        timeInputDiv.querySelector('.remove-time-btn').addEventListener('click', (e) => {
            e.target.closest('.time-input-container').remove();
        });
    }

    function getTimeInputs() {
        const times = [];
        document.querySelectorAll('.time-input-container input[type="time"]').forEach(input => {
            if (input.value) {
                times.push(input.value);
            }
        });
        return times;
    }

    function setTimeInputs(times) {
        const timeInputsContainer = document.getElementById('time-inputs');
        timeInputsContainer.innerHTML = '';
        
        if (times && times.length > 0) {
            times.forEach(time => addTimeInput(time));
        } else {
            addTimeInput();
        }
    }

  
    renderMedications();
});