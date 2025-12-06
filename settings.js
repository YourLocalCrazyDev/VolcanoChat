/* ============================================================
   VolcanoChat — FIXED & POLISHED SETTINGS UI
   Save-on-exit mood editor (no deselect bug)
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",
    tempMood: "", // stores mood while typing (no rerender)

    /* ------------------------------------------------------------
       OPEN / CLOSE
    ------------------------------------------------------------ */
    show() {
        this.open = true;

        // Load current user mood into temp storage
        const user = Logic.Storage.activeUser;
        if (user) {
            const acc = Logic.Storage.accounts[user];
            this.tempMood = acc.mood || "";
        }

        this.render();
    },

    hide() {
        // SAVE MOOD ONLY ON EXIT
        const user = Logic.Storage.activeUser;
        if (user) {
            Logic.Auth.setMood(this.tempMood);
        }

        this.open = false;
        renderApp(); // redraw entire UI
    },

    setTab(tab) {
        this.tab = tab;
        this.render();
    },

    /* ------------------------------------------------------------
       RENDER ROOT OVERLAY
    ------------------------------------------------------------ */
    render() {
        const overlay = document.getElementById("settings-overlay");
        const box = document.getElementById("settings-container");

        overlay.classList.toggle("hidden", !this.open);
        if (!this.open) return;

        box.innerHTML = "";
        box.className =
            "bg-slate-900 text-white p-6 rounded-xl shadow-xl flex gap-8 max-h-[80vh] overflow-y-auto";

        box.appendChild(this.renderSidebar());
        box.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR
    ============================================================ */
    renderSidebar() {
        const wrap = document.createElement("div");
        wrap.className = "flex flex-col gap-3 min-w-[120px]";

        const makeBtn = (name, tab) => {
            const b = document.createElement("button");
            b.textContent = name;
            b.className =
                "text-left px-2 py-1 rounded hover:bg-slate-800 cursor-pointer " +
                (this.tab === tab ? "bg-slate-700 font-bold" : "");
            b.onclick = () => this.setTab(tab);
            return b;
        };

        wrap.appendChild(makeBtn("PROFILE", "profile"));
        wrap.appendChild(makeBtn("THEME", "theme"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            wrap.appendChild(makeBtn("ADMIN", "admin"));

        wrap.appendChild(makeBtn("ABOUT", "about"));

        const logout = document.createElement("button");
        logout.textContent = "LOG OUT";
        logout.className =
            "text-left px-2 py-1 rounded hover:bg-red-800 text-red-400 cursor-pointer mt-4";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
        };
        wrap.appendChild(logout);

        return wrap;
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
       PROFILE TAB — FIXED MOOD INPUT
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

        /* -------- Avatar Grid -------- */
        const avLabel = document.createElement("p");
        avLabel.textContent = "Choose Avatar:";
        avLabel.className = "mb-1";
        wrap.appendChild(avLabel);

        const grid = document.createElement("div");
        grid.className =
            "grid grid-cols-8 gap-2 p-2 bg-slate-800 rounded max-h-[200px] overflow-y-auto";

        Logic.avatarList.forEach(av => {
            const b = document.createElement("button");
            b.textContent = av;
            b.className =
                "text-2xl p-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer " +
                (acc.avatar === av ? "ring-2 ring-orange-400" : "");

            b.onclick = () => {
                Logic.Auth.changeAvatar(av);
                this.render(); // re-render only settings menu
            };

            grid.appendChild(b);
        });

        wrap.appendChild(grid);

        /* -------- Mood Input (no rerender!) -------- */
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Your Mood:";
        moodLabel.className = "mt-4 mb-1";
        wrap.appendChild(moodLabel);

        const mood = document.createElement("input");
        mood.className = "w-full p-2 rounded bg-slate-800";
        mood.placeholder = "Enter your mood";

        // load from temp storage
        mood.value = this.tempMood;

        // update only the temp variable
        mood.oninput = e => {
            this.tempMood = e.target.value;
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
        title.className = "text-2xl font-bold mb-4";
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
       ADMIN TAB
    ============================================================ */
    renderAdmin() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "Admin Panel";
        title.className = "text-2xl font-bold mb-4 text-yellow-300";
        wrap.appendChild(title);

        const btn = document.createElement("button");
        btn.textContent = "Clear ALL Comments (every community)";
        btn.className =
            "bg-red-600 px-6 py-2 rounded text-lg cursor-pointer hover:bg-red-700";
        btn.onclick = () => {
            Storage.comments = {};
            renderApp();
            this.render();
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
        title.className = "text-2xl font-bold mb-4";
        wrap.appendChild(title);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a chaotic experimental social playground made entirely in vanilla JavaScript.";
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
