document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(element => {
        observer.observe(element);
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // Scrolled State: Blurred & Slightly Tinted
            navbar.style.background = 'rgba(5, 5, 5, 0.2)';
            navbar.style.backdropFilter = 'blur(5px)';
            navbar.style.webkitBackdropFilter = 'blur(5px)';
            navbar.style.padding = '1rem 3rem';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            // Top State: Fully Transparent
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'blur(0px)';
            navbar.style.webkitBackdropFilter = 'blur(0px)';
            navbar.style.padding = '2rem 3rem';
            navbar.style.borderBottom = '1px solid transparent';
        }
    });
    // Navbar Scroll Effect continued...


    // --- COMBINED SMOOTH SCROLL & PARALLAX LOGIC ---

    const scrollSection = document.querySelector('.horizontal-scroll-section');
    const stickyWrapper = document.querySelector('.sticky-wrapper');
    const mvGrid = document.querySelector('.mv-grid');
    const background = document.querySelector('.global-parallax');

    // Variables for smoothing
    let currentTranslateX = 0;
    let targetTranslateX = 0;

    // Animation Loop (Runs 60fps for smooth motion)
    function animate() {
        // 1. FIX: Parallax runs here so it updates constantly
        if (background) {
            const speed = parseFloat(background.getAttribute('data-speed')) || 0.1;
            // Directly use window.scrollY for parallax
            const yPos = -(window.scrollY * speed);
            background.style.transform = `translateY(${yPos}px)`;
        }

        // 2. FIX: Smooth Horizontal Scroll using "Lerp"
        if (scrollSection && stickyWrapper && mvGrid) {
            // "Lerp" formula: Current = Current + (Target - Current) * Ease
            // 0.05 is the "weight". Lower = smoother/slower. Higher = more responsive.
            currentTranslateX += (targetTranslateX - currentTranslateX) * 0.05;

            // Apply the result
            mvGrid.style.transform = `translateX(-${currentTranslateX}px)`;
        }

        // Keep the loop running
        requestAnimationFrame(animate);
    }

    // Start the animation loop
    animate();

    // Scroll Listener (Only calculates the TARGET, doesn't move the element)
    window.addEventListener('scroll', () => {
        if (scrollSection && stickyWrapper && mvGrid) {
            const sectionRect = scrollSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const sectionHeight = scrollSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // Calculate widths
            const scrollWidth = mvGrid.scrollWidth - stickyWrapper.clientWidth;

            // Logic: Is the section currently sticking?
            if (sectionTop <= 0 && sectionTop > -(sectionHeight - windowHeight)) {
                // We are inside the scroll zone
                const scrolledDistance = Math.abs(sectionTop);
                const maxScroll = sectionHeight - windowHeight;

                const progress = scrolledDistance / maxScroll;

                // Update the TARGET value
                targetTranslateX = progress * scrollWidth;
            }
            // Logic: Have we scrolled PAST the section?
            else if (sectionTop <= -(sectionHeight - windowHeight)) {
                // Lock to the end
                targetTranslateX = scrollWidth;
            }
            // Logic: Are we BEFORE the section?
            else {
                // Lock to the start
                targetTranslateX = 0;
            }
        }
    });
});