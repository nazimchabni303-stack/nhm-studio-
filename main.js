document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. SMOOTH SCROLL (LENIS)
    // ==========================================
    const lenis = new Lenis({
        duration: 2.5,
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
    const interactives = document.querySelectorAll('a, button, .project-row, .gallery-item, .h-gallery-item');
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
        if (!projectContainer) return 0;
        let containerWidth = projectContainer.scrollWidth;
        return -(containerWidth - window.innerWidth);
    }

    if (workSection && projectContainer) {
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
    }

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

    // ==========================================
    // 3. PRELOADER & SCROLL REVEALS
    // ==========================================

    // Only hide elements OUTSIDE the hero section
    const scrollElements = document.querySelectorAll(
        '.work-section .reveal-fade, .work-section .reveal-text,' +
        '.services-section .reveal-fade, .services-section .reveal-text,' +
        '.awards-section .reveal-fade, .awards-section .reveal-text,' +
        '.clients-section .reveal-fade, .clients-section .reveal-text,' +
        '.about-section .reveal-fade, .about-section .reveal-text,' +
        '.footer .reveal-fade, .footer .reveal-text'
    );
    gsap.set(scrollElements, { opacity: 0, y: 80 });

    // Preloader timeline (fade in logo, then fade out screen)
    // We want the preloader to show on load
    gsap.set(".preloader", { pointerEvents: "all" });
    
    gsap.timeline()
    .to(".preloader-logo", {
        opacity: 1,
        duration: 1.0,
        ease: "power2.inOut"
    })
    .to(".preloader-logo", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        delay: 0.3
    })
    .to(".preloader", {
        yPercent: -100,
        duration: 1.2,
        ease: "expo.inOut",
        onComplete: () => {
            gsap.set(".preloader", { pointerEvents: "none", yPercent: 0, opacity: 0 }); // reset for transitions
        }
    }, "-=0.2");

    // ==========================================
    // PAGE TRANSITIONS
    // ==========================================
    const pageLinks = document.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.getAttribute('href');
            if(targetUrl) {
                const targetPath = targetUrl.split('#')[0];
                const currentPath = window.location.pathname;
                
                let isSamePage = false;
                if (targetUrl.startsWith('#')) {
                    isSamePage = true;
                } else if (targetPath) {
                    const normalizedTarget = targetPath.replace(/^\//, '').replace('index.html', '');
                    const normalizedCurrent = currentPath.replace(/^\//, '').replace('index.html', '');
                    if (normalizedTarget === normalizedCurrent) {
                        isSamePage = true;
                    }
                }

                if (!isSamePage) {
                    e.preventDefault();
                    
                    // Show preloader
                    gsap.set(".preloader", { opacity: 1, yPercent: 0, pointerEvents: "all", backgroundColor: "var(--bg-dark)" });
                    gsap.timeline()
                    .fromTo(".preloader", 
                        { yPercent: 100 }, 
                        { yPercent: 0, duration: 1.0, ease: "expo.inOut" }
                    )
                    .to(".preloader-logo", {
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.inOut",
                        onComplete: () => {
                            window.location.href = targetUrl;
                        }
                    });
                } else {
                    // It's an anchor link on the same page, do nothing to allow native scroll/jump
                    // BUT if we use Lenis, we can also smooth scroll it, but native is fine.
                }
            }
        });
    });

    // Scroll reveals — triggered ONCE, cleanly
    scrollElements.forEach((el) => {
        gsap.fromTo(el,
            { y: 80, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 2.8,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none none",
                }
            }
        );
    });

    // Refresh ScrollTrigger after images load
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // ==========================================
    // 5. MARQUEE ANIMATION
    // ==========================================
    // ==========================================
    // 4. MAGIC TEXT — Word-by-word scroll reveal
    // ==========================================
    document.querySelectorAll('.magic-text').forEach((el) => {
        const text = el.textContent;
        const words = text.split(' ');

        // Replace content with individual word spans
        el.innerHTML = words.map(word =>
            `<span class="magic-word"><span class="magic-ghost">${word}</span><span class="magic-real">${word}</span></span>`
        ).join(' ');

        const wordSpans = el.querySelectorAll('.magic-real');

        gsap.fromTo(wordSpans,
            { opacity: 0.15 },
            {
                opacity: 1,
                stagger: 0.08,
                ease: "none",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    end: "bottom 60%",
                    scrub: 1,
                }
            }
        );
    });

    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        // We have 4 items. We animate by -50% to seamless loop since items are identical.
        // Or calculate exactly: move left by half its width.
        const marqueeTween = gsap.to(marqueeContent, {
            xPercent: -50,
            repeat: -1,
            duration: 25,
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

    // ==========================================
    // 6. INSPO SECTION INTERACTION
    // ==========================================
    const inspoGrid = document.querySelector('.inspo-grid');
    const inspoFrames = document.querySelectorAll('.inspo-frame');
    
    if (inspoGrid && inspoFrames.length > 0) {
        let currentIndex = -1;
        
        function animateRandomFrame() {
            if (currentIndex !== -1) {
                inspoFrames[currentIndex].classList.remove('is-hovered');
            }
            
            for(let i=0; i<3; i++) {
                inspoGrid.style.setProperty(`--r${i}`, '4fr');
                inspoGrid.style.setProperty(`--c${i}`, '4fr');
            }
            
            let nextIndex = Math.floor(Math.random() * inspoFrames.length);
            while (nextIndex === currentIndex && inspoFrames.length > 1) {
                nextIndex = Math.floor(Math.random() * inspoFrames.length);
            }
            currentIndex = nextIndex;
            
            const frame = inspoFrames[currentIndex];
            const r = frame.getAttribute('data-row');
            const c = frame.getAttribute('data-col');
            
            inspoGrid.style.setProperty(`--r${r}`, '7fr');
            inspoGrid.style.setProperty(`--c${c}`, '7fr');
            frame.classList.add('is-hovered');
        }

        setInterval(animateRandomFrame, 2000);
        setTimeout(animateRandomFrame, 200);
    }// ==========================================
    // 7. HORIZONTAL GALLERY (INSPO PAGE)
    // ==========================================
    const horizontalGalleryWrapper = document.querySelector('.horizontal-gallery-wrapper');
    const horizontalGalleryContainer = document.querySelector('.horizontal-gallery-container');

    if (horizontalGalleryWrapper && horizontalGalleryContainer) {
        function getGalleryScrollAmount() {
            let containerWidth = horizontalGalleryContainer.scrollWidth;
            return -(containerWidth - window.innerWidth);
        }

        const hTween = gsap.to(horizontalGalleryContainer, {
            x: getGalleryScrollAmount,
            ease: "none"
        });

        ScrollTrigger.create({
            trigger: horizontalGalleryWrapper,
            start: "center center",
            end: () => `+=${getGalleryScrollAmount() * -1}`, 
            pin: true,
            animation: hTween,
            scrub: 2.5, // Cinematic progressive scroll inertia
            invalidateOnRefresh: true
        });

        // Cinematic progressive reveal for horizontal items
        const hItems = gsap.utils.toArray('.h-gallery-item, .h-text-item:not(.intro-block)');
        hItems.forEach((item) => {
            gsap.from(item, {
                opacity: 0,
                scale: 0.85,
                filter: "blur(15px)",
                scrollTrigger: {
                    trigger: item,
                    start: "left 100%",
                    end: "left 50%",
                    containerAnimation: hTween,
                    scrub: 1 // Ties the animation exactly to the scroll position
                }
            });
        });
    }

});
