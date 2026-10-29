document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');

    function closeNavigation() {
        if (!navToggle || !nav) return;
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation');
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeNavigation);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) {
                closeNavigation();
                navToggle.focus();
            }
        });
    }

    const searchInput = document.querySelector('[data-filter-input]');
    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
    const status = document.querySelector('[data-filter-status]');
    const filterButtons = Array.from(document.querySelectorAll('[data-stream-filter]'));

    if (searchInput && cards.length) {
        let selectedStream = 'all';

        function updateResults() {
            const query = searchInput.value.trim().toLocaleLowerCase();
            let visibleCount = 0;

            cards.forEach(function (card) {
                const text = (card.dataset.search || card.textContent || '').toLocaleLowerCase();
                const matchesQuery = !query || text.includes(query);
                const matchesStream = selectedStream === 'all' || card.dataset.stream === selectedStream;
                card.hidden = !(matchesQuery && matchesStream);
                if (!card.hidden) visibleCount += 1;
            });

            if (status) {
                status.textContent = visibleCount === 0
                    ? 'No matching subjects or streams. Try a different search.'
                    : visibleCount + (visibleCount === 1 ? ' result shown.' : ' results shown.');
            }
        }

        searchInput.addEventListener('input', updateResults);

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                selectedStream = button.dataset.streamFilter || 'all';
                filterButtons.forEach(function (filterButton) {
                    filterButton.setAttribute('aria-pressed', String(filterButton === button));
                });
                updateResults();
            });
        });

        updateResults();
    }

    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const preview = document.querySelector('#preview');

    if (preview instanceof HTMLDialogElement && galleryItems.length) {
        const previewImage = preview.querySelector('#previewImg');
        const previewCaption = preview.querySelector('#previewCaption');
        const closeButton = preview.querySelector('.close');
        const previousButton = preview.querySelector('.previous');
        const nextButton = preview.querySelector('.next');
        let activeIndex = 0;
        let touchStartX = null;
        let returnFocus = null;

        function showPhoto(index) {
            activeIndex = (index + galleryItems.length) % galleryItems.length;
            const item = galleryItems[activeIndex];
            if (!(previewImage instanceof HTMLImageElement) || !(previewCaption instanceof HTMLElement)) return;
            previewImage.src = item.dataset.src || '';
            previewImage.alt = item.dataset.alt || '';
            previewCaption.textContent = 'Photo ' + (activeIndex + 1) + ' of ' + galleryItems.length;
        }

        galleryItems.forEach(function (item, index) {
            item.addEventListener('click', function () {
                returnFocus = item;
                showPhoto(index);
                preview.showModal();
                if (closeButton instanceof HTMLElement) closeButton.focus();
            });
        });

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                showPhoto(activeIndex - 1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showPhoto(activeIndex + 1);
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', function () {
                preview.close();
            });
        }

        preview.addEventListener('click', function (event) {
            if (event.target === preview) preview.close();
        });

        preview.addEventListener('close', function () {
            const focusTarget = returnFocus;
            window.requestAnimationFrame(function () {
                if (focusTarget instanceof HTMLElement) focusTarget.focus();
            });
        });

        preview.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPhoto(activeIndex - 1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                showPhoto(activeIndex + 1);
            }
        });

        preview.addEventListener('touchstart', function (event) {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        preview.addEventListener('touchend', function (event) {
            if (touchStartX === null) return;
            const distance = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(distance) > 50) showPhoto(activeIndex + (distance < 0 ? 1 : -1));
            touchStartX = null;
        }, { passive: true });
    }
});
