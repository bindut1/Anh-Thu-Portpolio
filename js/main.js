/*
 * Motion & navigation for the portfolio.
 * Everything is progressive enhancement: without JS (no .js class) all
 * content is visible and the page still works as a plain long scroll.
 */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  /* ---------- Hero: split "portfolio" into animated letters ---------- */

  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const text = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--i', i);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch;
      heroTitle.appendChild(span);
    });
  }

  // Kick off the hero intro once fonts are ready so letters don't jump.
  const startIntro = () => root.classList.add('is-loaded');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(startIntro);
  } else {
    startIntro();
  }

  /* ---------- Scroll reveal ---------- */

  const revealGroups = [
    ['.display, .intro__hello', 'up'],
    ['.label-heading', 'track'],
    ['.body-text, .note, .pdp__subhead, .benefits li, .pdp__closing, .bullets li', 'up'],
    ['.crop, .pdp__shot, .social__img, .article__img, .idea-light__phone', 'image'],
    ['.contact__card', 'up'],
    ['.contact__sticker', 'pop'],
  ];

  const revealTargets = [];
  revealGroups.forEach(([selector, type]) => {
    document.querySelectorAll(`.section:not(.hero) ${selector}`).forEach((el) => {
      el.dataset.reveal = type;
      revealTargets.push(el);
    });
  });

  // Stagger items inside the same section in document order.
  document.querySelectorAll('.section').forEach((section) => {
    const items = [...section.querySelectorAll('[data-reveal]')];
    items.forEach((el, i) => el.style.setProperty('--d', `${Math.min(i * 90, 720)}ms`));
  });

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    // Clipped images have no visible area, so they are triggered by their
    // section instead of observing the image itself.
    const clipped = (el) => el.dataset.reveal === 'image';
    revealTargets.filter((el) => !clipped(el)).forEach((el) => io.observe(el));

    const sectionIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('[data-reveal="image"]').forEach((el) => el.classList.add('is-visible'));
          sectionIo.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );
    new Set(revealTargets.filter(clipped).map((el) => el.closest('.section'))).forEach((s) => sectionIo.observe(s));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Navigation ---------- */

  const nav = document.querySelector('[data-site-nav]');
  const menu = document.querySelector('[data-mobile-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const navLinks = [...document.querySelectorAll('[data-nav-link]')];
  const progress = document.querySelector('.scroll-progress span');
  const toTop = document.querySelector('[data-to-top]');

  const setMenu = (open) => {
    if (open) nav.classList.remove('is-hidden');
    root.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
  };

  toggle.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.matchMedia('(max-width: 1100px)').addEventListener('change', () => setMenu(false));

  // Smooth-scroll every in-page link and close the mobile menu.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  // Highlight the nav item of the section in the middle of the viewport.
  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.navLink === id));
  };

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.navSection);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('[data-nav-section]').forEach((s) => sectionObserver.observe(s));
  }

  /* ---------- Scroll-driven effects (one rAF loop) ---------- */

  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const heroSignature = document.querySelector('.hero__signature');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;

    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // Hide the nav while scrolling down, reveal it when scrolling up.
    if (!root.classList.contains('menu-open')) {
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (y < 120 || goingUp) nav.classList.remove('is-hidden');
      else if (goingDown) nav.classList.add('is-hidden');
    }
    nav.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > vh * 0.9);
    lastY = y;

    if (reduceMotion.matches || mobileQuery.matches) {
      ticking = false;
      return;
    }

    // Background parallax: shift each image by a fraction of its height.
    parallaxEls.forEach((img) => {
      const section = img.closest('.section');
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      const amount = parseFloat(img.dataset.parallax) * img.offsetHeight;
      img.style.translate = `0 ${(p * amount).toFixed(1)}px`;
    });

    // Hero depth: title and signature drift at different speeds.
    if (y < vh * 1.2) {
      heroTitle.style.translate = `0 ${(y * 0.18).toFixed(1)}px`;
      heroSignature.style.translate = `0 ${(y * 0.32).toFixed(1)}px`;
    }

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', onScroll);
  mobileQuery.addEventListener('change', () => {
    parallaxEls.forEach((img) => (img.style.translate = ''));
    heroTitle.style.translate = '';
    heroSignature.style.translate = '';
  });
  onScroll();

  /* ---------- Lightbox for detailed mockups ---------- */

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = document.querySelector('[data-lightbox-img]');

  const openLightbox = (img) => {
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightbox.setAttribute('aria-hidden', 'false');
    root.classList.add('lightbox-open');
    lightbox.querySelector('[data-lightbox-close]').focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    lightbox.setAttribute('aria-hidden', 'true');
    root.classList.remove('lightbox-open');
  };

  document.querySelectorAll('img[data-zoom]').forEach((img) => {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });

  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();
