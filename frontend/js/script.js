// frontend/js/scripts.js
const API_URL = 'http://localhost:3000/api';

function showToast(message, type = 'success') {
    // 1. Procura o container, se não achar, cria um
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Cria a notificação
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    // 3. Adiciona ao container
    container.appendChild(toast);

    // 4. Remove automaticamente após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0'; // Efeito de sumir suave
        setTimeout(() => toast.remove(), 300); // Remove do DOM
    }, 3000);
}


let currentEventsList = []; 



const Auth = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    },
    isAuthenticated: () => !!localStorage.getItem('token'),
    getUserData: () => {
        const token = Auth.getToken();
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch (e) { return null; }
    }
};

async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { ...options, headers: { ...headers, ...options.headers } };
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html')) {
        loadDashboard();
        loadEvents();
        setupEventForm();
    } else if (path.includes('profile.html')) {
        loadProfile();
    }
});

function updateNavbar() {
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    if (Auth.isAuthenticated()) {
        const user = Auth.getUserData();
        if(authLinks) authLinks.classList.add('hidden');
        if(userLinks) {
            userLinks.classList.remove('hidden');
            document.getElementById('welcome-msg').textContent = `Olá, ${user.nome}`;
        }
    } else {
        if(authLinks) authLinks.classList.remove('hidden');
        if(userLinks) userLinks.classList.add('hidden');
    }
}

// --- CRUD EVENTOS ---

async function loadDashboard() {
    try {
        const stats = await apiFetch('/events/dashboard');
        const container = document.getElementById('stats-content');
        if(container) {
            container.innerHTML = `
                <div class="stat-box"><h3>${stats.total}</h3><p>Total de Eventos</p></div>
                <div class="stat-box"><h3>${stats.byCity.length}</h3><p>Cidades Ativas</p></div>
                <div class="stat-box"><h3>${stats.byCategory.length}</h3><p>Categorias</p></div>
            `;
        }
    } catch (error) { console.error("Erro dashboard:", error); }
}

async function loadEvents() {
    const container = document.getElementById('events-container');
    if(!container) return;

    try {
        const events = await apiFetch('/events');
        currentEventsList = events;
        const user = Auth.getUserData();
        const isAdmin = user && user.role === 'admin';

        container.innerHTML = events.map(event => {
            let actionButtons = '';

            if (user) {
                if (isAdmin) {
                    // ADMIN: Vê Editar e Excluir
                    actionButtons = `
                        <div class="actions">
                            <button onclick="openEditModal(${event.id})" class="secondary">Editar</button>
                            <button onclick="deleteEvent(${event.id})" class="danger">Excluir</button>
                        </div>
                    `;
                } else {
                    // USER COMUM: Vê Participar
                    actionButtons = `
                        <div class="actions">
                            <button onclick="participateEvent(${event.id})" class="primary">Participar</button>
                        </div>
                    `;
                }
            }

            return `
            <div class="card event-card">
                <img src="${event.image || 'https://via.placeholder.com/300'}" alt="${event.title}">
                <h3>${event.title}</h3>
                <p><strong>Cidade:</strong> ${event.city}</p>
                <p><strong>Categoria:</strong> ${event.category}</p>
                ${actionButtons}
            </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar eventos.</p>';
    }
}

async function createEvent(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
        title: form.title.value,
        image: form.image.value,
        category: form.category.value,
        city: form.city.value
        // rating removido pois o backend resolve
    };

    try {
        await apiFetch('/events', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Evento criado com sucesso!', 'success');
        form.reset();
        loadEvents();
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteEvent(id) {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await apiFetch(`/events/${id}`, { method: 'DELETE' });
        showToast('Evento excluído!', 'success');
        loadEvents();
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function setupEventForm() {
    const form = document.getElementById('event-form');
    const user = Auth.getUserData();

    // SÓ MOSTRA SE FOR ADMIN
    if (form && user && user.role === 'admin') {
        form.classList.remove('hidden'); // Remove a classe que esconde
        form.addEventListener('submit', createEvent);
    } else if (form) {
        form.classList.add('hidden'); // Garante que esteja escondido
    }
}

// --- FUNÇÕES DO MODAL DE EDITAR (NOVO) ---

function openEditModal(id) {
    // Procura o evento na lista que baixamos do banco
    const event = currentEventsList.find(e => e.id === id);
    if (!event) return;

    const form = document.getElementById('edit-form');
    form.id.value = event.id;
    form.title.value = event.title;
    form.image.value = event.image;
    form.city.value = event.city;
    form.category.value = event.category;

    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Configurar o envio do formulário de edição
const editForm = document.getElementById('edit-form');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editForm.id.value;
        const payload = {
            title: editForm.title.value,
            image: editForm.image.value,
            city: editForm.city.value,
            category: editForm.category.value
        };

        try {
            await apiFetch(`/events/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Evento atualizado com sucesso!', 'success');
            closeEditModal();
            loadEvents();
            loadDashboard();
        } catch (error) {
            showToast('Erro ao editar: ' + error.message, 'error');
        }
    });

    
}

async function participateEvent(id) {
    if(!confirm("Confirmar presença neste evento?")) return;
    try {
        const res = await apiFetch(`/events/${id}/participate`, { method: 'POST' });
        showToast(res.message || 'Inscrição realizada!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}