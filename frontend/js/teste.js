const highlights = [
    { id: 1, title: 'Festival de Verão Ubatuba 2025', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop', city: 'Ubatuba', date: '15 Jan 2025' },
    { id: 2, title: 'Noite Eletrônica na Praia', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop', city: 'Ilhabela', date: '22 Jan 2025' },
    { id: 3, title: 'Encontro Gastronômico do Litoral', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=600&fit=crop', city: 'São Sebastião', date: '28 Jan 2025' }
];

let currentSlide = 0;
let carouselInterval;

const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');
const profileBtn = document.getElementById('profileBtn');
const loginMenu = document.getElementById('loginMenu');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
// Seleciona os botões de cidade
const cityButtons = document.querySelectorAll('.city-btn');

function init() {
    renderCarousel();
    startCarousel();
    setupEventListeners();
    setupFilters(); // Inicia a filtragem
}

function renderCarousel() {
    if(!carouselTrack) return;
    carouselTrack.innerHTML = highlights.map((highlight, index) => `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}">
            <img src="${highlight.image}" alt="${highlight.title}">
            <div class="carousel-content">
                <h2>${highlight.title}</h2>
                <div class="carousel-info"><span>${highlight.city}</span><span>${highlight.date}</span></div>
            </div>
        </div>
    `).join('');

    if(carouselDots) {
        carouselDots.innerHTML = highlights.map((_, index) => `
            <button class="dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
        `).join('');
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                goToSlide(parseInt(e.target.dataset.slide));
            });
        });
    }
}

function goToSlide(slideIndex) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    if(slides[slideIndex]) slides[slideIndex].classList.add('active');
    if(dots[slideIndex]) dots[slideIndex].classList.add('active');
    currentSlide = slideIndex;
}

function nextSlide() { currentSlide = (currentSlide + 1) % highlights.length; goToSlide(currentSlide); }
function prevSlide() { currentSlide = (currentSlide - 1 + highlights.length) % highlights.length; goToSlide(currentSlide); }

function startCarousel() { carouselInterval = setInterval(nextSlide, 5000); }
function stopCarousel() { clearInterval(carouselInterval); }

function setupEventListeners() {
    if(prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopCarousel(); startCarousel(); });
    if(nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopCarousel(); startCarousel(); });

    if(profileBtn && loginMenu) {
        profileBtn.addEventListener('click', (e) => { e.stopPropagation(); loginMenu.classList.toggle('show'); });
        document.addEventListener('click', (e) => {
            if (!loginMenu.contains(e.target) && e.target !== profileBtn) loginMenu.classList.remove('show');
        });
    }
}

// LÓGICA DE FILTRO
function setupFilters() {
    if(!cityButtons) return;

    cityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            cityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            //Pega a cidade clicada
            const city = btn.dataset.city;
            const title = document.getElementById('sectionTitle');
            if(title) title.textContent = city === 'Todas' ? 'Todos os Eventos' : `Eventos em ${city}`;

            // Filtra os cards que o script.js já carregou
            const cards = document.querySelectorAll('#events-container .card');
            
            cards.forEach(card => {
                if (city === 'Todas') {
                    card.style.display = 'flex';
                } else {
                    if (card.innerText.includes(city)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', init);