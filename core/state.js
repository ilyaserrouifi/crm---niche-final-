// /core/state.js

(function () {
    'use strict';

    console.log('[State] Global store initializing...');

    const state = {
        user: null,
        clients: [],
        dashboard: {
            revenue: 0,
            clientsCount: 0,
            projectsCount: 0
        },
        ui: {
            loading: false
        }
    };

    const listeners = {};

    function get(path) {
        return path.split('.').reduce((acc, key) => {
            return acc ? acc[key] : undefined;
        }, state);
    }

    function set(path, value) {
        const keys = path.split('.');
        let obj = state;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }

        obj[keys[keys.length - 1]] = value;

        emit(path, value);
    }

    function subscribe(path, callback) {
        if (!listeners[path]) {
            listeners[path] = [];
        }
        listeners[path].push(callback);
    }

    function emit(path, value) {
        if (listeners[path]) {
            listeners[path].forEach(cb => cb(value));
        }
    }

    function getState() {
        return state;
    }

    window.store = {
        get,
        set,
        subscribe,
        getState
    };

    console.log('[State] Ready ✔');

})();
