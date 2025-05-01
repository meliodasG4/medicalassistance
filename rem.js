document.addEventListener('DOMContentLoaded', () => {

    const remindersSection = document.getElementById('reminders');
    if (!remindersSection) return;

    const addReminderBtn = document.getElementById('add-reminder-btn');
    const reminderModal = document.getElementById('reminder-modal');
    const closeReminderBtn = reminderModal.querySelector('.close-btn');
    const reminderForm = document.getElementById('reminder-form');
    const upcomingRemindersList = document.getElementById('upcoming-reminders');
    const activeRemindersList = document.getElementById('active-reminders');
    const medicationSelect = document.getElementById('reminder-medication');
    const medicationTimesDisplay = document.getElementById('medication-times-display');

    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    let currentReminderId = null;
    let notificationTimeout;

    function initReminders() {
        loadMedications();
        renderReminders();
        checkReminders();
 
        setInterval(checkReminders, 60000);
    }

    function loadMedications() {
        const medications = JSON.parse(localStorage.getItem('medications')) || [];
        medicationSelect.innerHTML = '<option value="">Select medication</option>';
        
        medications.forEach(med => {
            const option = document.createElement('option');
            option.value = med.id;
            option.textContent = med.name;
            medicationSelect.appendChild(option);
        });
    }

    function updateMedicationTimesDisplay() {
        const medicationId = medicationSelect.value;
        const medication = getMedicationById(medicationId);
        
        medicationTimesDisplay.innerHTML = '';
        
        if (medication && medication.times && medication.times.length > 0) {
            medication.times.forEach(time => {
                const timeElement = document.createElement('div');
                timeElement.className = 'medication-time';
                timeElement.textContent = time;
                medicationTimesDisplay.appendChild(timeElement);
            });
        } else {
            medicationTimesDisplay.innerHTML = '<p class="no-times">No times set for this medication</p>';
        }
    }

    function renderReminders() {
        upcomingRemindersList.innerHTML = '';
        activeRemindersList.innerHTML = '';
        
        if (reminders.length === 0) {
            upcomingRemindersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash" style="font-size: 2rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
                    <p>No reminders set up yet</p>
                </div>
            `;
            return;
        }
        
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        reminders.forEach(reminder => {
            const med = getMedicationById(reminder.medicationId);
            if (!med || !med.times) return;
         
            med.times.forEach(time => {
                const reminderTime = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
                const timeDiff = reminderTime - currentTime;
                const isActiveDay = reminder.days.includes(currentDay);
                
                const reminderCard = document.createElement('div');
                reminderCard.className = `reminder-card ${timeDiff <= 30 && timeDiff >= 0 && isActiveDay ? 'urgent' : ''}`;
           
                let timeRemainingText = '';
                if (timeDiff > 0 && isActiveDay) {
                    const hours = Math.floor(timeDiff / 60);
                    const minutes = timeDiff % 60;
                    timeRemainingText = `${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`;
                } else if (timeDiff <= 0 && isActiveDay) {
                    timeRemainingText = 'Due now';
                } else {
                    const nextDay = getNextActiveDay(reminder.days, currentDay);
                    timeRemainingText = `Next: ${nextDay}`;
                }
                
                reminderCard.innerHTML = `
                    <div class="reminder-medication">${med.name} - ${med.dosage}</div>
                    <div class="reminder-time">
                        <i class="fas fa-clock"></i>
                        ${time}
                        <span class="time-remaining">${timeRemainingText}</span>
                    </div>
                    <div class="reminder-days">
                        ${reminder.days.map(day => `<span>${day.substring(0, 3)}</span>`).join('')}
                    </div>
                    ${reminder.note ? `<div class="reminder-note">${reminder.note}</div>` : ''}
                    <div class="reminder-actions">
                        <button class="reminder-action-btn snooze-btn" data-id="${reminder.id}" data-time="${time}">
                            <i class="fas fa-clock"></i> Snooze
                        </button>
                        <button class="reminder-action-btn delete-reminder-btn" data-id="${reminder.id}">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                `;
            
                if (timeDiff <= 30 && timeDiff >= -15 && isActiveDay) {
                    activeRemindersList.appendChild(reminderCard);
                } else {
                    upcomingRemindersList.appendChild(reminderCard);
                }
            });
        });
        
        document.querySelectorAll('.snooze-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                const time = e.target.closest('button').dataset.time;
                snoozeReminder(id, time);
            });
        });
        
        document.querySelectorAll('.delete-reminder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteReminder(e.target.closest('button').dataset.id));
        });
    }

  
    function checkReminders() {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        reminders.forEach(reminder => {
            const med = getMedicationById(reminder.medicationId);
            if (!med || !med.times) return;
            
         
            med.times.forEach(time => {
                const reminderTime = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
                const timeDiff = reminderTime - currentTime;
                
                if (reminder.days.includes(currentDay)) {
       
                    const timeKey = `${reminder.id}-${time}`;
                    
                    if (timeDiff <= 0 && timeDiff >= -2 && !reminder.notifiedTimes?.includes(timeKey)) {
                        showReminderNotification(reminder, time, med);
                        
                   
                        if (!reminder.notifiedTimes) reminder.notifiedTimes = [];
                        reminder.notifiedTimes.push(timeKey);
                        saveReminders();
                    }
                }
            });
        });
        
        renderReminders();
    }

   
     function showReminderNotification(reminder, time, medication) {
     
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        
        const notification = document.createElement('div');
        notification.className = 'reminder-notification';
        notification.innerHTML = `
            <div class="reminder-notification-header">
                <div class="reminder-notification-title">
                    <i class="fas fa-bell"></i>
                    Medication Reminder
                </div>
                <button class="reminder-notification-close">&times;</button>
            </div>
            <div class="reminder-notification-body">
                <strong>${medication.name}</strong> - ${medication.dosage}<br>
                Time to take your medication (${time})!
            </div>
            <div class="reminder-notification-actions">
                <button class="reminder-action-btn snooze-btn" id="notification-snooze">
                    <i class="fas fa-clock"></i> Snooze (10m)
                </button>
                <button class="reminder-action-btn dismiss-btn" id="notification-dismiss">
                    <i class="fas fa-check"></i> Dismiss
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
   
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
 
        notification.querySelector('.reminder-notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        

        notification.querySelector('#notification-dismiss').addEventListener('click', () => {
     
            reminders = reminders.filter(r => r.id !== reminder.id);
            saveReminders();
            renderReminders();
            

            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            
            showNotification('Reminder dismissed and deleted');
        });
        
 
        notification.querySelector('#notification-snooze').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            snoozeReminder(reminder.id, time);
        });
        

        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 300000);
    }

    function snoozeReminder(id, time) {
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
          
            if (reminder.notifiedTimes) {
                const timeKey = `${id}-${time}`;
                reminder.notifiedTimes = reminder.notifiedTimes.filter(t => t !== timeKey);
            }
            saveReminders();
            renderReminders();
            showNotification('Reminder snoozed for 10 minutes');
        }
    }

 
    function deleteReminder(id) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            reminders = reminders.filter(r => r.id !== id);
            saveReminders();
            renderReminders();
            showNotification('Reminder deleted successfully');
        }
    }

  
    function saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }

    function getMedicationById(id) {
        const medications = JSON.parse(localStorage.getItem('medications')) || [];
        return medications.find(m => m.id === id);
    }

    function getNextActiveDay(days, currentDay) {
        const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentIndex = dayOrder.indexOf(currentDay);
        
        for (let i = 1; i <= 7; i++) {
            const nextIndex = (currentIndex + i) % 7;
            const nextDay = dayOrder[nextIndex];
            if (days.includes(nextDay)) {
                return nextDay;
            }
        }
        
        return '';
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

    function openAddReminderModal() {
        currentReminderId = null;
        document.getElementById('reminder-modal-title').textContent = 'Add New Reminder';
        reminderForm.reset();
  
        document.querySelectorAll('input[name="day"]').forEach(checkbox => {
            checkbox.checked = false;
        });
       
        medicationTimesDisplay.innerHTML = '<p class="no-times">Select a medication to see times</p>';
        reminderModal.style.display = 'flex';
        document.getElementById('reminder-medication').focus();
    }

   
    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedDays = Array.from(document.querySelectorAll('input[name="day"]:checked')).map(cb => cb.value);
        const medicationId = document.getElementById('reminder-medication').value;
        const medication = getMedicationById(medicationId);
        
        if (selectedDays.length === 0) {
            showNotification('Please select at least one day', 'error');
            return;
        }
        
        if (!medicationId || !medication || !medication.times || medication.times.length === 0) {
            showNotification('Selected medication has no times set', 'error');
            return;
        }
        
        const formData = {
            id: currentReminderId || Date.now().toString(),
            medicationId: medicationId,
            days: selectedDays,
            note: document.getElementById('reminder-note').value.trim(),
            notifiedTimes: []
        };
        
        if (currentReminderId) {
           
            const index = reminders.findIndex(r => r.id === currentReminderId);
            if (index !== -1) {
                reminders[index] = formData;
                showNotification('Reminder updated successfully');
            }
        } else {
          
            reminders.push(formData);
            showNotification('Reminder added successfully');
        }
        
        saveReminders();
        renderReminders();
        reminderModal.style.display = 'none';
    });

  
    addReminderBtn.addEventListener('click', openAddReminderModal);
    medicationSelect.addEventListener('change', updateMedicationTimesDisplay);
    
    closeReminderBtn.addEventListener('click', () => {
        reminderModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === reminderModal) {
            reminderModal.style.display = 'none';
        }
    });

   
    initReminders();
});