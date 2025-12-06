/* ============================================================
   VolcanoChat — FINAL NO-DESELECT SETTINGS UI
   Mood input NEVER rerenders while typing
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",
    tempMood: "",  // local-only mood buffer (NO rerender)

    /* ------------------------------------------------------------
       OPEN SETTINGS
    ------------------------------------------------------------ */
    show() {
        this.open = true;

        // Load current mood into temp buffer
        const user = Logic.Storage.activeUser;
        if (user) {
            const acc = Logic.Storage.accounts[user];
            this.tempMood = acc.mood || "";
        }

        this.render();
    },

    /* ------------------------------------------------------------
       CLOSE SETTINGS  (SAVE MOOD HERE)
    ------------------------------------------------------------ */
    hide() {
        const user = Logic.Storage.activeUser;
        if (user) {
            Logic.Auth.setMood(this.tempMood);  // APPLY CHANGES
        }

        this.open = false;

        // DO NOT RENDER SETTINGS — only render main app
        renderApp();
    },

    setTab(tab) {
        this.tab = tab;
        this.render();
    },

    /* ------------------------------------------------------------
       ROOT RENDER
    ------------------------------------------------------------ */
    render() {
        const overlay = document.getElementById("settings-overlay");
        const container = document.getElementById("settings-container");

        overlay.classList.toggle("hidden", !this.open);
        if (!this.open) return;

        container.innerHTML = "";
        container.className =
            "bg-slate-900 text-white p-6 rounded-xl shadow-xl flex gap-6 max-h-[80vh] overflow-y-auto";

        container.appendChild(this.renderSidebar());
        container.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR
    ============================================================ */
    renderSidebar() {
        const sb = document.createElement("div");
        sb.className = "flex flex-col gap-3 min-w-[140px]";

        const makeBtn = (label, id) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "px-3 py-2 rounded text-left cursor-pointer transition " +
                (this.tab === id
                    ? "bg-slate-700"
                    : "bg-slate-800 hover:bg-slate-700");

            b.onclick = () => {
                this.tab = id;
                this.render(); // OK — switching tabs is allowed
            };
            return b;
        };

        sb.appendChild(makeBtn("PROFILE", "profile"));
        sb.appendChild(makeBtn("THEME", "theme"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            sb.appendChild(makeBtn("ADMIN", "admin"));

        sb.appendChild(makeBtn("ABOUT", "about"));

        // Logout
        const logout = document.createElement("button");
        logout.textContent = "LOG OUT";
        logout.className =
            "px-3 py-2 rounded bg-red-600 hover:bg-red-700 cursor-pointer mt-4";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
        };

        sb.appendChild(logout);
        return sb;
    },

    /* ============================================================
       PANEL SWITCHER
    ============================================================ */
    renderPanel() {
        if (this.tab === "profile") return this.renderProfile();
        if (this.tab === "theme") return this.renderTheme();
        if (this.tab === "admin") return this.renderAdmin();
        return this.renderAbout();
    },

    /* ============================================================
       PROFILE TAB (NO RERENDER WHILE TYPING)
    ============================================================ */
    renderProfile() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "Profile Settings";
        title.className = "text-2xl mb-4 font-bold";
        wrap.appendChild(title);

        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        /* ----------------- Avatar Grid ----------------- */
        const avLabel = document.createElement("p");
        avLabel.textContent = "Choose Avatar:";
        wrap.appendChild(avLabel);

        const grid = document.createElement("div");
        grid.className =
            "grid grid-cols-8 gap-2 bg-slate-800 p-2 rounded max-h-[200px] overflow-y-auto";

        Logic.avatarList.forEach(av => {
            const btn = document.createElement("button");
            btn.textContent = av;
            btn.className =
                "text-2xl p-2 rounded bg-slate-700 hover:bg-slate-600 " +
                (acc.avatar === av ? "ring-2 ring-orange-400" : "");

            btn.onclick = () => {
                Logic.Auth.changeAvatar(av);

                // IMPORTANT:
                // We MUST NOT use renderApp() or render()
                // because it would reset the mood input focus.
                this.render(); // Safe: only redraw settings, not main UI
            };

            grid.appendChild(btn);
        });

        wrap.appendChild(grid);

        /* ----------------- Mood Input ----------------- */
        const moodLabel = document.createElement("p");
        moodLabel.className = "mt-4 mb-1";
        moodLabel.textContent = "Your Mood:";
        wrap.appendChild(moodLabel);

        const moodInput = document.createElement("input");
        moodInput.className = "w-full p-2 rounded bg-slate-800";
        moodInput.placeholder = "Enter your mood";

        // Load temp state (NOT the live account)
        moodInput.value = this.tempMood;

        // Update ONLY the temp buffer (NO rerender!)
        moodInput.oninput = e => {
            this.tempMood = e.target.value;
            // (NO renderApp, NO SettingsUI.render here)
        };

        wrap.appendChild(moodInput);

        return wrap;
    },

    /* ============================================================
       THEME
    ============================================================ */
    renderTheme() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "Theme Settings";
        title.className = "text-2xl mb-4 font-bold";
        wrap.appendChild(title);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const mk = (label, id) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "px-4 py-2 rounded bg-orange-300 text-black hover:bg-orange-400";
            b.onclick = () => {
                localStorage.setItem("themeMode", id);
                location.reload();
            };
            return b;
        };

        row.appendChild(mk("Lava Light", "A"));
        row.appendChild(mk("Molten Dark", "B"));
        row.appendChild(mk("Eruption Mix", "C"));

        wrap.appendChild(row);
        return wrap;
    },

    /* ============================================================
       ABOUT
    ============================================================ */
    renderAbout() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "About VolcanoChat";
        title.className = "text-2xl mb-4 font-bold";
        wrap.appendChild(title);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a chaotic experimental social playground written entirely in vanilla JS.";
        wrap.appendChild(p);

        return wrap;
    },

    /* ============================================================
       CLOSE BUTTON
    ============================================================ */
    renderCloseBtn() {
        const b = document.createElement("button");
        b.textContent = "✖";
        b.className =
            "absolute top-2 right-2 text-3xl text-orange-500 hover:text-orange-300 cursor-pointer";

        b.onclick = () => this.hide();

        return b;
    }
};
