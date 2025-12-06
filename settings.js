/* ============================================================
   VolcanoChat — SETTINGS OVERLAY UI (Final Fixed Version)
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",

    show() {
        this.open = true;
        this.tab = "profile";
        this.render();
    },

    hide() {
        this.open = false;
        this.render();
    },

    setTab(tab) {
        this.tab = tab;
        this.render();
    },

    render() {
        const overlay = document.getElementById("settings-overlay");
        const container = document.getElementById("settings-container");

        overlay.classList.toggle("hidden", !this.open);

        if (!this.open) {
            container.innerHTML = "";
            return;
        }

        // Main layout restored
        container.innerHTML = "";
        container.className =
            "flex bg-slate-900 text-white p-6 rounded-xl shadow-xl w-[900px] gap-6";

        container.appendChild(this.renderSidebar());
        container.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR (buttons now styled correctly)
    ============================================================ */
    renderSidebar() {
        const sb = document.createElement("div");
        sb.className = "flex flex-col gap-3 w-40";

        const makeBtn = (id, label) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                `px-3 py-2 rounded text-left cursor-pointer transition ${
                    this.tab === id
                        ? "bg-orange-500 text-white"
                        : "bg-slate-800 hover:bg-slate-700"
                }`;
            b.onclick = () => this.setTab(id);
            return b;
        };

        sb.appendChild(makeBtn("profile", "PROFILE"));
        sb.appendChild(makeBtn("theme", "THEME"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            sb.appendChild(makeBtn("admin", "ADMIN"));

        sb.appendChild(makeBtn("about", "ABOUT"));

        // Logout button
        const logout = document.createElement("button");
        logout.textContent = "LOG OUT";
        logout.className =
            "px-3 py-2 rounded bg-red-600 hover:bg-red-700 cursor-pointer mt-4";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
            renderApp();
        };
        sb.appendChild(logout);

        return sb;
    },

    /* ============================================================
       RIGHT PANEL
    ============================================================ */
    renderPanel() {
        const p = document.createElement("div");
        p.className = "flex-1 relative";

        // Close button
        const close = document.createElement("button");
        close.textContent = "❌";
        close.className = "absolute right-0 top-0 text-xl cursor-pointer";
        close.onclick = () => this.hide();
        p.appendChild(close);

        if (this.tab === "profile") p.appendChild(this.renderProfile());
        if (this.tab === "theme") p.appendChild(this.renderTheme());
        if (this.tab === "admin") p.appendChild(this.renderAdmin());
        if (this.tab === "about") p.appendChild(this.renderAbout());

        return p;
    },

    /* ============================================================
       PROFILE TAB (avatar clicking FIXED)
    ============================================================ */
    renderProfile() {
        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        const box = document.createElement("div");

        // Title
        const h = document.createElement("h2");
        h.textContent = "Profile Settings";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        // Avatar grid
        box.appendChild(document.createTextNode("Choose Avatar:"));
        const grid = document.createElement("div");
        grid.className =
            "flex flex-wrap gap-2 text-3xl bg-slate-800 p-3 rounded max-h-40 overflow-y-auto mb-6";

        Logic.avatarList.forEach(av => {
            const btn = document.createElement("button");
            btn.textContent = av;
            btn.className =
                `px-2 py-1 rounded cursor-pointer border ${
                    acc.avatar === av ? "bg-yellow-300 border-yellow-500" : "bg-white border-gray-400"
                } text-black`;

            // FIXED: correct function name
            btn.onclick = () => {
                Logic.Auth.changeAvatar(av);
                renderApp();
                this.render();
            };

            grid.appendChild(btn);
        });

        box.appendChild(grid);

        // Mood input
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Your Mood:";
        box.appendChild(moodLabel);

        const input = document.createElement("input");
        input.value = acc.mood || "";
        input.placeholder = "Enter your mood";
        input.className = "text-black border rounded px-3 py-2 w-64";
        input.oninput = e => {
            Logic.Auth.setMood(e.target.value);
            renderApp();
        };

        box.appendChild(input);
        return box;
    },

    /* ============================================================
       THEME TAB
    ============================================================ */
    renderTheme() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Theme Settings";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeBtn = (id, label) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                `px-4 py-2 rounded cursor-pointer ${
                    UI.theme === id
                        ? "bg-orange-400 text-black"
                        : "bg-orange-200 text-black hover:bg-orange-300"
                }`;
            b.onclick = () => {
                UI.theme = id;
                localStorage.setItem("themeMode", id);
                renderApp();
                this.render();
            };
            return b;
        };

        row.appendChild(makeBtn("A", "Lava Light"));
        row.appendChild(makeBtn("B", "Molten Dark"));
        row.appendChild(makeBtn("C", "Eruption Mix"));

        box.appendChild(row);
        return box;
    },

    /* ============================================================
       ADMIN
    ============================================================ */
    renderAdmin() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Admin Panel";
        h.className = "text-3xl mb-4 text-yellow-300";
        box.appendChild(h);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments (All Communities)";
        btn.className = "bg-red-500 px-6 py-2 rounded text-lg cursor-pointer";
        btn.onclick = () => {
            Storage.comments = {};
            renderApp();
            this.render();
        };
        box.appendChild(btn);

        return box;
    },

    /* ============================================================
       ABOUT
    ============================================================ */
    renderAbout() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "About VolcanoChat";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a tiny Reddit-style lava pit of chaos where you join volcanoes, roast friends, and unleash chaos.";
        p.className = "max-w-md opacity-80";
        box.appendChild(p);

        return box;
    }
};
