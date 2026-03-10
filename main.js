/**
 * ANTIGRAVITY — 3D Animated HTML5 Landing Page
 * main.js — Core JavaScript Modules
 * Version: 1.0
 *
 * Modules:
 *  1. ParticleCanvas  — Hero & CTA particle backgrounds
 *  2. TiltCard        — 3D tilt effect on feature cards
 *  3. NavbarScroll    — Navbar state on scroll
 *  4. ScrollReveal    — IntersectionObserver entrance animations
 *  5. MobileMenu      — Fullscreen mobile navigation
 *  6. SmoothCounter   — Count-up animation for stat numbers
 *  7. CursorGlow      — Radial glow follows cursor
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. PARTICLE CANVAS
   Creates an animated particle field — floating dots connected
   by lines within a threshold distance.
═══════════════════════════════════════════════════════════════ */
class ParticleCanvas {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.config = {
      count:          options.count         || 200,
      maxDist:        options.maxDist       || 150,
      speed:          options.speed         || 0.4,
      colorPrimary:   options.colorPrimary  || '0, 212, 255',
      colorAccent:    options.colorAccent   || '139, 0, 255',
      particleRadius: options.particleRadius || 1.8,
    };

    this.particles = [];
    this.animId = null;
    this.isRunning = false;

    this._resize = this._resize.bind(this);
    this._loop   = this._loop.bind(this);

    this.init();
  }

  init() {
    this._resize();
    window.addEventListener('resize', this._resize);
    this._createParticles();
    this.start();
  }

  _resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width  = parent ? parent.offsetWidth  : window.innerWidth;
    this.canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    // Re-init on large resize
    if (this.particles.length) {
      this._createParticles();
    }
  }

  _createParticles() {
    this.particles = [];
    const { count } = this.config;
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = 0; i < count; i++) {
      const colors = [this.config.colorPrimary, this.config.colorAccent];
      this.particles.push({
        x:   Math.random() * w,
        y:   Math.random() * h,
        vx:  (Math.random() - 0.5) * this.config.speed,
        vy:  (Math.random() - 0.5) * this.config.speed,
        r:   this.config.particleRadius * (0.5 + Math.random() * 0.8),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.5,
      });
    }
  }

  _loop() {
    if (!this.isRunning) return;
    const { ctx, canvas } = this;
    const { maxDist } = this.config;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Update & draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const q = this.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${p.color}, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(this._loop);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resize);
  }
}

/* ═══════════════════════════════════════════════════════════════
   2. TILT CARD
   Applies 3D perspective tilt to elements on mouse hover.
═══════════════════════════════════════════════════════════════ */
class TiltCard {
  constructor(selector, options = {}) {
    this.elements = document.querySelectorAll(selector);
    this.config = {
      maxTilt:     options.maxTilt     || 15,   // degrees
      perspective: options.perspective || 800,
      scale:       options.scale       || 1.02,
      speed:       options.speed       || 300,
    };
    this._attach();
  }

  _attach() {
    this.elements.forEach(el => {
      el.addEventListener('mousemove',  this._onMove.bind(this, el));
      el.addEventListener('mouseleave', this._onLeave.bind(this, el));
      el.addEventListener('mouseenter', this._onEnter.bind(this, el));
    });
  }

  _onEnter(el) {
    el.style.transition = `transform ${this.config.speed}ms ease`;
  }

  _onMove(el, e) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const { maxTilt, perspective, scale } = this.config;

    // Normalize to -1..1 then multiply by maxTilt
    const rotateY =  ((x / w) - 0.5) * 2 * maxTilt;
    const rotateX = -((y / h) - 0.5) * 2 * maxTilt;

    el.style.transition = 'none';
    el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  }

  _onLeave(el) {
    el.style.transition = `transform ${this.config.speed}ms ease`;
    el.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }
}

/* ═══════════════════════════════════════════════════════════════
   3. NAVBAR SCROLL
   Adds/removes .scrolled class on #navbar based on scroll depth.
═══════════════════════════════════════════════════════════════ */
class NavbarScroll {
  constructor(threshold = 80) {
    this.navbar    = document.getElementById('navbar');
    this.threshold = threshold;
    if (!this.navbar) return;
    window.addEventListener('scroll', this._onScroll.bind(this), { passive: true });
    this._onScroll(); // run once on init
  }

  _onScroll() {
    if (window.scrollY > this.threshold) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   4. SCROLL REVEAL
   Uses IntersectionObserver to add .is-visible to .reveal elements.
═══════════════════════════════════════════════════════════════ */
class ScrollReveal {
  constructor(selector = '.reveal, .reveal-left, .reveal-right, .section-header') {
    this.selector = selector;
    this.observer = new IntersectionObserver(
      this._onIntersect.bind(this),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    this._observe();
  }

  _observe() {
    document.querySelectorAll(this.selector).forEach(el => {
      this.observer.observe(el);
    });
  }

  _onIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        this.observer.unobserve(entry.target);
      }
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   5. MOBILE MENU
   Toggles fullscreen mobile nav with staggered link animations.
═══════════════════════════════════════════════════════════════ */
class MobileMenu {
  constructor() {
    this.hamburger  = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.menuLinks  = this.mobileMenu ? this.mobileMenu.querySelectorAll('li') : [];
    this.isOpen     = false;

    if (!this.hamburger || !this.mobileMenu) return;

    this.hamburger.addEventListener('click', this.toggle.bind(this));

    // Close on link click
    this.mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => this.close());
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.hamburger.classList.add('open');
    this.mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Stagger links
    this.menuLinks.forEach((li, i) => {
      setTimeout(() => li.classList.add('visible'), 100 + i * 80);
    });
  }

  close() {
    this.isOpen = false;
    this.hamburger.classList.remove('open');
    this.mobileMenu.classList.remove('open');
    document.body.style.overflow = '';

    this.menuLinks.forEach(li => li.classList.remove('visible'));
  }
}

/* ═══════════════════════════════════════════════════════════════
   6. SMOOTH COUNTER
   Animates numeric display elements from 0 to their target value.
   Usage: <span class="counter" data-target="200" data-suffix="+">0</span>
═══════════════════════════════════════════════════════════════ */
class SmoothCounter {
  constructor(selector = '.counter') {
    this.elements = document.querySelectorAll(selector);
    if (!this.elements.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this._countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.elements.forEach(el => observer.observe(el));
  }

  _countUp(el) {
    const target   = parseFloat(el.dataset.target) || 0;
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2000; // ms
    const fps      = 60;
    const steps    = duration / (1000 / fps);
    const increment = target / steps;
    let current = 0;

    const tick = () => {
      current += increment;
      if (current < target) {
        el.textContent = prefix + Math.floor(current) + suffix;
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target + suffix;
      }
    };
    tick();
  }
}

/* ═══════════════════════════════════════════════════════════════
   7. CURSOR GLOW
   A radial glow element that follows the mouse position.
═══════════════════════════════════════════════════════════════ */
class CursorGlow {
  constructor() {
    this.el = document.querySelector('.cursor-glow');
    if (!this.el) return;

    this.x = 0;
    this.y = 0;
    this.currentX = 0;
    this.currentY = 0;

    document.addEventListener('mousemove', e => {
      this.x = e.clientX;
      this.y = e.clientY;
      this.el.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      this.el.style.opacity = '0';
    });

    this._animate();
  }

  _animate() {
    // Smooth lerp follow
    this.currentX += (this.x - this.currentX) * 0.08;
    this.currentY += (this.y - this.currentY) * 0.08;
    this.el.style.left = this.currentX + 'px';
    this.el.style.top  = this.currentY + 'px';
    requestAnimationFrame(this._animate.bind(this));
  }
}

/* ═══════════════════════════════════════════════════════════════
   INIT — Bootstrap all modules on DOMContentLoaded
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* --- Particle Canvases --- */
  const heroParticles = new ParticleCanvas('particle-canvas', {
    count: 200,
    maxDist: 150,
    speed: 0.35,
  });

  const ctaParticles = new ParticleCanvas('cta-canvas', {
    count: 80,
    maxDist: 120,
    speed: 0.2,
    particleRadius: 1.2,
  });

  /* --- Feature Card Tilt --- */
  const tilt = new TiltCard('.feature-card', {
    maxTilt: 12,
    perspective: 800,
    scale: 1.02,
    speed: 300,
  });

  /* --- Navbar Scroll Behavior --- */
  const navbar = new NavbarScroll(80);

  /* --- Scroll Reveal --- */
  const reveal = new ScrollReveal();

  /* --- Mobile Menu --- */
  const menu = new MobileMenu();

  /* --- Smooth Counters --- */
  const counters = new SmoothCounter('.counter');

  /* --- Cursor Glow --- */
  const cursor = new CursorGlow();

  /* --- Smooth scroll for nav links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* --- Pause particles when tab is hidden (performance) --- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      heroParticles.stop();
      ctaParticles.stop();
    } else {
      heroParticles.start();
      ctaParticles.start();
    }
  });
});
