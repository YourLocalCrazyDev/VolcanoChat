/* ============================================================
   VolcanoChat — SETTINGS UI (Stable, Avatar + Mood Working)
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",

    // local buffer for mood so we don't rerender on every keystroke
    tempMood: "",

    /* ------------------------------------------------------------
       OPEN SETTINGS
    ------------------------------------------------------------ */
    show() {
        this.open = true;

        const user = Logic.Storage.activeUser;
        if (user) {
            const acc = Logic.Storage.accounts[user];
            this.tempMood = acc.mood || "";
        } else {
            this.tempMood = "";
        }

        this.render();
    },

    /* ------------------------------------------------------------
       CLOSE SETTINGS (SAVE MOOD WHEN CLOSING)
    ------------------------------------------------------------ */
    hide() {
        const user = Logic.Storage.activeUser;
        if (user) {
            // apply whatever is in tempMood to the account
            Logic.Auth.setMood(this.tempMood);
        }

        this.open = false;
        renderApp(); // refresh main UI; SettingsUI.render() will hide overlay
    },

    /* ------------------------------------------------------------
       CHANGE TAB
    ------------------------------------------------------------ */
    setTab(tab) {
        this.tab = tab;
        this.render();
    },

    /* ------------------------------------------------------------
       FULL RENDER OF OVERLAY
    ------------------------------------------------------------ */
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
            "bg-slate-900 text-white p-6 rounded-xl shadow-xl flex gap-6 max-h-[80vh] overflow-y-auto";

        container.appendChild(this.renderSidebar());
        container.appendChild(this.renderPanel());
    },

    /* ------------------------------------------------------------
       PANEL-ONLY RERENDER (used after avatar change)
    ------------------------------------------------------------ */
    rerenderPanel() {
        const container = document.getElementById("settings-container");
        // children[0] = sidebar, children[1] = panel
        if (container.children.length > 1) {
            container.removeChild(container.children[1]);
        }
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
            b.onclick = () => this.setTab(id);
            return b;
        };

        sb.appendChild(makeBtn("PROFILE", "profile"));
        sb.appendChild(makeBtn("THEME", "theme"));

        if (Logic.Storage.activeUser === Logic.ADMIN) {
            sb.appendChild(makeBtn("ADMIN", "admin"));
        }

        sb.appendChild(makeBtn("ABOUT", "about"));

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
       PROFILE TAB
       - Avatar click: updates account + UI
       - Mood: uses temp buffer, no rerender, saved on close
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

        /* ---- Avatar Grid ---- */
        const avLabel = document.createElement("p");
        avLabel.textContent = "Choose Avatar:";
        avLabel.className = "mb-1";
        wrap.appendChild(avLabel);

        const grid = document.createElement("div");
        grid.className =
            "grid grid-cols-8 gap-2 bg-slate-800 p-2 rounded max-h-[200px] overflow-y-auto";

        Logic.avatarList.forEach(av => {
            const btn = document.createElement("button");
            btn.textContent = av;
            btn.className =
                "text-2xl p-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer " +
                (acc.avatar === av ? "ring-2 ring-orange-400" : "");

            btn.onclick = () => {
                // update account avatar
                Logic.Auth.changeAvatar(av);

                // update main UI avatar (greeting, comments, etc.)
                renderApp();

                // redraw only the right panel so ring highlight updates
                this.rerenderPanel();
            };

            grid.appendChild(btn);
        });

        wrap.appendChild(grid);

        /* ---- Mood Input ---- */
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Your Mood:";
        moodLabel.className = "mt-4 mb-1";
        wrap.appendChild(moodLabel);

        const mood = document.createElement("input");
        mood.className = "w-full p-2 rounded bg-slate-800";
        mood.placeholder = "Enter your mood";

        // use local buffer (no DOM rebuild)
        mood.value = this.tempMood;
        mood.oninput = e => {
            this.tempMood = e.target.value; // just update buffer
        };

        wrap.appendChild(mood);

        return wrap;
    },

    /* ============================================================
       THEME TAB
    ============================================================ */
    renderTheme() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "Theme Settings";
        title.className = "text-2xl mb-4 font-bold";
        wrap.appendChild(title);

        const sub = document.createElement("p");
        sub.textContent = "Choose your lava style.";
        sub.className = "mb-3";
        wrap.appendChild(sub);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeThemeBtn = (label, id) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "px-4 py-2 rounded bg-orange-300 text-black hover:bg-orange-400 cursor-pointer";
            b.onclick = () => {
                localStorage.setItem("themeMode", id);
                location.reload();
            };
            return b;
        };

        row.appendChild(makeThemeBtn("Lava Light", "A"));
        row.appendChild(makeThemeBtn("Molten Dark", "B"));
        row.appendChild(makeThemeBtn("Eruption Mix", "C"));

        wrap.appendChild(row);
        return wrap;
    },

    /* ============================================================
       ADMIN TAB
    ============================================================ */
    renderAdmin() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "Admin Panel";
        title.className = "text-2xl mb-4 text-yellow-300 font-bold";
        wrap.appendChild(title);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments (All Communities)";
        btn.className =
            "bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-lg cursor-pointer";
        btn.onclick = () => {
            Storage.comments = {};
            renderApp();
            this.rerenderPanel();
        };

        wrap.appendChild(btn);
        return wrap;
    },

    /* ============================================================
       ABOUT TAB
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
            "VolcanoChat is a tiny chaotic lava pit social experiment built entirely in vanilla JS.";
        wrap.appendChild(p);

        return wrap;
    },

    /* ============================================================
       CLOSE BUTTON (top-right)
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
