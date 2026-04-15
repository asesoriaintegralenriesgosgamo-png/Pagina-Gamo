/* ===================================
   GAMO — Main JavaScript
   Path-based adaptive landing page
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===================================
  // State
  // ===================================
  let activePath = null; // 'clients' | 'advisors' | null

  // ===================================
  // DOM References
  // ===================================
  const introCurtain = document.getElementById('introCurtain');
  const curtainScrollBtn = document.getElementById('curtainScrollBtn');
  const loadingScreen = document.getElementById('loadingScreen');
  const hero = document.getElementById('hero');
  const panelClients = document.getElementById('panelClients');
  const panelAdvisors = document.getElementById('panelAdvisors');
  const ctaClients = document.getElementById('ctaClients');
  const ctaAdvisors = document.getElementById('ctaAdvisors');
  const heroSeparator = document.getElementById('heroSeparator');
const heroLogo = document.getElementById('heroLogo');
  const mainNav = document.getElementById('mainNav');
  const navSwitch = document.getElementById('navSwitch');
  const navSwitchText = document.getElementById('navSwitchText');
  const navLinks = document.getElementById('navLinks');
  const navLogo = document.getElementById('navLogo');
  const pathClients = document.getElementById('pathClients');
  const pathAdvisors = document.getElementById('pathAdvisors');
  const cursor = document.getElementById('customCursor');
  const cursorRing = document.getElementById('customCursorRing');

  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ===================================
  // Loading Screen
  // ===================================
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('loaded');
      document.body.classList.add('no-scroll');
    }, 800);
  });
  setTimeout(() => loadingScreen.classList.add('loaded'), 3000);

  // ===================================
  // Custom Cursor (Desktop only)
  // ===================================
  if (isDesktop && cursor && cursorRing) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    function updateCursorTargets() {
      document.querySelectorAll('a, button, .hero-panel, .pillar, .testimonial, .model-step, .profile-card, .process-step, .intro-curtain__scroll-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('cursor-hover');
          cursorRing.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('cursor-hover');
          cursorRing.classList.remove('cursor-hover');
        });
      });
    }
    updateCursorTargets();

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

  // ===================================
  // Hero — Split Screen Hover (Desktop, before choice)
  // ===================================
  if (!isTouchDevice && !isMobile) {
    panelClients.addEventListener('mouseenter', () => {
      if (activePath) return; // Already chose
      hero.classList.remove('hover-advisors');
      hero.classList.add('hover-clients');
    });
    panelAdvisors.addEventListener('mouseenter', () => {
      if (activePath) return;
      hero.classList.remove('hover-clients');
      hero.classList.add('hover-advisors');
    });
    hero.addEventListener('mouseleave', () => {
      if (activePath) return;
      hero.classList.remove('hover-clients', 'hover-advisors');
    });
  } else {
    // Mobile/Touch: Tap interaction (before choice)
    let mobileActivePanel = null;

    panelClients.addEventListener('click', (e) => {
      if (activePath) return;
      if (e.target.closest('.hero-cta')) return;
      if (mobileActivePanel === 'clients') {
        hero.classList.remove('active-clients');
        mobileActivePanel = null;
      } else {
        hero.classList.remove('active-advisors');
        hero.classList.add('active-clients');
        mobileActivePanel = 'clients';
      }
    });

    panelAdvisors.addEventListener('click', (e) => {
      if (activePath) return;
      if (e.target.closest('.hero-cta')) return;
      if (mobileActivePanel === 'advisors') {
        hero.classList.remove('active-advisors');
        mobileActivePanel = null;
      } else {
        hero.classList.remove('active-clients');
        hero.classList.add('active-advisors');
        mobileActivePanel = 'advisors';
      }
    });
  }


  // ===================================
  // Intro Curtain Lift Logic
  // ===================================
  function liftCurtain() {
    if (introCurtain) introCurtain.classList.add('lifted');
  }

  if (curtainScrollBtn) {
    curtainScrollBtn.addEventListener('click', liftCurtain);
  }

  // Lift curtain on scroll down
  window.addEventListener('wheel', (e) => {
    if (e.deltaY > 10 && introCurtain && !introCurtain.classList.contains('lifted')) {
      liftCurtain();
    } else if (e.deltaY < -10 && introCurtain && introCurtain.classList.contains('lifted') && document.body.classList.contains('choice-pending')) {
      introCurtain.classList.remove('lifted');
    }
  }, { passive: true });

  // Lift curtain on touch swipe
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const deltaY = touchStartY - e.touches[0].clientY;
    if (deltaY > 30 && introCurtain && !introCurtain.classList.contains('lifted')) {
      liftCurtain();
    } else if (deltaY < -30 && introCurtain && introCurtain.classList.contains('lifted') && document.body.classList.contains('choice-pending')) {
      introCurtain.classList.remove('lifted');
    }
  }, { passive: true });

  // ===================================
  // Path Selection — The Core Logic
  // ===================================
  function selectPath(path) {
    if (activePath === path) return;
    activePath = path;
    const otherPath = path === 'clients' ? 'advisors' : 'clients';

    // 0. Disable scroll lock so they can explore the landing page
    document.body.classList.remove('no-scroll');
    document.body.classList.remove('choice-pending');

    // 1. Hero transitions to chosen state
    hero.classList.remove('hover-clients', 'hover-advisors', 'active-clients', 'active-advisors');
    hero.classList.add('hero--chosen', `chosen-${path}`);
    hero.classList.remove(`chosen-${otherPath}`);

    // 2. Show the correct path content, hide the other
    const activeContent = path === 'clients' ? pathClients : pathAdvisors;
    const inactiveContent = path === 'clients' ? pathAdvisors : pathClients;

    inactiveContent.classList.remove('active', 'visible');
    activeContent.classList.add('active');

    // Trigger reflow before adding visible class for animation
    activeContent.offsetHeight;
    
    setTimeout(() => {
      activeContent.classList.add('visible');
    }, 50);

    // 4. Show nav
    mainNav.classList.add('visible');
    updateNav(path);

    // 5. Scroll to content
    setTimeout(() => {
      const firstSection = activeContent.querySelector('.section');
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);

    // 6. Setup reveal observers for new content
    setTimeout(() => {
      setupRevealObservers();
      setupCounterObservers();
    }, 100);
  }

  function resetPath() {
    activePath = null;

    // Restore scroll lock
    document.body.classList.add('no-scroll');
    document.body.classList.add('choice-pending');

    // Drop curtain back down
    if (introCurtain) introCurtain.classList.remove('lifted');

    // Reset hero
    hero.classList.remove('hero--chosen', 'chosen-clients', 'chosen-advisors', 'hover-clients', 'hover-advisors');

    // Hide all path content
    pathClients.classList.remove('active', 'visible');
    pathAdvisors.classList.remove('active', 'visible');

    // Hide nav
    mainNav.classList.remove('visible');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset reveal states so animations re-trigger
    document.querySelectorAll('.path-content .reveal').forEach(el => {
      el.classList.remove('visible');
    });

    // Reset counters
    countersAnimated.clear();
    document.querySelectorAll('[data-target]').forEach(el => {
      el.textContent = '0';
    });
  }

  function updateNav(path) {
    // Update switch button
    if (path === 'clients') {
      navSwitchText.textContent = 'Soy asesor';
    } else {
      navSwitchText.textContent = 'Busco asesoría';
    }

    // Update nav links based on path
    const clientLinks = [
      { href: '#about-clients', text: 'Nosotros' },
      { href: '#enfoque-clients', text: 'Enfoque' },
      { href: '#proceso-clients', text: 'Proceso' },
      { href: '#cta-clients', text: 'Agenda' }
    ];

    const advisorLinks = [
      { href: '#about-advisors', text: 'GAMO' },
      { href: '#modelo-advisors', text: 'Modelo' },
      { href: '#perfil-advisors', text: '¿Es para ti?' },
      { href: '#cta-advisors', text: 'Aplica' }
    ];

    const links = path === 'clients' ? clientLinks : advisorLinks;
    navLinks.innerHTML = links.map(l => 
      `<a href="${l.href}" class="nav__link">${l.text}</a>`
    ).join('');

    // Add smooth scroll to new links
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ===================================
  // Event Listeners — Path Selection
  // ===================================
  ctaClients.addEventListener('click', (e) => {
    e.preventDefault();
    selectPath('clients');
  });

  ctaAdvisors.addEventListener('click', (e) => {
    e.preventDefault();
    selectPath('advisors');
  });

  // Switch path button
  navSwitch.addEventListener('click', () => {
    const newPath = activePath === 'clients' ? 'advisors' : 'clients';
    
    // First scroll up and reset
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
      // Reset reveal states
      document.querySelectorAll('.path-content .reveal').forEach(el => {
        el.classList.remove('visible');
      });
      countersAnimated.clear();
      document.querySelectorAll('[data-target]').forEach(el => {
        el.textContent = '0';
      });

      activePath = null; // Reset so selectPath doesn't skip
      selectPath(newPath);
    }, 500);
  });

  // Nav logo click — go back to hero split
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    resetPath();
  });

  // Footer "Inicio" link
  document.querySelectorAll('[data-reset]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      resetPath();
    });
  });

  // ===================================
  // Scroll Reveal Animations
  // ===================================
  let revealObserver = null;

  function setupRevealObservers() {
    if (revealObserver) revealObserver.disconnect();

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    // Only observe elements in the active path
    const activeContainer = activePath === 'clients' ? pathClients : pathAdvisors;
    if (activeContainer) {
      activeContainer.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        revealObserver.observe(el);
      });
    }
  }

  // ===================================
  // Counter Animation
  // ===================================
  let countersAnimated = new Set();
  let counterObserver = null;

  function setupCounterObservers() {
    if (counterObserver) counterObserver.disconnect();

    counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated.has(entry.target)) {
          countersAnimated.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const activeContainer = activePath === 'clients' ? pathClients : pathAdvisors;
    if (activeContainer) {
      activeContainer.querySelectorAll('[data-target]').forEach(el => {
        counterObserver.observe(el);
      });
    }
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const current = Math.floor(easedProgress * target);

      element.textContent = prefix + (target >= 1000 ? current.toLocaleString('es-MX') : current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = prefix + (target >= 1000 ? target.toLocaleString('es-MX') : target);
      }
    }

    requestAnimationFrame(update);
  }

  // ===================================
  // Smooth scroll for anchor links
  // ===================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ===================================
  // Nav visibility — show after scrolling past hero
  // ===================================
  window.addEventListener('scroll', () => {
    if (!activePath) return;

    // After choice — control nav visibility
    if (window.scrollY > window.innerHeight * 0.3) {
      mainNav.classList.add('visible');
    }
  }, { passive: true });

  // ===================================
  // Parallax effect on hero backgrounds
  // ===================================
  if (isDesktop) {
    const heroBgs = document.querySelectorAll('.hero-panel__bg');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBgs.forEach(bg => {
          bg.style.transform = `scale(${activePath ? 1.08 : 1}) translateY(${scrollY * 0.1}px)`;
        });
      }
    }, { passive: true });
  }

  // ===================================
  // Hero Logo — fade on scroll
  // ===================================
  window.addEventListener('scroll', () => {
    if (!activePath) {
      const scrollY = window.scrollY;
      heroLogo.style.opacity = Math.max(0, 0.85 - (scrollY / window.innerHeight) * 2);
    }
  }, { passive: true });

  // ===================================
  // Entrance animation for hero
  // ===================================
  setTimeout(() => {
    const heroContents = document.querySelectorAll('.hero-panel__content');
    heroContents.forEach((content, index) => {
      content.style.opacity = '0';
      content.style.transform = 'translateY(30px)';
      setTimeout(() => {
        content.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 1000 + (index * 200));
    });
  }, 300);

});
