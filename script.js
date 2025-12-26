// ===== DOM ELEMENTS =====
const header = document.getElementById('header');
const logo = document.getElementById('logo');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');

// Carousel Elements
const slides = document.querySelectorAll('.carousel__slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');

// Experience Sections
const experienceSections = document.querySelectorAll('.experience-section');

// ===== HEADER SCROLL EFFECT =====
function handleScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll);

// ===== MOBILE MENU =====
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

// Close menu when clicking on nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('show-menu');
    }
});

// ===== CAROUSEL =====
let currentSlide = 0;
let autoPlayInterval;

// Create indicators
function createIndicators() {
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('carousel__indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
}

// Update indicators
function updateIndicators() {
    const indicators = document.querySelectorAll('.carousel__indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Go to specific slide
function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    slides[currentSlide].classList.add('active');
    updateIndicators();
}

// Next slide
function nextSlide() {
    goToSlide(currentSlide + 1);
}

// Previous slide
function prevSlide() {
    goToSlide(currentSlide - 1);
}

// Auto play
function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Event listeners
if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
    });
}

// Initialize carousel
if (slides.length > 0) {
    createIndicators();
    startAutoPlay();

    // Pause on hover
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
}

// ===== FULLPAGE SCROLL FOR EXPERIENCE SECTIONS =====
let isScrolling = false;
const SCROLL_COOLDOWN = 700; // ms entre transições

// Referências às seções de trigger (antes e depois do snap-scroll)
const plansSection = document.getElementById('plans');
const aboutSection = document.getElementById('about');

// Lista ordenada de todas as seções para navegação snap
function getAllSnapSections() {
    const sections = [];
    sections.push(plansSection); // Seção trigger inicial
    experienceSections.forEach(section => sections.push(section));
    sections.push(aboutSection); // Seção trigger final
    return sections.filter(s => s !== null);
}

const allSnapSections = getAllSnapSections();

function getHeaderHeight() {
    return header ? header.offsetHeight : 0;
}

function scrollToElement(element) {
    if (!element) return false;

    isScrolling = true;

    const headerHeight = getHeaderHeight();
    const targetTop = element.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
    });

    setTimeout(() => {
        isScrolling = false;
    }, SCROLL_COOLDOWN);

    return true;
}

function getCurrentSnapSectionIndex() {
    const headerHeight = getHeaderHeight();
    const windowHeight = window.innerHeight;

    for (let i = 0; i < allSnapSections.length; i++) {
        const rect = allSnapSections[i].getBoundingClientRect();
        const adjustedTop = rect.top - headerHeight;

        // A seção está "ativa" se seu topo está próximo do topo da janela (com tolerância)
        if (adjustedTop >= -windowHeight * 0.3 && adjustedTop < windowHeight * 0.5) {
            return i;
        }
    }
    return -1;
}

function isInSnapZone() {
    if (!plansSection || !aboutSection || experienceSections.length === 0) return false;

    const plansRect = plansSection.getBoundingClientRect();
    const aboutRect = aboutSection.getBoundingClientRect();
    const firstExpRect = experienceSections[0].getBoundingClientRect();
    const lastExpRect = experienceSections[experienceSections.length - 1].getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const headerHeight = getHeaderHeight();

    // Zona de snap começa quando:
    // - A PRIMEIRA seção de experiência está entrando na tela (topo visível)
    // Zona de snap termina quando:
    // - A ÚLTIMA seção de experiência já passou (seu topo está acima da tela)

    const firstExpVisible = firstExpRect.top < windowHeight * 0.8;
    const lastExpPassed = lastExpRect.top < -windowHeight * 0.5; // Mais tolerante para capturar scroll de baixo para cima

    return firstExpVisible && !lastExpPassed;
}

function handleSnapScroll(e) {
    // Se ainda está em cooldown, bloqueia
    if (isScrolling) {
        e.preventDefault();
        return;
    }

    // Verifica se estamos fora da zona snap
    if (!isInSnapZone()) {
        return; // Permite scroll normal
    }

    const currentIndex = getCurrentSnapSectionIndex();

    // Se não conseguiu determinar a seção atual, permite scroll normal
    if (currentIndex === -1) {
        return;
    }

    const delta = e.deltaY;

    // Scrollando para baixo
    if (delta > 0) {
        // Se ainda tem seções abaixo (até aboutSection)
        if (currentIndex < allSnapSections.length - 1) {
            e.preventDefault();
            scrollToElement(allSnapSections[currentIndex + 1]);
        }
        // Se está na última seção (about), permite scroll normal para continuar
    }
    // Scrollando para cima
    else if (delta < 0) {
        // Se ainda tem seções acima (até plansSection)
        if (currentIndex > 0) {
            e.preventDefault();
            scrollToElement(allSnapSections[currentIndex - 1]);
        }
        // Se está na primeira seção (plans), permite scroll normal para voltar
    }
}

// Add wheel event for snap sections
window.addEventListener('wheel', handleSnapScroll, { passive: false });

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== ANIMATE ON SCROLL =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .plan-card, .contact-card, .section__header');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll', 'animated');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// ===== GAMING PARTICLES =====
function createGamingParticles() {
    const container = document.getElementById('gaming-particles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(0, 255, 136, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }

    // Add particle animation style
    if (!document.getElementById('particle-style')) {
        const style = document.createElement('style');
        style.id = 'particle-style';
        style.textContent = `
            @keyframes particleFloat {
                0%, 100% {
                    transform: translate(0, 0) scale(1);
                    opacity: 0.3;
                }
                25% {
                    transform: translate(20px, -30px) scale(1.2);
                    opacity: 0.8;
                }
                50% {
                    transform: translate(-10px, -60px) scale(0.8);
                    opacity: 0.5;
                }
                75% {
                    transform: translate(30px, -30px) scale(1.1);
                    opacity: 0.7;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== NETWORK BACKGROUND FOR BUSINESS SECTION =====
function createNetworkBg() {
    const container = document.getElementById('network-bg');
    if (!container) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.opacity = "0.2";

    const points = [];
    const numPoints = 20;

    // Create random points
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * 100,
            y: Math.random() * 100
        });
    }

    // Create connections
    points.forEach((point, i) => {
        points.forEach((otherPoint, j) => {
            if (i < j) {
                const distance = Math.sqrt(
                    Math.pow(point.x - otherPoint.x, 2) +
                    Math.pow(point.y - otherPoint.y, 2)
                );

                if (distance < 30) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", `${point.x}%`);
                    line.setAttribute("y1", `${point.y}%`);
                    line.setAttribute("x2", `${otherPoint.x}%`);
                    line.setAttribute("y2", `${otherPoint.y}%`);
                    line.setAttribute("stroke", "#CE93D8");
                    line.setAttribute("stroke-width", "1");
                    svg.appendChild(line);
                }
            }
        });

        // Create point
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", `${point.x}%`);
        circle.setAttribute("cy", `${point.y}%`);
        circle.setAttribute("r", "3");
        circle.setAttribute("fill", "#CE93D8");
        svg.appendChild(circle);
    });

    container.appendChild(svg);
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
    } else if (e.key === 'ArrowLeft') {
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
    }
});

// ===== TOUCH SWIPE FOR CAROUSEL =====
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

const carousel = document.querySelector('.carousel');
if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only horizontal swipes for carousel
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        stopAutoPlay();
        startAutoPlay();
    }
}

// ===== TOUCH SWIPE FOR SNAP SECTIONS =====
let touchSnapStartY = 0;

allSnapSections.forEach((section, index) => {
    section.addEventListener('touchstart', (e) => {
        touchSnapStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    section.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        if (!isInSnapZone()) return;

        const touchEndY = e.changedTouches[0].screenY;
        const diff = touchSnapStartY - touchEndY;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && index < allSnapSections.length - 1) {
                // Swipe up - go to next section
                scrollToElement(allSnapSections[index + 1]);
            } else if (diff < 0 && index > 0) {
                // Swipe down - go to previous section
                scrollToElement(allSnapSections[index - 1]);
            }
        }
    }, { passive: true });
});

// ===== LAZY LOAD IMAGES =====
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ===== ACTIVE NAV LINK HIGHLIGHT =====
function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

// ===== PRELOADER =====
function hidePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    createGamingParticles();
    createNetworkBg();
    lazyLoadImages();
    highlightActiveNavLink();
    hidePreloader();

    // Initial scroll check
    handleScroll();
});

// ===== PERFORMANCE: DEBOUNCE SCROLL =====
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
}, { passive: true });
