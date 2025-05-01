
document.addEventListener('DOMContentLoaded', () => {

    if (!Auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }
    
  
    const user = Auth.getUser();
    if (user?.name) {
      document.querySelector('.username').textContent = user.name;
    }
    
   
  });
  
document.querySelector('.logout-btn')?.addEventListener('click', () => {
   
    localStorage.removeItem('medassist_user');
    
    
    document.body.classList.add('page-transition-out');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
});


const medicalIcons = ['✚', '❤️', '🩺', '💊', '🦠', '🧪', '⚕️', '🌡️'];
const fallingContainer = document.getElementById('fallingIcons');

function createFallingIcon() {
    const icon = document.createElement('div');
    icon.className = 'falling-icon';
    icon.textContent = medicalIcons[Math.floor(Math.random() * medicalIcons.length)];
    
    const size = Math.random() * 20 + 16;
    const leftPos = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * -15;
    
    icon.style.left = `${leftPos}%`;
    icon.style.top = `-50px`;
    icon.style.fontSize = `${size}px`;
    icon.style.animationDuration = `${duration}s`;
    icon.style.animationDelay = `${delay}s`;
    icon.style.opacity = Math.random() * 0.3 + 0.2;
    
    fallingContainer.appendChild(icon);
    
    setTimeout(() => {
        icon.remove();
        createFallingIcon();
    }, duration * 1000);
}


for (let i = 0; i < 15; i++) {
    createFallingIcon();
}


const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';


document.documentElement.setAttribute('data-theme', currentTheme);
if (currentTheme === 'dark') {
    themeToggle.checked = true;
}

themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});


const navItems = document.querySelectorAll('.sidebar li');
const sections = document.querySelectorAll('.content-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
       
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        
        item.classList.add('active');
        const sectionId = item.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

