document.addEventListener('DOMContentLoaded', () => {
  // --- Page Loader & Reveal Initialization ---
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      initRevealObserver(); // Start revealing immediately while loader fades
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    } else {
      initRevealObserver();
    }
  });

  function initRevealObserver() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-card');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          // Retain repeat animation so scrolling down or up always triggers the reveal
          entry.target.classList.remove('active');
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -25px 0px"
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

    if (!document.startViewTransition) {
      performThemeChange();
      return;
    }

    isTransitioning = true;
    const transition = document.startViewTransition(() => {
      performThemeChange();
    });

    transition.finished.finally(() => {
      isTransitioning = false;
    });
  });

  // --- Smooth Scroll Spy & Active Indicator Pill ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const navMenu = document.getElementById('nav-menu');
  const indicatorPill = document.getElementById('nav-indicator-pill');
  const mainNavbar = document.getElementById('main-navbar');
  const navTooltip = document.getElementById('nav-tooltip');
  const navTooltipText = document.getElementById('nav-tooltip-text');
  const backToTopBtn = document.getElementById('back-to-top');

  // Cache section positions to eliminate layout thrashing
  let sectionPositions = [];
  function cacheSectionPositions() {
    sectionPositions = Array.from(sections).map(sec => ({
      id: sec.getAttribute('id'),
      top: sec.offsetTop,
      height: sec.offsetHeight
    }));
  }
  cacheSectionPositions();
  window.addEventListener('resize', cacheSectionPositions);
  window.addEventListener('load', cacheSectionPositions);

  // Pre-cache nav item geometry so touchmove has 0 layout overhead
  let cachedNavLinks = [];
  function cacheNavGeometry() {
    if (!mainNavbar || !navMenu || navLinks.length === 0) return;
    const navbarRect = mainNavbar.getBoundingClientRect();
    const menuRect = navMenu.getBoundingClientRect();

    cachedNavLinks = Array.from(navLinks).map(link => {
      const rect = link.getBoundingClientRect();
      const href = link.getAttribute('href');
      const isHash = href && href.startsWith('#');
      return {
        element: link,
        href: href,
        targetId: isHash ? href.substring(1) : null,
        title: link.dataset.title || link.getAttribute('title') || 'Select',
        centerX: rect.left + rect.width / 2,
        offsetInMenu: rect.left - menuRect.left,
        centerInNavbar: (rect.left + rect.width / 2) - navbarRect.left,
        width: rect.width
      };
    });
  }

  cacheNavGeometry();
  window.addEventListener('resize', cacheNavGeometry);
  window.addEventListener('load', cacheNavGeometry);

  function updateIndicatorPill(offsetInMenu) {
    if (!indicatorPill) return;
    indicatorPill.style.transform = `translate3d(${offsetInMenu}px, 0, 0)`;
    indicatorPill.classList.add('active');
  }

  // Set initial pill position after layout settles
  setTimeout(() => {
    cacheNavGeometry();
    const activeLink = document.querySelector('.nav-link.active') || navLinks[0];
    if (activeLink) {
      const found = cachedNavLinks.find(c => c.element === activeLink);
      if (found) updateIndicatorPill(found.offsetInMenu);
    }
  }, 100);

  let isScrollSpyThrottled = false;
  let isUserScrolling = false;
  let isHoldingNav = false;
  let isNavControllingScroll = false;
  let navControlTimer = null;
  let scrollSettleTimer;

  function scrollToSection(id) {
    if (!id) return;
    const sec = sectionPositions.find(s => s.id === id);
    isNavControllingScroll = true;
    clearTimeout(navControlTimer);
    navControlTimer = setTimeout(() => {
      isNavControllingScroll = false;
    }, 750);

    if (sec) {
      window.scrollTo({
        top: Math.max(0, sec.top - 20),
        behavior: 'smooth'
      });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function setActiveNavItem(linkItem) {
    if (!linkItem) return;
    navLinks.forEach(l => {
      if (l === linkItem.element) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
    updateIndicatorPill(linkItem.offsetInMenu);
  }

  window.addEventListener('scroll', () => {
    isUserScrolling = true;
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer = setTimeout(() => {
      isUserScrolling = false;
    }, 120);

    if (backToTopBtn) {
      if (window.scrollY > 200) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Pause scrollspy while holding/scrubbing or navigating via dock
    if (isHoldingNav || isNavControllingScroll) return;

    if (!isScrollSpyThrottled) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        let current = '';

        for (let i = 0; i < sectionPositions.length; i++) {
          const sec = sectionPositions[i];
          if (scrollY >= (sec.top - windowHeight / 3) && scrollY < (sec.top + sec.height - windowHeight / 3)) {
            current = sec.id;
          }
        }

        if (Math.ceil(windowHeight + scrollY) >= document.documentElement.scrollHeight - 120) {
          current = 'contact';
        }

        if (current) {
          const item = cachedNavLinks.find(c => c.targetId === current);
          if (item && !item.element.classList.contains('active')) {
            setActiveNavItem(item);
          }
        }
        isScrollSpyThrottled = false;
      });
      isScrollSpyThrottled = true;
    }
  }, { passive: true });

  // --- iPhone-style Hold and Drag to Select Navigation ---
  let currentHeldItem = null;
  let lastScrolledTargetId = null;

  function setHeldLink(item) {
    if (!item) return;
    if (currentHeldItem === item) return;

    currentHeldItem = item;

    // Visual active & holding state
    navLinks.forEach(l => {
      if (l === item.element) {
        l.classList.add('active', 'holding');
      } else {
        l.classList.remove('active', 'holding');
      }
    });

    // Move sliding pill with 0 layout cost
    updateIndicatorPill(item.offsetInMenu);

    // Position iOS floating tooltip via GPU transform
    if (navTooltip && navTooltipText) {
      navTooltipText.textContent = item.title;
      const tooltipWidth = navTooltip.offsetWidth || 64;
      const tooltipX = Math.round(item.centerInNavbar - tooltipWidth / 2);
      navTooltip.style.transform = `translate3d(${tooltipX}px, 0, 0) scale(1)`;
      navTooltip.classList.add('visible');
    }

    // Apple subtle haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(12);
    }

    // When dragging to another section, immediately glide to it!
    if (item.targetId && item.targetId !== lastScrolledTargetId) {
      lastScrolledTargetId = item.targetId;
      scrollToSection(item.targetId);
    }
  }

  function clearHeldState() {
    isHoldingNav = false;
    currentHeldItem = null;
    lastScrolledTargetId = null;

    navLinks.forEach(l => {
      l.classList.remove('holding');
    });

    if (navTooltip) {
      navTooltip.classList.remove('visible');
    }
  }

  function findClosestCachedLink(clientX) {
    let closest = null;
    let minDistance = Infinity;

    for (let i = 0; i < cachedNavLinks.length; i++) {
      const item = cachedNavLinks[i];
      const dist = Math.abs(clientX - item.centerX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = item;
      }
    }

    return closest;
  }

  if (mainNavbar && navMenu) {
    // Touch Events for iPhone hold-and-slide
    mainNavbar.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      cacheNavGeometry(); // Refresh coordinates once at start of touch
      isHoldingNav = true;

      const touch = e.touches[0];
      const closest = findClosestCachedLink(touch.clientX);
      if (closest) {
        setHeldLink(closest);
      }
    }, { passive: true });

    mainNavbar.addEventListener('touchmove', (e) => {
      if (!isHoldingNav || e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Ultra-fast cached lookup (<0.05ms, no DOM reflows)
      const closest = findClosestCachedLink(touch.clientX);
      if (closest) {
        setHeldLink(closest);
      }

      if (e.cancelable) {
        e.preventDefault();
      }
    }, { passive: false });

    function handleTouchEnd() {
      if (currentHeldItem) {
        if (currentHeldItem.targetId) {
          scrollToSection(currentHeldItem.targetId);
        } else if (currentHeldItem.href && currentHeldItem.href !== '#') {
          window.open(currentHeldItem.href, '_blank');
        }
      }
      clearHeldState();
    }

    mainNavbar.addEventListener('touchend', handleTouchEnd);
    mainNavbar.addEventListener('touchcancel', handleTouchEnd);

    // Click handler for standard instant clicks
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const item = cachedNavLinks.find(c => c.element === link);
          if (item) {
            setActiveNavItem(item);
          } else {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
          scrollToSection(targetId);
        }
      });
    });

    // --- Back to Top Button Interaction ---
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        scrollToSection('home');
        const homeItem = cachedNavLinks.find(c => c.targetId === 'home');
        if (homeItem) {
          setActiveNavItem(homeItem);
        } else {
          const homeLink = document.querySelector('.nav-link[href="#home"]');
          if (homeLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            homeLink.classList.add('active');
          }
        }
      });
    }
  }

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

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
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
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
        this.x = width + 200; 
      }
      reset() {
        this.x = Math.random() * width;
        this.y = -100;
        this.length = Math.random() * 70 + 35;
        this.vx = Math.random() * 2 + 1.5;
        this.vy = Math.random() * 2 + 2.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        
        if (Math.random() > 0.5) {
          this.x = -100;
          this.y = Math.random() * height * 0.5;
        }
      }
      update() {
        if (this.x > width + 200 || this.y > height + 200) {
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
        
        const rgb = isDark ? '255, 255, 255' : '0, 0, 0';
        const tailX = this.x - this.vx * (this.length / 2);
        const tailY = this.y - this.vy * (this.length / 2);
        
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(${rgb}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${rgb}, 0)`);
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isDark ? 2 : 2.5;
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
      const divisor = isMobile ? 35000 : 9000;
      const maxParticles = isMobile ? 14 : 110;
      const numParticles = Math.min(Math.floor((width * height) / divisor), maxParticles);
      
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
      
      const numComets = isMobile ? 1 : 4;
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
      
      const isMobile = window.innerWidth <= 768;

      // During active scroll or nav interaction on mobile, throttle canvas to guarantee 60-120fps
      if (isMobile && (isUserScrolling || isHoldingNav || isNavControllingScroll)) {
        return;
      }
      
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
          
          if (distSq < (isMobile ? 6400 : 10000)) {
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb}, ${0.15 - distance/666})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        
        // Connect to mouse/touch (spider effect)
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < mouse.radius * mouse.radius) {
          const distance = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgb}, ${0.35 - distance/375})`;
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
