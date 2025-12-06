/* ============================================================
   VolcanoChat — SETTINGS UI (Modern Volcano Theme)
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

    /* ------------------------------------------------------------
       RENDER ENTRY
    ------------------------------------------------------------ */
    render() {
        const overlay = document.getElementById("settings-overlay");
        const container = document.getElementById("settings-container");

        overlay.classList.toggle("hidden", !this.open);

        if (!this.open) {
            container.innerHTML = "";
            return;
        }

        // Clean + centered card
        container.innerHTML = "";
        container.className =
            "bg-slate-800 text-white shadow-2xl rounded-xl p-6 flex gap-6 w-[700px] max-h-[85vh] overflow-y-auto";

        container.appendChild(this.renderSidebar());
        container.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR
    ============================================================ */
    renderSidebar() {
        const sb = document.createElement("div");
        sb.className =
            "w-40 flex flex-col gap-3 text-sm font-semibold";

        const makeTab = (id, label) => {
            const b = document.createElement("button");
            b.textContent = label;

            b.className =
                "px-3 py-2 rounded text-left transition " +
                (this.tab === id
                    ? "bg-orange-500"
                    : "hover:bg-slate-700 bg-slate-900");

            b.onclick = () => this.setTab(id);
            return b;
        };

        sb.appendChild(makeTab("profile", "PROFILE"));
        sb.appendChild(makeTab("theme", "THEME"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            sb.appendChild(makeTab("admin", "ADMIN"));

        sb.appendChild(makeTab("about", "ABOUT"));

        const logout = document.createElement("button");
        logout.textContent = "LOG OUT";
        logout.className =
            "mt-4 px-3 py-2 rounded bg-red-600 hover:bg-red-700";
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

        const close = document.createElement("button");
        close.textContent = "✕";
        close.className =
            "absolute right-0 top-0 text-xl hover:text-red-400";
        close.onclick = () => this.hide();
        p.appendChild(close);

        if (this.tab === "profile") p.appendChild(this.renderProfile());
        if (this.tab === "theme") p.appendChild(this.renderTheme());
        if (this.tab === "admin") p.appendChild(this.renderAdmin());
        if (this.tab === "about") p.appendChild(this.renderAbout());

        return p;
    },

    /* ============================================================
       PROFILE TAB
    ============================================================ */
    renderProfile() {
        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Profile Settings";
        h.className = "text-3xl font-bold mb-4";
        box.appendChild(h);

        // Avatar grid
        const label = document.createElement("p");
        label.textContent = "Choose Avatar:";
        label.className = "mb-2 text-sm";
        box.appendChild(label);

        const grid = document.createElement("div");
        grid.className =
            "grid grid-cols-8 gap-2 bg-slate-900 p-3 rounded max-h-40 overflow-y-auto text-3xl";

        Logic.avatarList.forEach(av => {
            const btn = document.createElement("button");
            btn.textContent = av;

            btn.className =
                `rounded p-1 transition ${
                    acc.avatar === av
                        ? "bg-yellow-400"
                        : "bg-white text-black hover:bg-yellow-200"
                }`;

            btn.onclick = () => {
                Logic.Auth.changeAvatar(av);
                renderApp();
                this.render();
            };

            grid.appendChild(btn);
        });

        box.appendChild(grid);

        // Mood box
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Your Mood:";
        moodLabel.className = "mt-4 mb-1 text-sm";
        box.appendChild(moodLabel);

        const moodInput = document.createElement("input");
        moodInput.value = acc.mood || "";
        moodInput.placeholder = "Enter your mood";
        moodInput.className =
            "w-64 px-3 py-2 rounded text-black border";
        moodInput.oninput = e => {
            Logic.Auth.setMood(e.target.value);
            renderApp();
        };

        box.appendChild(moodInput);
        return box;
    },

    /* ============================================================
       THEME TAB
    ============================================================ */
    renderTheme() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Theme Settings";
        h.className = "text-3xl mb-4 font-bold";
        box.appendChild(h);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeBtn = (id, text) => {
            const b = document.createElement("button");
            b.textContent = text;

            b.className =
                `px-4 py-2 rounded transition ${
                    UI.theme === id
                        ? "bg-orange-500"
                        : "bg-orange-300 hover:bg-orange-400 text-black"
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
    ============================================================ */
    renderAdmin() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "Admin Panel";
        h.className = "text-3xl mb-4 font-bold text-yellow-300";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent = "Moderate the chaos. Manage reports & users.";
        p.className = "mb-4 text-sm";
        box.appendChild(p);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments";
        btn.className =
            "px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-lg";
        btn.onclick = () => {
            Storage.comments = {};
            Storage.save();
            renderApp();
            this.render();
        };

        box.appendChild(btn);
        return box;
    },

    /* ============================================================
       ABOUT TAB
    ============================================================ */
    renderAbout() {
        const box = document.createElement("div");

        const h = document.createElement("h2");
        h.textContent = "About VolcanoChat";
        h.className = "text-3xl mb-4 font-bold";
        box.appendChild(h);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a chaotic Reddit-style lava pit. Post, roast, report, and survive the magma.";
        p.className = "opacity-80 max-w-md";
        box.appendChild(p);

        return box;
    }
};
