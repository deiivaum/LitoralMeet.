const API_URL = 'http://localhost:3000/api';

//SISTEMA DE TOAST
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let currentEventsList = []; 

//SISTEMA DE AUTENTICACAO
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
    },
    isAdmin: () => {
        const user = Auth.getUserData();
        return user && user.role === 'admin';
    }
};

//CENTRAL DE REQUISIÇÕES
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { ...options, headers: { ...headers, ...options.headers } };
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            throw new Error(`Erro do servidor (não retornou JSON): ${response.status}`);
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro na requisição');
        return data;
    } catch (error) {
        console.error("Erro no apiFetch:", error);
        throw error; 
    }
}

// INICIALIZAÇÃO DA PÁGINA 
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const path = window.location.pathname;

    // Lógica para Home
    if (path === '/' || path.includes('index.html')) {
        // Só carrega dashboard se for ADMIN
        if (Auth.isAdmin()) {
            loadDashboard();
            setupEventForm(); // Mostra formulário de criar
        }
        loadEvents(); // Carrega eventos para todos
    } 
    else if (path.includes('profile.html')) {
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
            const welcome = document.getElementById('welcome-msg');
            if(welcome) welcome.textContent = `Olá, ${user.nome || 'Usuário'}`;
        }
    } else {
        if(authLinks) authLinks.classList.remove('hidden');
        if(userLinks) userLinks.classList.add('hidden');
    }
}

// DASHBOARD
async function loadDashboard() {
    const container = document.getElementById('stats-content');
    if(!container) return;

    try {
        const stats = await apiFetch('/events/dashboard');

        let htmlCidades = '';
        if (stats.byCity) {
           
            const lista = Array.isArray(stats.byCity) ? stats.byCity : Object.entries(stats.byCity);
            lista.slice(0, 3).forEach(item => {
                let nome = Array.isArray(item) ? item[0] : item.city;
                let qtd = Array.isArray(item) ? item[1] : (item._count ? item._count.city : 0);
                htmlCidades += `<div>${nome}: <strong>${qtd}</strong></div>`;
            });
        }

        container.innerHTML = `
            <div class="stat-card" style="background:white; padding:15px; border-radius:8px; text-align:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="color:#008B8B; font-size:2rem; margin:0">${stats.total || 0}</h3>
                <p style="color:#666">Total Eventos</p>
            </div>
            <div class="stat-card" style="background:white; padding:15px; border-radius:8px; text-align:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <div style="text-align:left; font-size:0.9rem; color:#555;">${htmlCidades || 'Sem dados'}</div>
                <p style="color:#666; margin-top:5px; font-size:0.8rem">Top Cidades</p>
            </div>
        `;
        container.classList.remove('hidden');
        
        // CSS Grid via JS
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
        container.style.gap = '15px';

    } catch (error) { 
        console.warn("Dashboard não carregado:", error.message);
        // Não mostra erro pro usuário comum, só esconde o dashboard
        container.classList.add('hidden');
    }
}

// LISTAGEM DE EVENTOS
async function loadEvents() {
    const container = document.getElementById('events-container');
    if(!container) return;

    try {
        const events = await apiFetch('/events');
        currentEventsList = events;
        
        if (events.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%">Nenhum evento encontrado.</p>';
            return;
        }

        const isAdmin = Auth.isAdmin();
        const isLogged = Auth.isAuthenticated();

        container.innerHTML = events.map(event => {
            let actionButtons = '';

            if (isAdmin) {
                // ADMIN: Vê Editar e Excluir
                actionButtons = `
                    <div class="actions" style="margin-top:10px; display:flex; gap:10px;">
                        <button onclick="openEditModal(${event.id})" style="flex:1; padding:8px; background:#f0ad4e; border:none; border-radius:4px; color:white; cursor:pointer;">Editar</button>
                        <button onclick="deleteEvent(${event.id})" style="flex:1; padding:8px; background:#d9534f; border:none; border-radius:4px; color:white; cursor:pointer;">Excluir</button>
                    </div>
                `;
            } else if (isLogged) {
                // USER COMUM: Vê Participar
                actionButtons = `
                    <div class="actions" style="margin-top:10px;">
                        <button onclick="participateEvent(${event.id})" style="width:100%; padding:8px; background:#008B8B; border:none; border-radius:4px; color:white; cursor:pointer;">Participar</button>
                    </div>
                `;
            }

            return `
            <div class="card event-card" style="background:white; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <img src="${event.image || 'https://via.placeholder.com/300'}" alt="${event.title}" style="width:100%; height:150px; object-fit:cover; border-radius:4px;">
                <h3 style="margin:10px 0; color:#333;">${event.title}</h3>
                <p style="color:#666; font-size:0.9rem;">📍 ${event.city}</p>
                <p style="color:#666; font-size:0.9rem;">🏷️ ${event.category}</p>
                ${actionButtons}
            </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar eventos: ${error.message}</p>`;
    }
}

//criar eventos

async function createEvent(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
        title: form.title.value,
        image: form.image.value,
        category: form.category.value,
        city: form.city.value
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
    // Só ativa o form se existir e for admin
    if (form && Auth.isAdmin()) {
        form.classList.remove('hidden');
        form.addEventListener('submit', createEvent);
    } else if (form) {
        form.classList.add('hidden');
    }
}

//MODAL DE EDIÇÃO

function openEditModal(id) {
    const event = currentEventsList.find(e => e.id === id);
    if (!event) return;

    const form = document.getElementById('edit-form');
    if(form) {
        form.id.value = event.id;
        form.title.value = event.title;
        form.image.value = event.image;
        form.city.value = event.city;
        form.category.value = event.category;
        document.getElementById('edit-modal').classList.remove('hidden');
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if(modal) modal.classList.add('hidden');
}

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
            showToast('Evento atualizado!', 'success');
            closeEditModal();
            loadEvents();
            loadDashboard(); 
        } catch (error) {
            showToast('Erro ao editar: ' + error.message, 'error');
        }
    });
}

//PARTICIPAÇÃO EM EVENTOS
async function participateEvent(id) {
    if(!confirm("Confirmar presença neste evento?")) return;
    try {
        const res = await apiFetch(`/events/${id}/participate`, { method: 'POST' });
        showToast(res.message || 'Inscrição realizada!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadProfile() {
    //Verifica se está logado
    if (!Auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    //Carrega dados do Usuário
    try {
        const userData = await apiFetch('/users/me');
        
        if(document.getElementById('nome')) document.getElementById('nome').value = userData.nome || '';
        if(document.getElementById('email')) document.getElementById('email').value = userData.email || '';
        if(document.getElementById('cpf')) document.getElementById('cpf').value = userData.cpf || '';
        
    } catch (error) {
        console.error("Erro perfil:", error);
        if(error.message.includes('401') || error.message.includes('403')) {
            Auth.logout();
        }
    }

    //Carrega as Inscrições 
    const eventsContainer = document.getElementById('my-participations-container');
    if (eventsContainer) {
        try {
            // Chama a rota que busca eventos do usuário
            const myEvents = await apiFetch('/events/my-events'); 

            if (myEvents.length === 0) {
                eventsContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 10px; background: #f9f9f9; border-radius: 6px;">Você ainda não se inscreveu em nenhum evento.</p>';
            } else {
                // Desenha os cards dos eventos
                eventsContainer.innerHTML = myEvents.map(event => `
                    <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${event.image || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                            <div>
                                <h4 style="margin: 0; color: #333; font-size: 1rem;">${event.title}</h4>
                                <span style="font-size: 0.8rem; color: #666;">${event.city} • ${event.category}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span style="display: block; color: #008B8B; font-weight: bold; font-size: 0.8rem; background: #E0FFFF; padding: 5px 10px; border-radius: 20px;">✓ Confirmado</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error("Erro ao carregar inscrições:", error);
            eventsContainer.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar suas inscrições.</p>';
        }
    }

    // Configura botão de salvar
    const profileForm = document.getElementById('profile-form');
    if(profileForm) {
       
        const newForm = profileForm.cloneNode(true);
        profileForm.parentNode.replaceChild(newForm, profileForm);
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const senhaVal = document.getElementById('senha').value;
            
            const payload = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value
            };
            if(senhaVal) payload.senha = senhaVal;

            try {
                await apiFetch('/users/me', {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showToast('Perfil atualizado com sucesso!', 'success');
                document.getElementById('senha').value = '';
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    //botão de excluir
    const btnDelete = document.getElementById('btn-delete-account');
    if(btnDelete) {
        const newBtn = btnDelete.cloneNode(true);
        btnDelete.parentNode.replaceChild(newBtn, btnDelete);

        newBtn.addEventListener('click', async () => {
            if(!confirm("ATENÇÃO: Isso apagará sua conta e todas as suas inscrições permanentemente!")) return;
            try {
                await apiFetch('/users/me', { method: 'DELETE' });
                alert("Conta excluída. Sentiremos sua falta!");
                Auth.logout();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
}