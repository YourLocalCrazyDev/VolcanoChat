/* ============================================================
   VolcanoChat — SETTINGS OVERLAY UI
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

        container.innerHTML = "";
        container.className =
            "flex bg-slate-900 text-white p-6 rounded-xl shadow-xl max-h-[80vh] overflow-y-auto";

        container.appendChild(this.renderSidebar());
        container.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR
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
       RIGHT PANEL
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
       PROFILE TAB
    ============================================================= */
    renderProfile() {
        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Profile Settings";
        h.className = "text-3xl mb-4";
        box.appendChild(h);

        // avatar
        const avLabel = document.createElement("p");
        avLabel.textContent = "Choose Avatar:";
        box.appendChild(avLabel);

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

        // mood
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Mood:";
        moodLabel.className = "mb-1";
        box.appendChild(moodLabel);

        const mood = document.createElement("input");
        mood.value = acc.mood || "";
        mood.placeholder = "Type your mood";
        mood.className = "text-black border rounded px-3 py-2 w-64";
        mood.oninput = e => {
            Logic.Auth.setMood(e.target.value);
            renderApp();
        };
        box.appendChild(mood);

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

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeBtn = (id, label) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                `px-4 py-2 rounded ${
                    UI.theme === id ? "bg-orange-400" : "bg-orange-200 text-black"
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
       ADMIN TAB
    ============================================================= */
    renderAdmin() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Admin Panel";
        h.className = "text-3xl mb-4 text-yellow-300";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent = "Moderation tools.";
        p.className = "mb-2 text-sm";
        box.appendChild(p);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments";
        btn.className = "bg-red-500 px-6 py-2 rounded text-lg";
        btn.onclick = () => {
            Logic.Mod.clearAllComments();
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
            "VolcanoChat is a chaotic lava-powered comment pit. No data is saved. Enjoy the eruption.";
        p.className = "max-w-md mx-auto text-center";
        box.appendChild(p);

        return box;
    }
};
