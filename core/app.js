// /app.js

(function () {
    'use strict';

    console.log('[App] Starting CRM Application...');

    function boot() {
        console.log('[App] Booting...');

        // Ensure router exists
        if (window.initRouter && typeof window.initRouter === 'function') {
            window.initRouter();
        } else {
            console.error('[App] Router not found. Make sure router.js is loaded.');
        }

        console.log('[App] Ready ✔');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
