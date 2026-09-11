document.addEventListener('DOMContentLoaded', () => {
  // --- Page Loader & Reveal Initialization ---
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      initRevealObserver(); // Start revealing immediately while loader fades
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300); // Wait for faster transition to finish
    } else {
      initRevealObserver();
    }
  });

  function initRevealObserver() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-card');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

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
  
  let isTransitioning = false;
  themeToggle.addEventListener('click', (e) => {
    if (isTransitioning) return;

    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    const performThemeChange = () => {
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
    };

    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
      performThemeChange();
      return;
    }

    isTransitioning = true;

    // Create the view transition
    const transition = document.startViewTransition(() => {
      performThemeChange();
    });

    transition.finished.finally(() => {
      isTransitioning = false;
    });
  });

  // --- Scroll Spy for Active Nav Link ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        let current = '';
        
        sections.forEach(section => {
          // Avoid triggering layout thrashing when possible
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          if (scrollY >= (sectionTop - window.innerHeight / 3) && scrollY < (sectionTop + sectionHeight - window.innerHeight / 3)) {
            current = section.getAttribute('id');
          }
        });

        if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100) {
          current = 'contact';
        }

        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

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



  // --- Canvas Particle Network (Spider lines effect) ---
  const canvas = document.getElementById('network-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let comets = [];
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

    class Comet {
      constructor() {
        this.reset();
        // Initially push out of bounds so they trickle in randomly
        this.x = width + 200; 
      }
      reset() {
        this.x = Math.random() * width;
        this.y = -100;
        this.length = Math.random() * 80 + 40;
        this.vx = Math.random() * 2 + 1.5; // diagonal speed x
        this.vy = Math.random() * 2 + 3;   // diagonal speed y
        this.opacity = Math.random() * 0.5 + 0.1;
        
        // Randomly spawn from left edge sometimes
        if (Math.random() > 0.5) {
          this.x = -100;
          this.y = Math.random() * height * 0.5; // Upper half
        }
      }
      update() {
        // If out of bounds
        if (this.x > width + 200 || this.y > height + 200) {
          // Low chance to spawn each frame to keep it sparse
          if (Math.random() < 0.003) {
            this.reset();
          }
        } else {
          this.x += this.vx;
          this.y += this.vy;
        }
      }
      draw(isDark) {
        if (this.x > width + 200 || this.y > height + 200) return;
        
        // Use black (0, 0, 0) in light mode, white in dark mode
        const rgb = isDark ? '255, 255, 255' : '0, 0, 0';
        
        const tailX = this.x - this.vx * (this.length / 2);
        const tailY = this.y - this.vy * (this.length / 2);
        
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(${rgb}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isDark ? 2 : 3;
        ctx.lineCap = 'round';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    function initParticles() {
      particles = [];
      comets = [];
      const isMobile = window.innerWidth <= 768;
      const divisor = isMobile ? 25000 : 9000;
      const maxParticles = isMobile ? 25 : 120;
      const numParticles = Math.min(Math.floor((width * height) / divisor), maxParticles);
      
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
      
      const numComets = isMobile ? 1 : 5;
      for (let i = 0; i < numComets; i++) {
        comets.push(new Comet());
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
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < 10000) { // 100 * 100
            const distance = Math.sqrt(distSq);
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
        const distSq = dx * dx + dy * dy;
        
        if (distSq < mouse.radius * mouse.radius) {
          const distance = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgb}, ${0.4 - distance/375})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      
      for (let i = 0; i < comets.length; i++) {
        comets[i].update();
        comets[i].draw(isDark);
      }
    }

    initParticles();
    animateParticles(0);
  }
});
