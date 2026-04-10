// Create floating medical symbols
function createFloatingSymbols() {
    const container = document.getElementById('medicalSymbols');
    if (!container) return;
    
    const symbols = ['fas fa-heartbeat', 'fas fa-stethoscope', 'fas fa-microscope', 'fas fa-notes-medical', 'fas fa-hospital-user', 'fas fa-dna'];
    
    for (let i = 0; i < 15; i++) {
        const symbol = document.createElement('i');
        const randomIcon = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.className = `${randomIcon} medical-symbol`;
        symbol.style.left = `${Math.random() * 100}%`;
        symbol.style.fontSize = `${Math.random() * 30 + 15}px`;
        symbol.style.animationDelay = `${Math.random() * 20}s`;
        symbol.style.animationDuration = `${Math.random() * 15 + 10}s`;
        container.appendChild(symbol);
    }
}

// Smooth scroll and active nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Update active nav on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Animate elements on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .cancer-card, .workflow-step').forEach(el => {
    observer.observe(el);
});

// Initialize
createFloatingSymbols();