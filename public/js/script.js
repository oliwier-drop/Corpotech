let lastScrollTop = 0;
const nav = document.querySelector('nav');
const menuBtn = document.querySelector('.menu');
const navLinks = document.querySelector('nav ul');

// Hide/Show navbar on scroll
window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && !navLinks.classList.contains('active')) {
        // Scroll down – hide nav only if menu is not open
        nav.classList.add('hide');
    } else {
        // Scroll up – show nav
        nav.classList.remove('hide');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Mobile menu toggle
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    navLinks.classList.toggle('active');
    nav.classList.toggle('menu-open');
    menuBtn.classList.toggle('open');
    
    // Change icon
    if (menuBtn.classList.contains('open')) {
        menuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            nav.classList.remove('menu-open');
            menuBtn.classList.remove('open');
            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && !nav.contains(e.target)) {
        navLinks.classList.remove('active');
        nav.classList.remove('menu-open');
        menuBtn.classList.remove('open');
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

// Initialize AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Handle smooth scrolling with offset for fixed header
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        const navHeight = document.querySelector('nav').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// Team Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.team-slider');
    if (!slider) return; // Exit if slider doesn't exist on the page
    
    const slides = slider.querySelectorAll('.team-member');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const dotsContainer = document.querySelector('.slider-dots');
    
    let currentIndex = 0;
    let slideWidth = 0;
    let slidesToShow = 3;

    // Clone slides for infinite effect
    function setupInfiniteSlider() {
        // Clear existing clones
        const existingClones = slider.querySelectorAll('.clone');
        existingClones.forEach(clone => clone.remove());

        // Clone first and last slides
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.classList.add('clone');
            slider.appendChild(clone);
        });

        // Clone first slides again for seamless loop
        for (let i = 0; i < slidesToShow; i++) {
            const clone = slides[i].cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.classList.add('clone');
            slider.insertBefore(clone, slider.firstChild);
        }
    }
    
    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const dotsCount = slides.length;
        
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            
            dotsContainer.appendChild(dot);
        }
    }
    
    // Update active dot
    function updateDots(index) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Normalize index for dots
        const normalizedIndex = ((index % slides.length) + slides.length) % slides.length;
        if (dots[normalizedIndex]) {
            dots[normalizedIndex].classList.add('active');
        }
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = index;
        
        // Calculate position including offset for cloned slides
        const offset = slidesToShow;
        const slideOffset = (currentIndex + offset) * slideWidth;
        
        slider.style.scrollBehavior = 'smooth';
        slider.scrollLeft = slideOffset;
        
        updateDots(currentIndex);

        // Check if we need to jump to the other end (done after animation)
        setTimeout(() => {
            if (currentIndex >= slides.length) {
                slider.style.scrollBehavior = 'auto';
                currentIndex = 0;
                slider.scrollLeft = offset * slideWidth;
                slider.style.scrollBehavior = 'smooth';
            } else if (currentIndex < 0) {
                slider.style.scrollBehavior = 'auto';
                currentIndex = slides.length - 1;
                slider.scrollLeft = (currentIndex + offset) * slideWidth;
                slider.style.scrollBehavior = 'smooth';
            }
        }, 500);
    }
    
    // Handle window resize
    function handleResize() {
        if (window.innerWidth < 768) {
            slidesToShow = 1;
        } else if (window.innerWidth < 1200) {
            slidesToShow = 2;
        } else {
            slidesToShow = 3;
        }
        
        // Calculate slide width including padding
        const slidePadding = 30; // 15px padding on each side
        setupInfiniteSlider(); // ponowne klonowanie zgodnie z aktualną wartością
        slideWidth = slider.querySelector('.team-member').offsetWidth;
        goToSlide(currentIndex);
    }
    
    // Init slider
    function initSlider() {
        handleResize();
        setupInfiniteSlider();
        createDots();
        
        
        prevArrow.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
        
        nextArrow.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
        
        window.addEventListener('resize', handleResize);
        
        // Auto-advance slides
        setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);

        // Initial positioning
        slider.scrollLeft = slidesToShow * slideWidth;
    }
    
    initSlider();
});