const carousel = document.getElementById('propertyCarousel');
const title = document.getElementById('carouselTitle');
const text = document.getElementById('carouselText');
const btnPrev = document.getElementById('carouselPrev');
const btnNext = document.getElementById('carouselNext');

let bsInstance = null;

function updateCarouselNeighbors() {
    const items = Array.from(carousel.querySelectorAll('.carousel-item'));
    const active = carousel.querySelector('.carousel-item.active');
    if (!active) return;

    // clear neighbor classes
    items.forEach(i => {
        i.classList.remove('carousel-item-prev', 'carousel-item-next');
    });

    // find prev and next (wrap around)
    let prev = active.previousElementSibling;
    while (prev && !prev.classList.contains('carousel-item')) prev = prev.previousElementSibling;
    if (!prev) prev = items[items.length - 1];

    let next = active.nextElementSibling;
    while (next && !next.classList.contains('carousel-item')) next = next.nextElementSibling;
    if (!next) next = items[0];

    if (prev) prev.classList.add('carousel-item-prev');
    if (next) next.classList.add('carousel-item-next');

    title.textContent = active.dataset.title || '';
    text.textContent = active.dataset.text || '';

    const indicators = Array.from(document.querySelectorAll('.carousel-indicators [data-bs-target]'))
        .filter(btn => btn.getAttribute('data-bs-target') === `#${carousel.id}`);
    const activeIndex = items.indexOf(active);
    indicators.forEach(btn => {
        const idx = Number(btn.getAttribute('data-bs-slide-to'));
        if (idx === activeIndex) {
            btn.classList.add('active');
            btn.setAttribute('aria-current', 'true');
        } else {
            btn.classList.remove('active');
            btn.removeAttribute('aria-current');
        }
    });
}

// init on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.bootstrap && window.bootstrap.Carousel) {
        bsInstance = window.bootstrap.Carousel.getInstance(carousel) || new window.bootstrap.Carousel(carousel, { touch: false });
    }

    updateCarouselNeighbors();

    // update after sliding to sync captions and indicators
    carousel.addEventListener('slid.bs.carousel', function () {
        updateCarouselNeighbors();
    });

    // wire prev/next buttons
    if (btnPrev) btnPrev.addEventListener('click', () => { if (bsInstance) bsInstance.prev(); });
    if (btnNext) btnNext.addEventListener('click', () => { if (bsInstance) bsInstance.next(); });
});

(() => {
    if (!carousel) return;
    carousel.querySelectorAll('img').forEach(i => i.setAttribute('draggable', 'false'));

    const instance = bsInstance || (window.bootstrap && window.bootstrap.Carousel
        ? (window.bootstrap.Carousel.getInstance(carousel) || new window.bootstrap.Carousel(carousel, { touch: false }))
        : null);

    let pointerDown = false;
    let startX = 0;
    let deltaX = 0;
    const threshold = 40;

    const onPointerDown = (e) => {
        pointerDown = true;
        startX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        deltaX = 0;
        try { if (e.pointerId) carousel.setPointerCapture(e.pointerId); } catch (err) { }
    };

    const onPointerMove = (e) => {
        if (!pointerDown) return;
        const currentX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        deltaX = currentX - startX;
    };

    const onPointerUp = (e) => {
        if (!pointerDown) return;
        pointerDown = false;
        if (Math.abs(deltaX) > threshold && instance) {
            if (deltaX > 0) instance.prev(); else instance.next();
        }
        deltaX = 0;
    };

    // Pointer events (preferred)
    carousel.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    // Fallback for touch events (some browsers)
    carousel.addEventListener('touchstart', onPointerDown, { passive: true });
    carousel.addEventListener('touchmove', onPointerMove, { passive: true });
    carousel.addEventListener('touchend', onPointerUp, { passive: true });
})();

/* Gallery Navigation */
(() => {
    const mainImage = document.getElementById('mainGalleryImage');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    let currentIndex = 0;

    const galleryImages = [
        'assets/images/home1.webp',
        'assets/images/home2.webp',
        'assets/images/home3.webp',
        'assets/images/heroBg.png',
        'assets/images/home4.webp',
        'assets/images/marci.png',
        'assets/images/logo.png'
    ];

    function updateGallery(index) {
        if (index < 0) index = galleryImages.length - 1;
        if (index >= galleryImages.length) index = 0;
        currentIndex = index;

        // Update main image with fade effect
        mainImage.style.opacity = '0';
        setTimeout(() => {
            mainImage.src = galleryImages[currentIndex];
            mainImage.style.opacity = '1';
        }, 150);

        // Update active thumbnail
        thumbnails.forEach((thumb, i) => {
            if (i === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });

        // Scroll thumbnail into view
        const activeThumbnail = thumbnails[currentIndex];
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Initialize transition for main image
    mainImage.style.transition = 'opacity 0.3s ease';

    // Click handlers for prev/next buttons
    if (prevBtn) prevBtn.addEventListener('click', () => updateGallery(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => updateGallery(currentIndex + 1));

    // Click handlers for thumbnails
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => updateGallery(index));
    });

    // Keyboard navigation (arrow keys)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') updateGallery(currentIndex - 1);
        if (e.key === 'ArrowRight') updateGallery(currentIndex + 1);
    });

    // Initialize on page load
    updateGallery(0);
})();
