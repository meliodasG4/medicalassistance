document.addEventListener('DOMContentLoaded', () => {

    const appointmentsSection = document.getElementById('appointments');
    if (!appointmentsSection) return;

    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    const appointmentModal = document.getElementById('appointment-modal');
    const closeAppointmentBtn = appointmentModal.querySelector('.close-btn');
    const appointmentForm = document.getElementById('appointment-form');
    const upcomingAppointmentsList = document.getElementById('upcoming-appointments');
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    let currentAppointmentId = null;
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function initAppointments() {
        renderCalendar();
        renderUpcomingAppointments();

        const today = formatDateForInput(new Date());
        document.getElementById('appointment-date').value = today;
        document.getElementById('appointment-date').min = today;
    }

    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

 
    function renderCalendar() {
    
        calendarGrid.innerHTML = '';
        
  
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
 
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        

        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            const dayDate = new Date(currentYear, currentMonth, day);
            const dateStr = formatDateForInput(dayDate);

            const dayAppointments = appointments.filter(app => app.date === dateStr);
            const isToday = isCurrentMonth && day === today.getDate();
            
            dayElement.className = 'calendar-day';
            if (isToday) dayElement.classList.add('today');
            if (dayAppointments.length > 0) dayElement.classList.add('has-appointment');
            
            dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-appointments">
                    ${dayAppointments.slice(0, 2).map(app => `
                        <div class="calendar-day-appointment" title="${app.title}">
                            <i class="fas fa-circle" style="font-size: 4px; vertical-align: middle;"></i> ${app.title}
                        </div>
                    `).join('')}
                    ${dayAppointments.length > 2 ? `<div>+${dayAppointments.length - 2} more</div>` : ''}
                </div>
            `;

            dayElement.addEventListener('click', () => {
                viewAppointmentsForDate(dayDate);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }


    function viewAppointmentsForDate(date) {
        const dateStr = formatDateForInput(date);
        const dayAppointments = appointments.filter(app => app.date === dateStr);
        const dateFormatted = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (dayAppointments.length === 0) {
            alert(`No appointments scheduled for ${dateFormatted}`);
            return;
        }
        
        currentDate = date;
        renderUpcomingAppointments();
        document.querySelector('.appointments-list').scrollIntoView({ behavior: 'smooth' });
    }

    function renderUpcomingAppointments() {
        upcomingAppointmentsList.innerHTML = '';
        

        const filteredAppointments = appointments.filter(app => {
            const appDate = new Date(`${app.date}T${app.time}`);
            return appDate >= currentDate;
        }).sort((a, b) => {
            return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
        });
        
        if (filteredAppointments.length === 0) {
            upcomingAppointmentsList.innerHTML = `
                <div class="empty-appointments">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No upcoming appointments</p>
                </div>
            `;
            return;
        }
        
        filteredAppointments.forEach(app => {
            const appDate = new Date(`${app.date}T${app.time}`);
            const isToday = appDate.toDateString() === new Date().toDateString();
            const isUrgent = isToday && appDate.getTime() - Date.now() < 3600000; // Within 1 hour
            
            const appointmentCard = document.createElement('div');
            appointmentCard.className = `appointment-card ${isUrgent ? 'urgent' : ''}`;
            
            appointmentCard.innerHTML = `
                <div class="appointment-title">${app.title}</div>
                <div class="appointment-details">
                    <div><i class="fas fa-calendar-day"></i> ${appDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    })}</div>
                    <div><i class="fas fa-clock"></i> ${appDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}</div>
                    ${app.location ? `<div><i class="fas fa-map-marker-alt"></i> ${app.location}</div>` : ''}
                    ${app.doctor ? `<div><i class="fas fa-user-md"></i> ${app.doctor}</div>` : ''}
                </div>
                ${app.notes ? `<div class="appointment-notes">${app.notes}</div>` : ''}
                <div class="appointment-actions">
                    <button class="appointment-action-btn edit-appointment-btn" data-id="${app.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="appointment-action-btn delete-appointment-btn" data-id="${app.id}">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            
            upcomingAppointmentsList.appendChild(appointmentCard);
        });
        
    
        document.querySelectorAll('.edit-appointment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editAppointment(e.target.closest('button').dataset.id));
        });
        
        document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteAppointment(e.target.closest('button').dataset.id));
        });
    }

 
    function openAddAppointmentModal() {
        currentAppointmentId = null;
        document.getElementById('appointment-modal-title').textContent = 'Add New Appointment';
        appointmentForm.reset();
        
     
        const today = formatDateForInput(new Date());
        document.getElementById('appointment-date').value = today;
        document.getElementById('appointment-date').min = today;
        
        appointmentModal.style.display = 'flex';
        document.getElementById('appointment-title').focus();
    }


    function editAppointment(id) {
        const appointment = appointments.find(a => a.id === id);
        if (!appointment) return;
        
        currentAppointmentId = id;
        document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';

        document.getElementById('appointment-id').value = appointment.id;
        document.getElementById('appointment-title').value = appointment.title;
        document.getElementById('appointment-date').value = appointment.date;
        document.getElementById('appointment-time').value = appointment.time;
        document.getElementById('appointment-location').value = appointment.location || '';
        document.getElementById('appointment-doctor').value = appointment.doctor || '';
        document.getElementById('appointment-notes').value = appointment.notes || '';
        
        appointmentModal.style.display = 'flex';
        document.getElementById('appointment-title').focus();
    }


    function deleteAppointment(id) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            appointments = appointments.filter(a => a.id !== id);
            saveAppointments();
            renderCalendar();
            renderUpcomingAppointments();
            showNotification('Appointment deleted successfully');
            

            appointmentModal.style.display = 'none';
        }
    }


    function saveAppointments() {
        localStorage.setItem('appointments', JSON.stringify(appointments));
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

    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            id: currentAppointmentId || Date.now().toString(),
            title: document.getElementById('appointment-title').value.trim(),
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            location: document.getElementById('appointment-location').value.trim(),
            doctor: document.getElementById('appointment-doctor').value.trim(),
            notes: document.getElementById('appointment-notes').value.trim()
        };
        
        if (!formData.title || !formData.date || !formData.time) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
        if (appointmentDateTime < new Date()) {
            showNotification('Appointment date/time cannot be in the past', 'error');
            return;
        }
        
        if (currentAppointmentId) {

            const index = appointments.findIndex(a => a.id === currentAppointmentId);
            if (index !== -1) {
                appointments[index] = formData;
                showNotification('Appointment updated successfully');
            }
        } else {

            appointments.push(formData);
            showNotification('Appointment added successfully');
        }
        
        saveAppointments();
        renderCalendar();
        renderUpcomingAppointments();
        appointmentModal.style.display = 'none';
    });


    addAppointmentBtn.addEventListener('click', openAddAppointmentModal);
    closeAppointmentBtn.addEventListener('click', () => {
        appointmentModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    
    initAppointments();
});