document.addEventListener('DOMContentLoaded', () => {
   
    const prescriptionsSection = document.getElementById('prescriptions');
    if (!prescriptionsSection) return;

 
    const uploadBtn = document.getElementById('upload-prescription-btn');
    const fileInput = document.getElementById('prescription-upload');
    const gallery = document.getElementById('prescriptions-gallery');
    const emptyState = document.getElementById('empty-prescriptions');
    const previewModal = document.getElementById('preview-modal');
    const previewImage = document.getElementById('preview-image');
    const deleteBtn = document.getElementById('delete-prescription-btn');
    const closePreviewBtn = previewModal.querySelector('.close-btn');

  
    let prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
    let currentPreviewIndex = null;

   
    function initPrescriptions() {
        renderPrescriptions();
        
       
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
        closePreviewBtn.addEventListener('click', () => previewModal.style.display = 'none');
        deleteBtn.addEventListener('click', deleteCurrentPrescription);
        
        window.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
            }
        });
    }

    
    function handleFileUpload(e) {
        const files = e.target.files;
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const prescription = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    image: event.target.result,
                    date: new Date().toISOString(),
                    name: file.name
                };
                
                prescriptions.push(prescription);
                savePrescriptions();
                renderPrescriptions();
            };
            reader.readAsDataURL(file);
        });
        
       
        fileInput.value = '';
    }

   
    function renderPrescriptions() {
        if (prescriptions.length === 0) {
            emptyState.style.display = 'block';
            gallery.innerHTML = '';
            gallery.appendChild(emptyState);
            return;
        }
        
        emptyState.style.display = 'none';
        gallery.innerHTML = '';
        
        prescriptions.forEach((prescription, index) => {
            const item = document.createElement('div');
            item.className = 'prescription-item';
            item.innerHTML = `
                <img src="${prescription.image}" alt="Prescription" class="prescription-image">
                <button class="prescription-delete" data-id="${prescription.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            
            item.querySelector('.prescription-image').addEventListener('click', () => {
                previewImage.src = prescription.image;
                currentPreviewIndex = index;
                previewModal.style.display = 'flex';
            });
            
          
            item.querySelector('.prescription-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deletePrescription(prescription.id);
            });
            
            gallery.appendChild(item);
        });
    }

    
    function deletePrescription(id) {
        if (confirm('Are you sure you want to delete this prescription?')) {
            prescriptions = prescriptions.filter(p => p.id !== id);
            savePrescriptions();
            renderPrescriptions();
            
            
            if (currentPreviewIndex !== null && 
                prescriptions[currentPreviewIndex] && 
                prescriptions[currentPreviewIndex].id === id) {
                previewModal.style.display = 'none';
            }
        }
    }

    
    function deleteCurrentPrescription() {
        if (currentPreviewIndex !== null && prescriptions[currentPreviewIndex]) {
            deletePrescription(prescriptions[currentPreviewIndex].id);
            previewModal.style.display = 'none';
        }
    }

    
    function savePrescriptions() {
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    }

    
    initPrescriptions();
});