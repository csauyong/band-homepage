document.addEventListener('DOMContentLoaded', () => {

    const scrollSection = document.querySelector('.horizontal-scroll-section');
    const mvGrid = document.querySelector('.mv-grid');
    const stickyWrapper = document.querySelector('.sticky-wrapper');

    // DYNAMIC HEIGHT CALCULATION
    function setScrollHeight() {
        if (scrollSection && mvGrid) {
            // 1. Calculate how wide the horizontal content is
            const horizontalScrollLength = mvGrid.scrollWidth;

            // 2. Calculate the viewport width (what we see at once)
            const viewportWidth = window.innerWidth;

            // 3. The distance we need to scroll is the Total Width minus what is already visible
            const distToScroll = horizontalScrollLength - viewportWidth;

            // 4. Set the section height:
            //    Scroll Distance + 1 Window Height (to account for the sticky container itself)
            //    * Optional: Multiply distToScroll by 1.2 or 1.5 to make the scroll feel "heavier"/slower
            const totalHeight = distToScroll * 1.5 + window.innerHeight;

            scrollSection.style.height = `${totalHeight}px`;
        }
    }

    // Run initially
    setScrollHeight();

    // Re-calculate if the user resizes their browser
    window.addEventListener('resize', setScrollHeight);
    // --- 1. SCROLL REVEAL (Fade-in elements) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(element => {
        observer.observe(element);
    });


    // --- 2. NAVBAR SCROLL EFFECT ---
    const navbar = document.querySelector('.navbar');

    // We can leave this on the standard scroll listener as it's a simple toggle
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(5, 5, 5, 0.2)';
            navbar.style.backdropFilter = 'blur(5px)';
            navbar.style.webkitBackdropFilter = 'blur(5px)';
            navbar.style.padding = '1rem 3rem';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'blur(0px)';
            navbar.style.webkitBackdropFilter = 'blur(0px)';
            navbar.style.padding = '2rem 3rem';
            navbar.style.borderBottom = '1px solid transparent';
        }
    });


    // --- 3. HIGH PERFORMANCE SCROLL LOOP (Parallax + Horizontal) ---
    const background = document.querySelector('.global-parallax');

    // Store the latest scroll position
    let lastScrollY = window.scrollY;
    let isTicking = false;

    // Listen for scroll events, but only request a frame update
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateScrollVisuals(lastScrollY);
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true }); // 'passive: true' improves scrolling performance

    // The function that actually moves things
    function updateScrollVisuals(scrollY) {

        // A. Parallax Effect
        if (background) {
            const speed = parseFloat(background.getAttribute('data-speed')) || 0.1;
            // Direct mapping: No lag, just immediate position update
            background.style.transform = `translateY(${-scrollY * speed}px)`;
        }

        // B. Horizontal Scroll Trigger
        if (scrollSection && stickyWrapper && mvGrid) {
            const sectionRect = scrollSection.getBoundingClientRect();
            // Since we are inside a requestAnimationFrame, we can use the stored scrollY
            // but getBoundingClientRect is safer for "sticky" calculations relative to viewport.

            const sectionTop = sectionRect.top;
            const sectionHeight = scrollSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // Variables for calculation
            let translateX = 0;
            const scrollWidth = mvGrid.scrollWidth - stickyWrapper.clientWidth;
            const maxScroll = sectionHeight - windowHeight;

            // Logic: Where are we?
            if (sectionTop <= 0 && sectionTop > -maxScroll) {
                // ACTIVE: We are scrolling through the section
                const progress = Math.abs(sectionTop) / maxScroll;
                translateX = progress * scrollWidth;
            }
            else if (sectionTop <= -maxScroll) {
                // FINISHED: We are past the section (lock to end)
                translateX = scrollWidth;
            }
            else {
                // BEFORE: We haven't reached it yet (lock to start)
                translateX = 0;
            }

            // Apply immediately (No "Lerp" smoothing math = No Drift)
            mvGrid.style.transform = `translateX(-${translateX}px)`;
        }
    }

    // Initial call to set positions on load
    updateScrollVisuals(window.scrollY);
});