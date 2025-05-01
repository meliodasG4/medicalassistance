document.addEventListener('DOMContentLoaded', function() {
    const icons = ['✚', '❤️', '🩺', '💊', '🦠', '🧪', '⚕️', '🌡️'];
    const container = document.getElementById('fallingIcons');
    const iconCount = 20; 
    

    for (let i = 0; i < iconCount; i++) {
        createFallingIcon();
    }
    
    function createFallingIcon() {
        const icon = document.createElement('div');
        icon.className = 'falling-icon';
        icon.textContent = icons[Math.floor(Math.random() * icons.length)];
      
        const size = Math.random() * 20 + 16;
        const leftPos = Math.random() * 100;
        const animationDuration = Math.random() * 10 + 10; 
        const delay = Math.random() * -15; 
        
    
        icon.style.left = `${leftPos}%`;
        icon.style.top = `-50px`;
        icon.style.fontSize = `${size}px`;
        icon.style.animationDuration = `${animationDuration}s`;
        icon.style.animationDelay = `${delay}s`;
        icon.style.opacity = Math.random() * 0.3 + 0.2;
        
        container.appendChild(icon);
        
      
        setTimeout(() => {
            icon.remove();
            createFallingIcon(); 
        }, animationDuration * 1000);
    }
});
setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.add('fade-out');
    

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000); 
}, 3000); 