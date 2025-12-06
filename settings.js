/* ============================================================
   VolcanoChat — SETTINGS OVERLAY UI (Display Name Edition)
   Handles:
   - Avatar selection
   - Mood input
   - Display Name editing (NEW)
   - Theme tab
   - Admin tab
   - About tab
   - Logout
============================================================ */

/* ------------------------------------------------------------
   IMPORTANT:
   Use global Logic — do NOT redeclare it.
------------------------------------------------------------ */
Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",   // profile | theme | admin | about

    /* ------------------------------------------------------------
       PUBLIC SHOW/HIDE
    ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       RENDER ENTRY POINT
    ------------------------------------------------------------ */
    render() {
        const o = document.getElementById("settings-overlay");
        const c = document.getElementById("settings-container");

        o.classList.toggle("hidden", !this.open);

        if (!this.open) {
            c.innerHTML = "";
            return;
        }

        c.innerHTML = "";
        c.className = "flex";

        c.appendChild(this.renderSidebar());
        c.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR (left column)
    ============================================================= */
    renderSidebar() {
        const sb = document.createElement("div");
        sb.className = "settingsSidebar text-white";

        const makeBtn = (id, label) => {
            const b = document.createElement("div");
            b.textContent = label;
            b.className =
                "settingsTabButton " + (this.tab === id ? "active" : "");
            b.onclick = () => this.setTab(id);
            return b;
        };

        sb.appendChild(makeBtn("profile", "PROFILE"));
        sb.appendChild(makeBtn("theme", "THEME"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            sb.appendChild(makeBtn("admin", "ADMIN"));

        sb.appendChild(makeBtn("about", "ABOUT"));

        // logout
        const logout = document.createElement("div");
        logout.textContent = "LOG OUT";
        logout.className = "settingsTabButton";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
            renderApp();
        };
        sb.appendChild(logout);

        return sb;
    },

    /* ============================================================
       RIGHT PANEL HANDLER
    ============================================================= */
    renderPanel() {
        const panel = document.createElement("div");
        panel.className = "settingsPanel text-white relative";

        const close = document.createElement("span");
        close.textContent = "❌";
        close.className = "closeButton";
        close.onclick = () => this.hide();
        panel.appendChild(close);

        if (this.tab === "profile") panel.appendChild(this.renderProfile());
        if (this.tab === "theme") panel.appendChild(this.renderTheme());
        if (this.tab === "admin") panel.appendChild(this.renderAdmin());
        if (this.tab === "about") panel.appendChild(this.renderAbout());

        return panel;
    },

    /* ============================================================
       PROFILE TAB — Updated with Display Name field
    ============================================================= */
    renderProfile() {
        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Profile Settings";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        /* ---- DISPLAY NAME ---- */
        const dnLabel = document.createElement("p");
        dnLabel.textContent = "Display Name:";
        dnLabel.className = "mb-1";
        box.appendChild(dnLabel);

        const dnInput = document.createElement("input");
        dnInput.value = acc.displayName || user;
        dnInput.placeholder = "Display Name";
        dnInput.className = "text-black border rounded px-3 py-2 w-64 mb-4";
        dnInput.oninput = e => {
            Logic.Auth.changeDisplayName(e.target.value.trim());
            renderApp();
            this.render(); // update live
        };
        box.appendChild(dnInput);

        /* ---- AVATAR ---- */
        box.appendChild(document.createTextNode("Choose Avatar:"));
        const avBox = document.createElement("div");
        avBox.className =
            "flex flex-wrap gap-2 text-3xl justify-center mb-6 max-h-40 overflow-y-auto";

        Logic.avatarList.forEach(av => {
            const btn = document.createElement("button");
            btn.textContent = av;
            btn.className =
                `px-2 py-1 rounded ${acc.avatar === av ? "bg-yellow-300" : "bg-white text-black"}`;
            btn.onclick = () => {
                Logic.Auth.changeAvatar(av);
                renderApp();
                this.render();
            };
            avBox.appendChild(btn);
        });

        box.appendChild(avBox);

        /* ---- MOOD ---- */
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Mood:";
        moodLabel.className = "mb-1";
        box.appendChild(moodLabel);

        const moodInput = document.createElement("input");
        moodInput.value = acc.mood || "";
        moodInput.placeholder = "Enter your mood";
        moodInput.className = "text-black border rounded px-3 py-2 w-64";
        moodInput.oninput = e => {
            Logic.Auth.setMood(e.target.value);
            renderApp();
        };
        box.appendChild(moodInput);

        return box;
    },

    /* ============================================================
       THEME TAB
    ============================================================= */
    renderTheme() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Theme Settings";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent = "Choose your lava style.";
        p.className = "mb-2 text-sm";
        box.appendChild(p);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeBtn = (id, label) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                `px-4 py-2 rounded ${UI.theme === id ? "bg-orange-400" : "bg-orange-200 text-black"}`;
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
       ADMIN TAB
    ============================================================= */
    renderAdmin() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Admin Panel";
        h.className = "text-3xl mb-4 text-yellow-300";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent = "Moderation & lava control.";
        p.className = "mb-2 text-sm";
        box.appendChild(p);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments";
        btn.className = "bg-red-500 px-6 py-2 rounded text-lg";
        btn.onclick = () => {
            Logic.Storage.comments = {};
            renderApp();
            this.render();
        };
        box.appendChild(btn);

        return box;
    },

    /* ============================================================
       ABOUT TAB
    ============================================================= */
    renderAbout() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "About VolcanoChat";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a chaotic, lava-powered discussion pit. Join volcanoes, roast friends, post comments, and cause eruptions.";
        p.className = "max-w-md mx-auto text-center";
        box.appendChild(p);

        return box;
    }
};
