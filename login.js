
const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const signInForm = document.querySelector('.sign-in form');
const signUpForm = document.querySelector('.sign-up form');


registerBtn.addEventListener("click", () => {
    container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
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


const logo = document.querySelector('.header-logo');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'scale(1.05)';
    });
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'scale(1)';
    });
}


signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: `action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        const data = await response.json();

        if (data.success) {
            
            Auth.setUser(data.email, data.username);
            
            
            document.body.classList.add('page-transition-out');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 800);
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        alert('Network error. Please check your connection.');
        console.error('Login error:', error);
    }
});


signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: `action=register&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });
        const data = await response.json();

        if (data.success) {
            alert('Registration successful! Please sign in.');
            container.classList.remove("active");
            signUpForm.reset();
        } else {
            alert(data.message || 'Registration failed. Email or username may already exist.');
        }
    } catch (error) {
        alert('Network error. Please check your connection.');
        console.error('Registration error:', error);
    }
});


class Auth {
    static setUser(email, username) {
        sessionStorage.setItem('user_email', email);
        sessionStorage.setItem('user_name', username);
    }

    static getUser() {
        return {
            email: sessionStorage.getItem('user_email'),
            name: sessionStorage.getItem('user_name')
        };
    }

    static clearUser() {
        sessionStorage.removeItem('user_email');
        sessionStorage.removeItem('user_name');
    }

    static isAuthenticated() {
        return !!sessionStorage.getItem('user_email');
    }
}
async function checkAuth() {
    const isAuthenticated = await Auth.checkSession();
    if (!isAuthenticated && window.location.pathname.includes('main.html')) {
        window.location.href = 'login.html';
    }
}


checkAuth();