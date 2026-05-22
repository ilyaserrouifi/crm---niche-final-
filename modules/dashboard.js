// /modules/dashboard.js

(function() {
    // ========================================
    // DASHBOARD MODULE
    // Enterprise CRM Dashboard
    // ========================================

    // Module state
    let dashboardContainer = null;
    let refreshInterval = null;

    // Mock data - will be replaced with API calls later
    const mockData = {
        revenue: { value: 84720, change: 12.5, trend: 'up' },
        clients: { value: 324, change: 8.2, trend: 'up' },
        projects: { value: 47, change: -2, trend: 'down' },
        team: { value: 18, change: 5, trend: 'up' },
        recentActivities: [
            { id: 1, type: 'deal', title: 'Nouvelle opportunité', company: 'TechCorp', value: 15000, time: '5 min', icon: '🎯', color: '#38bdf8' },
            { id: 2, type: 'client', title: 'Nouveau client', company: 'GreenOps', value: null, time: '2 heures', icon: '👤', color: '#10b981' },
            { id: 3, type: 'project', title: 'Projet terminé', company: 'BlueSoft', value: null, time: '1 jour', icon: '✅', color: '#f59e0b' },
            { id: 4, type: 'task', title: 'Tâche complétée', company: 'NexFlow', value: null, time: '3 jours', icon: '📋', color: '#8b5cf6' },
            { id: 5, type: 'meeting', title: 'Réunion programmée', company: 'Acme Corp', value: null, time: '5 jours', icon: '📅', color: '#ec4899' }
        ],
        quickActions: [
            { id: 'new-deal', label: '+ Nouveau deal', icon: '💰', color: '#38bdf8' },
            { id: 'new-client', label: '+ Nouveau client', icon: '👥', color: '#10b981' },
            { id: 'new-project', label: '+ Nouveau projet', icon: '📁', color: '#f59e0b' },
            { id: 'new-task', label: '+ Nouvelle tâche', icon: '✓', color: '#8b5cf6' }
        ],
        upcomingTasks: [
            { id: 1, title: 'Appel client TechCorp', priority: 'high', due: 'Aujourd\'hui', assignee: 'Karim' },
            { id: 2, title: 'Finaliser proposition GreenOps', priority: 'medium', due: 'Demain', assignee: 'Sara' },
            { id: 3, title: 'Revue mensuelle', priority: 'low', due: 'Vendredi', assignee: 'Youssef' }
        ]
    };

    // ========================================
    // STYLES
    // ========================================
    const styles = `
        <style>
            /* Dashboard Container */
            .dashboard-module {
                padding: 24px 32px;
                animation: fadeIn 0.4s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Dashboard Header */
            .dashboard-header {
                margin-bottom: 28px;
            }
            
            .dashboard-header h1 {
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.02em;
                background: linear-gradient(135deg, #fff, #94a3b8);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                margin-bottom: 4px;
            }
            
            .dashboard-header p {
                color: #64748b;
                font-size: 14px;
            }
            
            /* KPI Grid */
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 32px;
            }
            
            .kpi-card {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
                padding: 20px;
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .kpi-card:hover {
                border-color: #38bdf8;
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(56, 189, 248, 0.1);
            }
            
            .kpi-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
            }
            
            .kpi-icon {
                width: 48px;
                height: 48px;
                background: rgba(56, 189, 248, 0.1);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .kpi-trend {
                font-size: 12px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 20px;
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .kpi-trend.down {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .kpi-value {
                font-size: 32px;
                font-weight: 700;
                font-family: 'Space Grotesk', monospace;
                margin-bottom: 4px;
            }
            
            .kpi-label {
                font-size: 13px;
                color: #94a3b8;
            }
            
            /* Two Column Layout */
            .dashboard-two-col {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 24px;
                margin-bottom: 28px;
            }
            
            /* Activity Feed */
            .activity-feed {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
                overflow: hidden;
            }
            
            .section-header {
                padding: 16px 20px;
                border-bottom: 1px solid #1e293b;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .section-header h3 {
                font-size: 16px;
                font-weight: 600;
            }
            
            .section-header a {
                font-size: 12px;
                color: #38bdf8;
                text-decoration: none;
            }
            
            .activity-list {
                padding: 0 20px;
            }
            
            .activity-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 0;
                border-bottom: 1px solid #1e293b;
            }
            
            .activity-item:last-child {
                border-bottom: none;
            }
            
            .activity-icon {
                width: 40px;
                height: 40px;
                background: rgba(56, 189, 248, 0.1);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
            }
            
            .activity-content {
                flex: 1;
            }
            
            .activity-title {
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            .activity-company {
                font-size: 11px;
                color: #64748b;
            }
            
            .activity-value {
                font-size: 13px;
                font-weight: 600;
                color: #38bdf8;
            }
            
            .activity-time {
                font-size: 11px;
                color: #64748b;
            }
            
            /* Quick Actions Panel */
            .quick-actions {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
                overflow: hidden;
            }
            
            .actions-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                padding: 20px;
            }
            
            .action-btn {
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
                font-size: 13px;
                font-weight: 500;
                color: #f1f5f9;
            }
            
            .action-btn:hover {
                border-color: #38bdf8;
                background: rgba(56, 189, 248, 0.05);
                transform: translateY(-1px);
            }
            
            .action-icon {
                font-size: 18px;
            }
            
            /* Upcoming Tasks */
            .upcoming-tasks {
                background: #111827;
                border: 1px solid #1e293b;
                border-radius: 16px;
                overflow: hidden;
            }
            
            .tasks-list {
                padding: 0 20px;
            }
            
            .task-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 0;
                border-bottom: 1px solid #1e293b;
            }
            
            .task-item:last-child {
                border-bottom: none;
            }
            
            .task-priority {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            
            .task-priority.high { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
            .task-priority.medium { background: #f59e0b; }
            .task-priority.low { background: #10b981; }
            
            .task-content {
                flex: 1;
            }
            
            .task-title {
                font-size: 13px;
                font-weight: 500;
                margin-bottom: 2px;
            }
            
            .task-meta {
                font-size: 11px;
                color: #64748b;
                display: flex;
                gap: 12px;
            }
            
            .task-assignee {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            /* Responsive */
            @media (max-width: 1024px) {
                .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                .dashboard-two-col { grid-template-columns: 1fr; }
            }
            
            @media (max-width: 640px) {
                .kpi-grid { grid-template-columns: 1fr; }
                .dashboard-module { padding: 16px; }
                .actions-grid { grid-template-columns: 1fr; }
            }
        </style>
    `;

    // ========================================
    // FORMAT HELPERS
    // ========================================
    function formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
    }

    // ========================================
    // COMPONENTS RENDERERS
    // ========================================
    function renderKPICards() {
        return `
            <div class="kpi-grid">
                <div class="kpi-card" data-action="revenue">
                    <div class="kpi-header">
                        <div class="kpi-icon">💰</div>
                        <span class="kpi-trend ${mockData.revenue.trend === 'down' ? 'down' : ''}">${mockData.revenue.trend === 'up' ? '↑' : '↓'} ${Math.abs(mockData.revenue.change)}%</span>
                    </div>
                    <div class="kpi-value">${formatCurrency(mockData.revenue.value)}</div>
                    <div class="kpi-label">Revenus (MRR)</div>
                </div>
                <div class="kpi-card" data-action="clients">
                    <div class="kpi-header">
                        <div class="kpi-icon">👥</div>
                        <span class="kpi-trend ${mockData.clients.trend === 'down' ? 'down' : ''}">${mockData.clients.trend === 'up' ? '↑' : '↓'} ${Math.abs(mockData.clients.change)}%</span>
                    </div>
                    <div class="kpi-value">${mockData.clients.value}</div>
                    <div class="kpi-label">Clients actifs</div>
                </div>
                <div class="kpi-card" data-action="projects">
                    <div class="kpi-header">
                        <div class="kpi-icon">📁</div>
                        <span class="kpi-trend ${mockData.projects.trend === 'down' ? 'down' : ''}">${mockData.projects.trend === 'up' ? '↑' : '↓'} ${Math.abs(mockData.projects.change)}%</span>
                    </div>
                    <div class="kpi-value">${mockData.projects.value}</div>
                    <div class="kpi-label">Projets actifs</div>
                </div>
                <div class="kpi-card" data-action="team">
                    <div class="kpi-header">
                        <div class="kpi-icon">⭐</div>
                        <span class="kpi-trend ${mockData.team.trend === 'down' ? 'down' : ''}">${mockData.team.trend === 'up' ? '↑' : '↓'} ${Math.abs(mockData.team.change)}%</span>
                    </div>
                    <div class="kpi-value">${mockData.team.value}</div>
                    <div class="kpi-label">Membres d'équipe</div>
                </div>
            </div>
        `;
    }

    function renderRecentActivities() {
        return `
            <div class="activity-feed">
                <div class="section-header">
                    <h3>🔄 Activité récente</h3>
                    <a href="#" data-action="view-all">Voir tout →</a>
                </div>
                <div class="activity-list">
                    ${mockData.recentActivities.map(activity => `
                        <div class="activity-item" data-id="${activity.id}">
                            <div class="activity-icon" style="background: ${activity.color}10; color: ${activity.color}">${activity.icon}</div>
                            <div class="activity-content">
                                <div class="activity-title">${activity.title}</div>
                                <div class="activity-company">${activity.company}</div>
                            </div>
                            <div class="activity-value">${activity.value ? formatCurrency(activity.value) : ''}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderQuickActions() {
        return `
            <div class="quick-actions">
                <div class="section-header">
                    <h3>⚡ Actions rapides</h3>
                </div>
                <div class="actions-grid">
                    ${mockData.quickActions.map(action => `
                        <button class="action-btn" data-action="${action.id}">
                            <span class="action-icon">${action.icon}</span>
                            <span>${action.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderUpcomingTasks() {
        return `
            <div class="upcoming-tasks">
                <div class="section-header">
                    <h3>📋 Tâches à venir</h3>
                    <a href="#" data-action="view-tasks">Voir tout →</a>
                </div>
                <div class="tasks-list">
                    ${mockData.upcomingTasks.map(task => `
                        <div class="task-item" data-id="${task.id}">
                            <div class="task-priority ${task.priority}"></div>
                            <div class="task-content">
                                <div class="task-title">${task.title}</div>
                                <div class="task-meta">
                                    <span>📅 ${task.due}</span>
                                    <span class="task-assignee">👤 ${task.assignee}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================
    function setupEventListeners() {
        // KPI Card clicks
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = card.dataset.action;
                console.log(`[Dashboard] KPI clicked: ${action}`);
                showToast(`${action} - Module en développement`, 'info');
            });
        });

        // Quick Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                console.log(`[Dashboard] Quick action: ${action}`);
                showToast(`Action: ${action.replace('-', ' ')} - Fonctionnalité à venir`, 'info');
            });
        });

        // Activity item clicks
        document.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', () => {
                showToast(`Détails de l'activité - Module en développement`, 'info');
            });
        });

        // Task item clicks
        document.querySelectorAll('.task-item').forEach(task => {
            task.addEventListener('click', () => {
                showToast(`Détails de la tâche - Module en développement`, 'info');
            });
        });

        // Links
        document.querySelectorAll('[data-action="view-all"], [data-action="view-tasks"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showToast(`Voir tout - Module en développement`, 'info');
            });
        });
    }

    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    function showToast(message, type = 'info') {
        // Check if toast container exists
        let toastContainer = document.querySelector('.dashboard-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'dashboard-toast-container';
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
        toast.className = `dashboard-toast ${type}`;
        toast.style.cssText = `
            background: #111827;
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 12px 20px;
            min-width: 280px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
            font-size: 13px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `;
        
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span style="flex:1">${message}</span>
            <span style="cursor:pointer" onclick="this.parentElement.remove()">✕</span>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 3000);
    }

    // Add animation style if not present
    if (!document.querySelector('#dashboard-animations')) {
        const animStyle = document.createElement('style');
        animStyle.id = 'dashboard-animations';
        animStyle.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(animStyle);
    }

    // ========================================
    // MAIN RENDER FUNCTION
    // ========================================
    function renderDashboard() {
        if (!dashboardContainer) return;
        
        dashboardContainer.innerHTML = `
            ${styles}
            <div class="dashboard-module">
                <div class="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <p>Bienvenue sur Niche CRM — Vue d'ensemble de votre activité</p>
                </div>
                
                ${renderKPICards()}
                
                <div class="dashboard-two-col">
                    <div>
                        ${renderRecentActivities()}
                    </div>
                    <div>
                        ${renderQuickActions()}
                    </div>
                </div>
                
                ${renderUpcomingTasks()}
            </div>
        `;
        
        // Setup event listeners after DOM is rendered
        setupEventListeners();
    }

    // ========================================
    // REFRESH DATA (for real-time updates)
    // ========================================
    function refreshData() {
        // This will be replaced with actual API calls later
        console.log('[Dashboard] Refreshing data...');
        // For demo purposes, we just re-render with mock data
        renderDashboard();
    }

    // ========================================
    // EXPORTED INIT FUNCTION
    // ========================================
    window.initDashboard = function(containerId = 'app-root') {
        console.log('[Dashboard] Initializing...');
        
        // Find or create container
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[Dashboard] Container #${containerId} not found`);
            return;
        }
        
        dashboardContainer = container;
        
        // Clear container and render dashboard
        dashboardContainer.innerHTML = '';
        renderDashboard();
        
        // Optional: Set up auto-refresh every 30 seconds
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(refreshData, 30000);
        
        console.log('[Dashboard] Initialized successfully');
    };

    // Auto-initialize if container exists (for direct page access)
    if (document.getElementById('app-root')) {
        window.initDashboard();
    }
})();
