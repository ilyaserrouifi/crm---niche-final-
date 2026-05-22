// /modules/people.js

(function () {
    'use strict';

    let peopleContainer = null;
    let searchTerm = '';

    // initial data (later will come from store / API)
    const peopleData = [
        { id: 1, name: "Jean Dupont", company: "TechCorp", email: "jean@techcorp.com", phone: "+33 612345678", role: "Client", status: "active" },
        { id: 2, name: "Sara El Amrani", company: "GreenOps", email: "sara@greenops.com", phone: "+212 612345678", role: "Client", status: "active" },
        { id: 3, name: "Omar Benali", company: "BlueSoft", email: "omar@bluesoft.io", phone: "+212 623456789", role: "Client", status: "pending" },
        { id: 4, name: "Lina Kabbaj", company: "NexFlow", email: "lina@nexflow.com", phone: "+212 634567890", role: "Client", status: "inactive" }
    ];

    function filteredData() {
        if (!searchTerm) return peopleData;

        return peopleData.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    function getStatusColor(status) {
        switch (status) {
            case "active": return "#10b981";
            case "pending": return "#f59e0b";
            case "inactive": return "#ef4444";
            default: return "#64748b";
        }
    }

    function render() {
        if (!peopleContainer) return;

        const data = filteredData();

        peopleContainer.innerHTML = `
            <div style="padding:24px; color:#fff;">

                <h1 style="margin-bottom:16px;">People / Clients</h1>

                <input 
                    id="searchPeople"
                    placeholder="Search people..."
                    style="
                        padding:10px 14px;
                        width:100%;
                        max-width:400px;
                        margin-bottom:20px;
                        border-radius:10px;
                        border:1px solid #1e293b;
                        background:#111827;
                        color:#fff;
                        outline:none;
                    "
                />

                <div style="display:grid; gap:12px;">
                    ${data.map(person => `
                        <div style="
                            padding:16px;
                            border:1px solid #1e293b;
                            border-radius:12px;
                            background:#111827;
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                        ">
                            <div>
                                <div style="font-weight:600;">${person.name}</div>
                                <div style="font-size:12px;color:#94a3b8;">
                                    ${person.company} • ${person.email}
                                </div>
                            </div>

                            <div style="text-align:right;">
                                <div style="
                                    font-size:12px;
                                    color:${getStatusColor(person.status)};
                                    font-weight:600;
                                ">
                                    ${person.status.toUpperCase()}
                                </div>
                                <div style="font-size:11px;color:#64748b;">
                                    ${person.phone}
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>

            </div>
        `;

        document.getElementById("searchPeople").addEventListener("input", (e) => {
            searchTerm = e.target.value;
            render();
        });
    }

    window.initPeople = function (containerId = "app-root") {
        peopleContainer = document.getElementById(containerId);

        if (!peopleContainer) {
            console.error("[People] Container not found");
            return;
        }

        peopleContainer.innerHTML = "";
        render();

        console.log("[People] Module loaded ✔");
    };

})();
