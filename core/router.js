// /core/router.js

(function() {
    'use strict';

    // ========================================
    // ROUTER CONFIGURATION
    // ========================================
    
    const routes = {
        'dashboard': {
            path: '/dashboard',
            hash: '#dashboard',
            title: 'Tableau de bord',
            init: 'initDashboard',
            moduleFile: 'modules/dashboard.js'
        },
        'clients': {
            path: '/clients',
            hash: '#clients',
            title: 'Clients',
            init: 'initClients',
            moduleFile: 'modules/clients.js'
        }
    };

    // Router state
    let currentRoute = null;
    let isLoading = false;
    let loadedModules = {};

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function getCurrentHash() {
        let hash = window.location.hash.slice(1) || '/dashboard';
        if (hash.startsWith('/')) {
            hash = hash.substring(1);
        }
        return hash || 'dashboard';
    }

    function getRouteByHash(hash) {
        if (routes[hash]) {
            return { key: hash, config: routes[hash] };
        }
        // Default to dashboard
        return { key: 'dashboard', config: routes['dashboard'] };
    }

    function updateActiveNav() {
        const currentHash = getCurrentHash();
        
        document.querySelectorAll('.nav-item').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentHash}` || (currentHash === 'dashboard' && href === '#/dashboard')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function updatePageTitle(title) {
        document.title = `${title} — Niche CRM`;
    }

    // ========================================
    // MODULE LOADER
    // ========================================
    
    function loadModule(moduleName, initFunctionName) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (loadedModules[moduleName]) {
                console.log(`[Router] Module ${moduleName} already loaded`);
                resolve(window[initFunctionName]);
                return;
            }
            
            const route = routes[moduleName];
            if (!route || !route.moduleFile) {
                reject(new Error(`Module ${moduleName} not found`));
                return;
            }
            
            // Check if script already exists
            const existingScript = document.querySelector(`script[data-module="${moduleName}"]`);
            if (existingScript) {
                loadedModules[moduleName] = true;
                resolve(window[initFunctionName]);
                return;
            }
            
            console.log(`[Router] Loading module: ${moduleName} from ${route.moduleFile}`);
            
            const script = document.createElement('script');
            script.src = route.moduleFile;
            script.dataset.module = moduleName;
            script.onload = () => {
                loadedModules[moduleName] = true;
                console.log(`[Router] Module ${moduleName} loaded successfully`);
                resolve(window[initFunctionName]);
            };
            script.onerror = () => {
                console.error(`[Router] Failed to load module: ${moduleName}`);
                reject(new Error(`Failed to load ${route.moduleFile}`));
            };
            
            document.head.appendChild(script);
        });
    }

    // ========================================
    // ROUTE HANDLER
    // ========================================
    
    async function handleRoute() {
        if (isLoading) {
            console.log('[Router] Already loading a route, skipping...');
            return;
        }
        
        const hash = getCurrentHash();
        const { key: routeKey, config: routeConfig } = getRouteByHash(hash);
        
        // Skip if same route
        if (currentRoute === routeKey && !isLoading) {
            console.log(`[Router] Already on ${routeKey}, skipping...`);
            return;
        }
        
        console.log(`[Router] Navigating to: ${routeKey}`);
        isLoading = true;
        
        // Update active navigation
        updateActiveNav();
        
        // Update page title
        updatePageTitle(routeConfig.title);
        
        // Get app-root container
        const appRoot = document.getElementById('app-root');
        if (!appRoot) {
            console.error('[Router] #app-root container not found');
            isLoading = false;
            return;
        }
        
        // Show loading indicator
        appRoot.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 400px;">
                <div class="spinner"></div>
            </div>
        `;
        
        // Add spinner style if not present
        if (!document.querySelector('#router-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'router-spinner-style';
            style.textContent = `
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #1e293b;
                    border-top-color: #38bdf8;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        try {
            // Load module
            const initFunction = await loadModule(routeKey, routeConfig.init);
            
            // Call module initializer
            if (typeof window[initFunction] === 'function') {
                window[initFunction]('app-root');
            } else {
                console.error(`[Router] ${initFunction} is not a function`);
                appRoot.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Erreur de chargement</div>
                        <div style="color: #64748b;">Module ${routeKey} non trouvé</div>
                    </div>
                `;
            }
            
            currentRoute = routeKey;
        } catch (error) {
            console.error('[Router] Error:', error);
            appRoot.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Erreur de chargement</div>
                    <div style="color: #64748b;">Impossible de charger le module ${routeKey}</div>
                </div>
            `;
        } finally {
            isLoading = false;
        }
    }

    // ========================================
    // NAVIGATION SETUP
    // ========================================
    
    function setupNavigation() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            console.log('[Router] Hash changed');
            handleRoute();
        });
        
        // Handle initial load
        if (window.location.hash === '') {
            window.location.hash = '#dashboard';
        } else {
            handleRoute();
        }
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            console.log('[Router] Popstate event');
            handleRoute();
        });
    }

    // ========================================
    // PUBLIC API
    // ========================================
    
    function navigateTo(routeName) {
        const route = routes[routeName];
        if (route) {
            window.location.hash = route.hash;
        } else {
            console.warn(`[Router] Unknown route: ${routeName}`);
        }
    }
    
    function getCurrentRouteName() {
        return currentRoute;
    }
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    function initRouter() {
        console.log('[Router] Initializing...');
        
        // Setup navigation
        setupNavigation();
        
        // Expose public API
        window.router = {
            navigate: navigateTo,
            getCurrentRoute: getCurrentRouteName
        };
        
        console.log('[Router] Ready');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRouter);
    } else {
        initRouter();
    }
})();
