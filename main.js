document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. SMOOTH SCROLL (LENIS)
    // ==========================================
    const lenis = new Lenis({
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        smoothWheel: true
    });
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // ==========================================
    // 2. CUSTOM CURSOR
    // ==========================================
    const cursor = document.querySelector('.cursor');
    
    // Only enable custom cursor on non-touch devices
    if (cursor && window.matchMedia("(pointer: fine)").matches) {
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
    } else if (cursor) {
        cursor.style.display = 'none';
    }

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
        let mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
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
                scrub: 2.5, // Slow cinematic scrub
                invalidateOnRefresh: true // Recalculate on resize
            });

            // Slow cinematic progressive reveal for horizontal project items
            const projectRows = gsap.utils.toArray('.work-section .project-row');
            projectRows.forEach((row) => {
                gsap.from(row, {
                    opacity: 0.2,
                    scale: 0.9,
                    y: 30,
                    scrollTrigger: {
                        trigger: row,
                        start: "left 95%",
                        end: "left 50%",
                        containerAnimation: tween,
                        scrub: 1
                    }
                });
            });
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
    const preloaderEl = document.querySelector('.preloader');
    
    function hidePreloader() {
        if (preloaderEl) {
            preloaderEl.classList.add('is-hidden');
            gsap.set(preloaderEl, { pointerEvents: "none", display: "none", opacity: 0 });
        }
        if (window.lenis) window.lenis.resize();
        ScrollTrigger.refresh();
    }

    if (preloaderEl) {
        gsap.timeline()
        .to(".preloader-logo", {
            opacity: 1,
            duration: 0.6,
            ease: "power2.inOut"
        })
        .to(".preloader-logo", {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
            delay: 0.2
        })
        .to(".preloader", {
            yPercent: -100,
            duration: 0.8,
            ease: "expo.inOut",
            onComplete: hidePreloader
        }, "-=0.1");

        // Safety fallback: guaranteed hide after 1.8 seconds max
        setTimeout(hidePreloader, 1800);
    }

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
                    // For local file testing or dev server, if they are exactly the same, it's the same page
                    if (normalizedTarget === normalizedCurrent && normalizedTarget !== 'about.html' && normalizedTarget !== 'realisations.html' && normalizedTarget !== 'inspo.html') {
                        isSamePage = true;
                    }
                }

                if (!isSamePage) {
                    // Fast native navigation for smooth reliable page loads
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

    // ==========================================
    // 8. ZOOM PARALLAX MAGAZINE
    // ==========================================
    const zoomContainer = document.querySelector('.zoom-parallax-container');
    if (zoomContainer) {
        const scales = [4, 5, 6, 5, 6, 8, 9];
        const layers = document.querySelectorAll('.zoom-image-layer');
        const articlesOverlay = document.querySelector('.zoom-articles-overlay');

        const zoomTl = gsap.timeline({
            scrollTrigger: {
                trigger: zoomContainer,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                pin: ".zoom-parallax-sticky",
                onUpdate: (self) => {
                    // Reveal articles when scroll reaches 55% of the parallax container
                    if (self.progress > 0.55) {
                        articlesOverlay?.classList.add('is-visible');
                    } else {
                        articlesOverlay?.classList.remove('is-visible');
                    }
                }
            }
        });

        layers.forEach((layer, i) => {
            const targetScale = scales[i % scales.length];
            zoomTl.to(layer, {
                scale: targetScale,
                ease: "none"
            }, 0);
        });
    }


    // ==========================================
    // MOBILE MAGAZINE MENU
    // ==========================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuClose = document.querySelector('.mobile-menu-close');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');

    if (menuBtn && menuClose && menuOverlay) {
        // CRITICAL: Stop Lenis from intercepting touch/wheel events inside the overlay
        ['wheel', 'touchstart', 'touchmove', 'touchend'].forEach(evt => {
            menuOverlay.addEventListener(evt, (e) => {
                e.stopPropagation();
            }, { passive: true });
        });

        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.add('is-active');
            menuOverlay.scrollTop = 0;
            if (window.lenis) window.lenis.stop();
        });

        menuClose.addEventListener('click', () => {
            menuOverlay.classList.remove('is-active');
            if (window.lenis) window.lenis.start();
        });

        // Also close when clicking a menu link
        menuOverlay.querySelectorAll('.mobile-menu-item').forEach(link => {
            link.addEventListener('click', () => {
                menuOverlay.classList.remove('is-active');
                if (window.lenis) window.lenis.start();
            });
        });
    }

});
