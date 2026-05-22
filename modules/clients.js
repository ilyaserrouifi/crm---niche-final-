// /modules/clients.js

(function() {
    // ========================================
    // CLIENTS MODULE
    // Enterprise CRM Clients Management
    // ========================================

    // Module state
    let clientsContainer = null;
    let currentFilter = '';
    let selectedClientId = null;

    // Mock clients data
    const mockClients = [
        { id: 1, name: 'Jean Dupont', company: 'TechCorp SAS', email: 'jean@techcorp.fr', phone: '+33 6 12 34 56 78', status: 'active', plan: 'Enterprise', revenue: 15000, joined: '2024-01-15', lastActivity: '2024-12-10' },
        { id: 2, name: 'Marie Lambert', company: 'GreenOps', email: 'marie@greenops.com', phone: '+33 6 23 45 67 89', status: 'active', plan: 'Professional', revenue: 8500, joined: '2024-03-20', lastActivity: '2024-12-09' },
        { id: 3, name: 'Thomas Bernard', company: 'BlueSoft', email: 'thomas@bluesoft.io', phone: '+33 6 34 56 78 90', status: 'pending', plan: 'Starter', revenue: 3200, joined: '2024-06-10', lastActivity: '2024-12-05' },
        { id: 4, name: 'Sophie Martin', company: 'NexFlow', email: 'sophie@nexflow.com', phone: '+33 6 45 67 89 01', status: 'active', plan: 'Enterprise', revenue: 22000, joined: '2023-11-05', lastActivity: '2024-12-11' },
        { id: 5, name: 'Lucas Petit', company: 'DataWise', email: 'lucas@datawise.fr', phone: '+33 6 56 78 90 12', status: 'inactive', plan: 'Starter', revenue: 1800, joined: '2024-08-22', lastActivity: '2024-11-28' },
        { id: 6, name: 'Claire Dubois', company: 'CloudNine', email: 'claire@cloudnine.com', phone: '+33 6 67 89 01 23', status: 'active', plan: 'Professional', revenue: 9500, joined: '2024-02-14', lastActivity: '2024-12-08' },
        { id: 7, name: 'Nicolas Robert', company: 'SecureIT', email: 'nicolas@secureit.com', phone: '+33 6 78 90 12 34', status: 'pending', plan: 'Professional', revenue: 7200, joined: '2024-09-01', lastActivity: '2024-12-04' },
        { id: 8, name: 'Julie Moreau', company: 'FinSmart', email: 'julie@finsmart.fr', phone: '+33 6 89 01 23 45', status: 'active', plan: 'Enterprise', revenue: 18500, joined: '2023-10-18', lastActivity: '2024-12-10' }
    ];

    // Calculate stats
    function getClientStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const total = mockClients.length;
        const active = mockClients.filter(c => c.status === 'active').length;
        const newThisMonth = mockClients.filter(c => {
            const joinDate = new Date(c.joined);
            return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
        }).length;
        
        return { total, active, new: newThisMonth };
    }

    // Filter clients by search term
    function getFilteredClients() {
        if (!currentFilter) return mockClients;
        const term = currentFilter.toLowerCase();
        return mockClients.filter(client => 
            client.name.toLowerCase().includes(term) ||
            client.company.toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term)
        );
    }

    // Get status badge class and text
    function getStatusBadge(status) {
        switch(status) {
            case 'active':
                return { class: 'status-active', text: 'Actif', icon: '●' };
            case 'pending':
                return { class: 'status-pending', text: 'En attente', icon: '●' };
            case 'inactive':
                return { class: 'status-inactive', text: 'Inactif', icon: '●' };
            default:
                return { class: 'status-active', text: 'Actif', icon: '●' };
        }
    }

    // Format currency
    function formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
    }

    // Format date
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // ========================================
    // STYLES
    // ========================================
    const styles = `
        <style>
            /* Clients Module Container */
            .clients-module {
                padding: 24px 32px;
                animation: clientsFadeIn 0.3s ease;
            }
            
            @keyframes clientsFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Header */
            .clients-header {
                margin-bottom: 28px;
            }
            
            .clients-header h1 {
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.02em;
                background: linear-gradient(135deg, #fff, #94a3b8);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                margin-bottom: 4px;
            }
            
            .clients-header p {
                color: #64748b;
                font-size: 14px;
            }
            
            /* Stats Cards */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 28px;
            }
            
            .stat-card {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
                padding: 20px;
                transition: all 0.2s;
            }
            
            .stat-card:hover {
                border-color: #38bdf8;
                transform: translateY(-2px);
            }
            
            .stat-icon {
                width: 48px;
                height: 48px;
                background: rgba(56, 189, 248, 0.1);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                margin-bottom: 16px;
            }
            
            .stat-value {
                font-size: 32px;
                font-weight: 700;
                font-family: 'Space Grotesk', monospace;
                margin-bottom: 4px;
            }
            
            .stat-label {
                font-size: 13px;
                color: #94a3b8;
            }
            
            /* Toolbar */
            .clients-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                flex-wrap: wrap;
                gap: 16px;
            }
            
            .search-bar {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 12px;
                padding: 10px 16px;
                width: 300px;
                transition: all 0.2s;
            }
            
            .search-bar:focus-within {
                border-color: #38bdf8;
                box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1);
            }
            
            .search-bar input {
                background: none;
                border: none;
                outline: none;
                color: #f1f5f9;
                font-size: 13px;
                width: 100%;
            }
            
            .search-bar input::placeholder {
                color: #64748b;
            }
            
            .search-icon {
                color: #64748b;
                font-size: 16px;
            }
            
            .add-client-btn {
                background: #38bdf8;
                border: none;
                border-radius: 12px;
                padding: 10px 20px;
                color: #0b1220;
                font-weight: 600;
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .add-client-btn:hover {
                background: #7dd3fc;
                transform: translateY(-1px);
            }
            
            /* Clients Grid */
            .clients-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                gap: 20px;
            }
            
            .client-card {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            
            .client-card:hover {
                border-color: #38bdf8;
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(56, 189, 248, 0.1);
            }
            
            .client-card.selected {
                border-color: #38bdf8;
                background: rgba(56, 189, 248, 0.05);
            }
            
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            
            .client-name {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .client-company {
                font-size: 13px;
                color: #94a3b8;
            }
            
            .status-badge {
                font-size: 11px;
                padding: 4px 10px;
                border-radius: 20px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            
            .status-active {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .status-pending {
                background: rgba(245, 158, 11, 0.1);
                color: #f59e0b;
            }
            
            .status-inactive {
                background: rgba(100, 116, 139, 0.1);
                color: #94a3b8;
            }
            
            .card-details {
                margin: 12px 0;
                padding: 12px 0;
                border-top: 1px solid #1e293b;
                border-bottom: 1px solid #1e293b;
            }
            
            .detail-row {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 12px;
                color: #94a3b8;
                margin-bottom: 8px;
            }
            
            .detail-row:last-child {
                margin-bottom: 0;
            }
            
            .detail-icon {
                width: 20px;
            }
            
            .card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 12px;
                font-size: 11px;
                color: #64748b;
            }
            
            .client-revenue {
                font-weight: 600;
                color: #38bdf8;
            }
            
            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
            }
            
            .empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            .empty-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .empty-sub {
                font-size: 13px;
                color: #64748b;
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(11, 18, 32, 0.9);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.2s ease;
            }
            
            .modal-container {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 20px;
                width: 500px;
                max-width: 90vw;
                padding: 28px;
                animation: slideUp 0.2s ease;
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .modal-header h3 {
                font-size: 20px;
                font-weight: 600;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 24px;
                cursor: pointer;
            }
            
            .modal-close:hover {
                color: #ef4444;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                color: #94a3b8;
                margin-bottom: 6px;
            }
            
            .form-group input, .form-group select {
                width: 100%;
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 10px;
                padding: 10px 14px;
                color: #f1f5f9;
                font-size: 13px;
                outline: none;
            }
            
            .form-group input:focus, .form-group select:focus {
                border-color: #38bdf8;
            }
            
            .modal-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 24px;
            }
            
            .modal-actions button {
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .btn-cancel {
                background: #1e293b;
                border: 1px solid #334155;
                color: #94a3b8;
            }
            
            .btn-save {
                background: #38bdf8;
                border: none;
                color: #0b1220;
            }
            
            /* Detail View Sidebar */
            .detail-sidebar {
                position: fixed;
                right: 0;
                top: 0;
                width: 420px;
                height: 100vh;
                background: #111827;
                border-left: 1px solid #1e293b;
                z-index: 200;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
            }
            
            .detail-sidebar.open {
                transform: translateX(0);
            }
            
            .detail-header {
                padding: 24px;
                border-bottom: 1px solid #1e293b;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .detail-header h3 {
                font-size: 20px;
                font-weight: 600;
            }
            
            .detail-close {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 24px;
                cursor: pointer;
            }
            
            .detail-body {
                padding: 24px;
            }
            
            .detail-avatar {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #38bdf8, #0ea5e9);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 20px;
            }
            
            .detail-field {
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #1e293b;
            }
            
            .detail-label {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin-bottom: 4px;
            }
            
            .detail-value {
                font-size: 15px;
                font-weight: 500;
            }
            
            .overlay-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(11, 18, 32, 0.6);
                z-index: 199;
                display: none;
            }
            
            .overlay-backdrop.active {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .clients-module { padding: 16px; }
                .stats-grid { grid-template-columns: 1fr; }
                .clients-toolbar { flex-direction: column; align-items: stretch; }
                .search-bar { width: 100%; }
                .detail-sidebar { width: 100%; }
            }
        </style>
    `;

    // ========================================
    // MODAL HANDLERS
    // ========================================
    function showAddClientModal() {
        const modalHtml = `
            <div class="modal-overlay" id="client-modal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>➕ Nouveau client</h3>
                        <button class="modal-close" onclick="document.getElementById('client-modal').remove()">✕</button>
                    </div>
                    <form id="add-client-form">
                        <div class="form-group">
                            <label>Nom complet</label>
                            <input type="text" id="client-name" placeholder="Jean Dupont">
                        </div>
                        <div class="form-group">
                            <label>Entreprise</label>
                            <input type="text" id="client-company" placeholder="TechCorp SAS">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="client-email" placeholder="contact@entreprise.com">
                        </div>
                        <div class="form-group">
                            <label>Téléphone</label>
                            <input type="tel" id="client-phone" placeholder="+33 6 12 34 56 78">
                        </div>
                        <div class="form-group">
                            <label>Statut</label>
                            <select id="client-status">
                                <option value="active">Actif</option>
                                <option value="pending">En attente</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Plan</label>
                            <select id="client-plan">
                                <option value="Starter">Starter</option>
                                <option value="Professional">Professional</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-cancel" onclick="document.getElementById('client-modal').remove()">Annuler</button>
                            <button type="submit" class="btn-save">Ajouter</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const form = document.getElementById('add-client-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                showToast('Client ajouté (démo)', 'success');
                document.getElementById('client-modal').remove();
            });
        }
    }

    function showClientDetail(clientId) {
        const client = mockClients.find(c => c.id === clientId);
        if (!client) return;
        
        const statusBadge = getStatusBadge(client.status);
        
        const detailHtml = `
            <div class="overlay-backdrop" id="detail-backdrop"></div>
            <div class="detail-sidebar" id="client-detail">
                <div class="detail-header">
                    <h3>Détails client</h3>
                    <button class="detail-close" onclick="closeClientDetail()">✕</button>
                </div>
                <div class="detail-body">
                    <div class="detail-avatar">${client.name.charAt(0)}${client.company.charAt(0)}</div>
                    <div class="detail-field">
                        <div class="detail-label">Nom complet</div>
                        <div class="detail-value">${client.name}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Entreprise</div>
                        <div class="detail-value">${client.company}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${client.email}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Téléphone</div>
                        <div class="detail-value">${client.phone}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Statut</div>
                        <div class="detail-value"><span class="status-badge ${statusBadge.class}">${statusBadge.icon} ${statusBadge.text}</span></div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Plan</div>
                        <div class="detail-value">${client.plan}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Chiffre d'affaires</div>
                        <div class="detail-value" style="color:#38bdf8;font-weight:600">${formatCurrency(client.revenue)}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Client depuis</div>
                        <div class="detail-value">${formatDate(client.joined)}</div>
                    </div>
                    <div class="detail-field">
                        <div class="detail-label">Dernière activité</div>
                        <div class="detail-value">${formatDate(client.lastActivity)}</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detailHtml);
        
        const backdrop = document.getElementById('detail-backdrop');
        const sidebar = document.getElementById('client-detail');
        
        setTimeout(() => {
            if (sidebar) sidebar.classList.add('open');
            if (backdrop) backdrop.classList.add('active');
        }, 10);
        
        backdrop?.addEventListener('click', closeClientDetail);
    }
    
    function closeClientDetail() {
        const sidebar = document.getElementById('client-detail');
        const backdrop = document.getElementById('detail-backdrop');
        
        if (sidebar) {
            sidebar.classList.remove('open');
            setTimeout(() => sidebar.remove(), 300);
        }
        if (backdrop) backdrop.remove();
    }

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message, type = 'info') {
        let toastContainer = document.querySelector('.clients-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'clients-toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 12px;
            `;
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.style.cssText = `
            background: #111827;
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
            font-size: 13px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `;
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span style="flex:1">${message}</span>
            <span style="cursor:pointer" onclick="this.parentElement.remove()">✕</span>
        `;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ========================================
    // RENDER CLIENTS LIST
    // ========================================
    function renderClientsList() {
        const filteredClients = getFilteredClients();
        const stats = getClientStats();
        const grid = document.querySelector('.clients-grid');
        
        if (!grid) return;
        
        if (filteredClients.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1">
                    <div class="empty-icon">👥</div>
                    <div class="empty-title">Aucun client trouvé</div>
                    <div class="empty-sub">Essayez de modifier votre recherche</div>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filteredClients.map(client => {
            const statusBadge = getStatusBadge(client.status);
            return `
                <div class="client-card" data-client-id="${client.id}">
                    <div class="card-header">
                        <div>
                            <div class="client-name">${client.name}</div>
                            <div class="client-company">${client.company}</div>
                        </div>
                        <div class="status-badge ${statusBadge.class}">${statusBadge.icon} ${statusBadge.text}</div>
                    </div>
                    <div class="card-details">
                        <div class="detail-row">
                            <span class="detail-icon">✉️</span>
                            <span>${client.email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-icon">📞</span>
                            <span>${client.phone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-icon">⭐</span>
                            <span>${client.plan}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <span>📅 ${formatDate(client.joined)}</span>
                        <span class="client-revenue">${formatCurrency(client.revenue)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update stats display
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-active').textContent = stats.active;
        document.getElementById('stat-new').textContent = stats.new;
        
        // Attach click events to client cards
        document.querySelectorAll('.client-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const clientId = parseInt(card.dataset.clientId);
                showClientDetail(clientId);
            });
        });
    }

    // ========================================
    // SEARCH HANDLER
    // ========================================
    function setupSearch() {
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentFilter = e.target.value;
                renderClientsList();
            });
        }
    }

    // ========================================
    // MAIN RENDER FUNCTION
    // ========================================
    function renderClientsModule() {
        if (!clientsContainer) return;
        
        const stats = getClientStats();
        
        clientsContainer.innerHTML = `
            ${styles}
            <div class="clients-module">
                <div class="clients-header">
                    <h1>Gestion des clients</h1>
                    <p>Gérez votre portefeuille clients et suivez leur activité</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value" id="stat-total">${stats.total}</div>
                        <div class="stat-label">Total clients</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">●</div>
                        <div class="stat-value" id="stat-active" style="color:#10b981">${stats.active}</div>
                        <div class="stat-label">Clients actifs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🆕</div>
                        <div class="stat-value" id="stat-new" style="color:#38bdf8">${stats.new}</div>
                        <div class="stat-label">Nouveaux ce mois</div>
                    </div>
                </div>
                
                <div class="clients-toolbar">
                    <div class="search-bar">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="client-search" placeholder="Rechercher par nom, entreprise, email...">
                    </div>
                    <button class="add-client-btn" id="add-client-btn">
                        <span>➕</span>
                        <span>Ajouter un client</span>
                    </button>
                </div>
                
                <div class="clients-grid"></div>
            </div>
        `;
        
        renderClientsList();
        setupSearch();
        
        const addBtn = document.getElementById('add-client-btn');
        if (addBtn) {
            addBtn.addEventListener('click', showAddClientModal);
        }
    }

    // ========================================
    // EXPORTED INIT FUNCTION
    // ========================================
    window.initClients = function(containerId = 'app-root') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[Clients] Container #${containerId} not found`);
            return;
        }
        
        clientsContainer = container;
        clientsContainer.innerHTML = '';
        renderClientsModule();
        
        console.log('[Clients] Module initialized successfully');
    };
    
    // Auto-initialize if container exists
    if (document.getElementById('app-root')) {
        window.initClients();
    }
})();
