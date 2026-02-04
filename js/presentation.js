// List of slide files in order
const slidesList = [
    'sections/00_cover.html',
    'sections/01_toc.html',
    'sections/02_intro_context.html',
    'sections/03_intro_relevance.html',
    'sections/04_history_socrates.html',
    'sections/05_history_heraclitus.html',
    'sections/06_history_early.html',
    'sections/07_history_middle.html',
    'sections/08_history_late.html',
    'sections/09_ontology_monism.html',
    'sections/10_ontology_pantheism.html',
    'sections/11_ontology_determinism.html',
    'sections/12_ontology_compatibilism.html',
    'sections/13_epistemology_process.html',
    'sections/14_epistemology_katalepsis.html',
    'sections/15_logic_comparison.html',
    'sections/16_ethics_goal.html',
    'sections/17_ethics_good_bad.html',
    'sections/18_ethics_oikeiosis.html',
    'sections/19_ethics_passions.html',
    'sections/20_ethics_control.html',
    'sections/21_values_cosmopolitanism.html',
    'sections/22_values_resilience.html',
    'sections/23_limitations.html',
    'sections/24_modern_cbt.html',
    'sections/25_conclusion.html',
    'sections/26_thank_you.html'
];

const wrapper = document.getElementById('slides_wrapper');
let currentSlide = 0;
let isPresenting = false;

// Auto-Scale Logic
function handleResize() {
    if (!isPresenting) {
        document.body.style.setProperty('--scale', 1);
        return;
    }
    const sx = window.innerWidth / 1280;
    const sy = window.innerHeight / 720;
    const scale = Math.min(sx, sy);
    document.body.style.setProperty('--scale', scale);
}

window.addEventListener('resize', handleResize);


// Load all slides
async function loadSlides() {
    try {
        const promises = slidesList.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`Could not load ${url}`);
            return res.text();
        }));

        const contents = await Promise.all(promises);

        contents.forEach((html, index) => {
            const div = document.createElement('div');
            // Extract the body content or just inject raw if it's a fragment
            // Ideally fragments should just be the .slide-container
            div.innerHTML = html;
            // Ensure the root element is correct
            const slide = div.querySelector('.slide-container') || div.firstElementChild;
            if (slide) {
                slide.id = `slide-${index}`;
                wrapper.appendChild(slide);
            }
        });

        document.getElementById('loading').style.display = 'none';
        updateCounter();
        return Promise.resolve(); // Return success

    } catch (error) {
        console.error(error);
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; color: #ff6b6b;">
                <h1>Lỗi tải trang!</h1>
                <p>Trình duyệt chặn tải file trực tiếp (CORS Policy).</p>
                <div style="background: #333; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h3>Cách khắc phục:</h3>
                    <p>Hãy chạy file <code>start_presentation.bat</code> trong thư mục.</p>
                </div>
            </div>
        `;
    }
}

function updateCounter() {
    const total = document.querySelectorAll('.slide-container').length;
    document.getElementById('counter').innerText = `${currentSlide + 1} / ${total}`;
}

function updateView() {
    const slides = document.querySelectorAll('.slide-container');
    updateCounter();

    if (isPresenting) {
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === currentSlide);
        });
    } else {
        slides[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function nextSlide() {
    const total = document.querySelectorAll('.slide-container').length;
    if (currentSlide < total - 1) {
        currentSlide++;
        updateView();
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateView();
    }
}

function togglePresentation() {
    const slides = document.querySelectorAll('.slide-container');
    isPresenting = !isPresenting;
    document.body.classList.toggle('presentation-mode');

    if (isPresenting) {
        document.documentElement.requestFullscreen().catch(e => { });
        handleResize(); // Force recalc scale
        updateView();
        // Change icon to Stop/Compress
        const btnIcon = document.querySelector('#controls button:nth-child(2) i');
        if (btnIcon) {
            btnIcon.classList.remove('fa-play');
            btnIcon.classList.add('fa-compress'); // Or fa-stop
        }
    } else {
        document.exitFullscreen().catch(e => { });
        slides.forEach(s => s.classList.remove('active'));
        // Change icon back to Play
        const btnIcon = document.querySelector('#controls button:nth-child(2) i');
        if (btnIcon) {
            btnIcon.classList.remove('fa-compress');
            btnIcon.classList.add('fa-play');
        }
        // Sync scroll to current slide
        slides[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Keyboard nav
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'f' || e.key === 'F' || e.key === 'p' || e.key === 'P') togglePresentation();
    if (e.key === 'Escape' && isPresenting) togglePresentation();
});

// Mouse nav
document.addEventListener('click', (e) => {
    // Only trigger in presentation mode and not on buttons
    if (isPresenting && !e.target.closest('#controls')) {
        nextSlide();
    }
});

document.addEventListener('contextmenu', (e) => {
    // Right-click = go back in presentation mode
    if (isPresenting) {
        e.preventDefault();
        prevSlide();
    }
});

// Scroll Observer for Overview Mode
const observer = new IntersectionObserver((entries) => {
    if (isPresenting) return; // Don't mess with tracking while presenting
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Extract index from id "slide-X"
            const index = parseInt(entry.target.id.replace('slide-', ''));
            if (!isNaN(index)) {
                currentSlide = index;
                updateCounter();
            }
        }
    });
}, {
    threshold: 0.6 // Slide must be 60% visible to be considered "current"
});

// Init
loadSlides().then(() => {
    // Attach observer to all slides after they load
    document.querySelectorAll('.slide-container').forEach(slide => {
        observer.observe(slide);
    });
});
