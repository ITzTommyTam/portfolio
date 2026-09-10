document.addEventListener('DOMContentLoaded', () => {
  // --- Dark Mode & Avatar Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');
  const avatarImg = document.getElementById('avatar-img');
  
  // Check for saved theme preference (default to dark if not set)
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
    if (avatarImg) avatarImg.src = './square-crop.jpg';
  } else {
    // Default to dark
    document.documentElement.setAttribute('data-theme', 'dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
    if (avatarImg) avatarImg.src = './dark.png';
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      moonIcon.classList.add('hidden');
      sunIcon.classList.remove('hidden');
      if (avatarImg) avatarImg.src = './dark.png';
    } else {
      moonIcon.classList.remove('hidden');
      sunIcon.classList.add('hidden');
      if (avatarImg) avatarImg.src = './square-crop.jpg';
    }
  });

  // --- Scroll Spy for Active Nav Link ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      // Check if the current scroll position is within the section bounds
      if (scrollY >= (sectionTop - window.innerHeight / 3) && scrollY < (sectionTop + sectionHeight - window.innerHeight / 3)) {
        current = section.getAttribute('id');
      }
    });

    // If we are at the bottom of the page, force 'contact'
    if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100) {
      current = 'contact';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  // navLinks already declared above
  
  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
  
  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  });

  // --- Hacker Text Scramble Effect ---
  const hackerText = document.getElementById('hacker-text');
  if (hackerText) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let iteration = 0;
    let interval = null;
    const originalText = hackerText.dataset.value;
    
    // Scramble initially to prevent showing original text before animation
    hackerText.innerText = originalText.replace(/./g, () => letters[Math.floor(Math.random() * letters.length)]);
    
    interval = setInterval(() => {
      hackerText.innerText = originalText
        .split("")
        .map((letter, index) => {
          if(index < iteration) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * letters.length)];
        })
        .join("");
      
      if(iteration >= originalText.length) {
        clearInterval(interval);
        hackerText.innerText = originalText;
      }
      
      iteration += 1 / 3;
    }, 30);
  }

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-card');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Remove class to animate again when scrolling up/down
        entry.target.classList.remove('active');
      }
    });
  }, {
    threshold: 0,
    rootMargin: "0px 0px -15% 0px"
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- Canvas Particle Network (Spider lines effect) ---
  const canvas = document.getElementById('network-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const mouse = { x: -1000, y: -1000, radius: 150 };

    let resizeTimer;
    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
      }, 200);
    }
    
    // Initial setup
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
    
    // Touch support for mobile interaction
    window.addEventListener('touchstart', (e) => {
      if(e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, {passive: true});
    window.addEventListener('touchend', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    }, {passive: true});

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.0;
        this.vy = (Math.random() - 0.5) * 1.0;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        if (this.x > width || this.x < 0) this.vx = -this.vx;
        if (this.y > height || this.y < 0) this.vy = -this.vy;
        this.x += this.vx;
        this.y += this.vy;
      }
      draw(rgb) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.7)`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const isMobile = window.innerWidth <= 768;
      const divisor = isMobile ? 18000 : 9000;
      const maxParticles = isMobile ? 40 : 120;
      const numParticles = Math.min(Math.floor((width * height) / divisor), maxParticles);
      
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    }

    let lastRender = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    function animateParticles(timestamp) {
      requestAnimationFrame(animateParticles);
      
      if (timestamp - lastRender < frameInterval) return;
      lastRender = timestamp;
      
      ctx.clearRect(0, 0, width, height);
      
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const rgb = isDark ? '255, 255, 255' : '0, 0, 0';
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(rgb);
        
        // Connect particles
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb}, ${0.15 - distance/666})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        
        // Connect to mouse (spider effect)
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgb}, ${0.4 - distance/375})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    initParticles();
    animateParticles(0);
  }
});
