document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. SMOOTH SCROLL (LENIS)
    // ==========================================
    const lenis = new Lenis({
        duration: 2.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // ==========================================
    // 2. CUSTOM CURSOR
    // ==========================================
    const cursor = document.querySelector('.cursor');
    
    // Setup GSAP for cursor follow
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Inertia follow using GSAP ticker
    gsap.ticker.add(() => {
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0.2, // Small duration for inertia
            ease: "power2.out"
        });
    });

    // Cursor hover effects
    const interactives = document.querySelectorAll('a, button, .project-row');
    interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 3, duration: 0.3, ease: "back.out(1.7)" });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
    });

    // ==========================================
    // 3. HORIZONTAL SCROLL
    // ==========================================
    const workSection = document.querySelector('.work-section');
    const projectContainer = document.querySelector('.project-container');

    // Calculate how far we need to translate the container
    // It's the total width of the container minus the viewport width
    function getScrollAmount() {
        let containerWidth = projectContainer.scrollWidth;
        return -(containerWidth - window.innerWidth);
    }

    const tween = gsap.to(projectContainer, {
        x: getScrollAmount,
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: workSection,
        start: "center center",
        end: () => `+=${getScrollAmount() * -1}`, // Scroll distance equals translation distance
        pin: true,
        animation: tween,
        scrub: 1, // Smooth scrub
        invalidateOnRefresh: true // Recalculate on resize
    });

    // ==========================================
    // OTHERS: Clock & Reveals
    // ==========================================
    const timeEl = document.getElementById('time');
    function updateClock() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Initial Reveals
    gsap.to(".reveal-text", {
        y: 0,
        opacity: 1,
        duration: 2.0,
        ease: "power3.out",
        delay: 0.2
    });

    gsap.to(".reveal-fade", {
        y: 0,
        opacity: 1,
        duration: 2.0,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.5
    });

    // Scroll Reveals for other sections
    const scrollRevealElements = document.querySelectorAll('.awards-section .reveal-fade, .clients-section .reveal-fade, .about-section .reveal-fade, .footer .reveal-fade');
    
    scrollRevealElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 2.0,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                }
            }
        );
    });
    // ==========================================
    // 5. MARQUEE ANIMATION
    // ==========================================
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        // We have 4 items. We animate by -50% to seamless loop since items are identical.
        // Or calculate exactly: move left by half its width.
        const marqueeTween = gsap.to(marqueeContent, {
            xPercent: -50,
            repeat: -1,
            duration: 10,
            ease: "none"
        });

        // Optional: change speed or direction based on scroll velocity
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                // Adjust timeScale based on scroll velocity (faster when scrolling)
                // Default is 1. If scrolling down, increase scale.
                gsap.to(marqueeTween, {
                    timeScale: self.direction === 1 ? 1 + Math.abs(self.getVelocity() / 100) : -(1 + Math.abs(self.getVelocity() / 100)),
                    overwrite: true,
                    duration: 0.5
                });
                
                // Return to normal speed after scrolling stops
                clearTimeout(marqueeContent.scrollTimeout);
                marqueeContent.scrollTimeout = setTimeout(() => {
                    gsap.to(marqueeTween, {
                        timeScale: self.direction === 1 ? 1 : -1,
                        overwrite: true,
                        duration: 0.5
                    });
                }, 100);
            }
        });
    }

});
