/* ============================================================
   VolcanoChat — UPGRADED SETTINGS UI (FINAL VERSION)
   Includes:
   - Mood autosave
   - Toast notification
   - Avatar picker
   - Theme selector
   - Admin panel
   - No reload, no input reset
============================================================ */

Logic = window.VolcanoLogic;

/* ============================================================
   GLOBAL TOAST FUNCTION
============================================================ */
window.showToast = (msg) => {
    let box = document.getElementById("toast-box");
    if (!box) {
        box = document.createElement("div");
        box.id = "toast-box";
        document.body.appendChild(box);
    }

    box.textContent = msg;
    box.style.display = "flex";

    box.className =
        "fixed bottom-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white " +
        "px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 z-[99999]";

    requestAnimationFrame(() => {
        box.classList.add("opacity-100");
    });

    setTimeout(() => {
        box.classList.remove("opacity-100");
        setTimeout(() => (box.style.display = "none"), 300);
    }, 1200);
};


/* ============================================================
   SETTINGS UI MODULE
============================================================ */
window.SettingsUI = {
    open: false,
    tab: "profile",
    _toastShown: false,

    show() {
        this.open = true;
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

    /* ============================================================
       MAIN RENDERER
    ============================================================ */
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

        const makeBtn = (label, id) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "text-left px-3 py-2 rounded hover:bg-slate-800 cursor-pointer transition " +
                (this.tab === id ? "bg-slate-700 font-bold" : "");
            b.onclick = () => this.setTab(id);
            return b;
        };

        wrap.appendChild(makeBtn("PROFILE", "profile"));
        wrap.appendChild(makeBtn("THEME", "theme"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            wrap.appendChild(makeBtn("ADMIN", "admin"));

        wrap.appendChild(makeBtn("ABOUT", "about"));

        /* LOGOUT BUTTON — FIXED (NO PAGE RELOAD) */
        const logout = document.createElement("button");
        logout.textContent = "LOG OUT";
        logout.className =
            "text-left px-3 py-2 rounded bg-red-700 hover:bg-red-600 cursor-pointer mt-4";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
            renderApp();
        };
        wrap.appendChild(logout);

        return wrap;
    },

    /* ============================================================
       PANEL SELECTOR
    ============================================================ */
    renderPanel() {
        const p = document.createElement("div");
        p.className = "flex-1 relative";

        p.appendChild(this.renderClose());

        if (this.tab === "profile") p.appendChild(this.renderProfile());
        if (this.tab === "theme") p.appendChild(this.renderTheme());
        if (this.tab === "admin") p.appendChild(this.renderAdmin());
        if (this.tab === "about") p.appendChild(this.renderAbout());

        return p;
    },

    /* ============================================================
       CLOSE BUTTON
    ============================================================ */
    renderClose() {
        const b = document.createElement("button");
        b.textContent = "✖";
        b.className =
            "absolute right-0 top-0 text-3xl text-orange-500 hover:text-orange-300 cursor-pointer";
        b.onclick = () => this.hide();
        return b;
    },

    /* ============================================================
       PROFILE TAB
    ============================================================ */
    renderProfile() {
        const wrap = document.createElement("div");

        const title = document.createElement("h2");
        title.textContent = "Profile Settings";
        title.className = "text-3xl mb-4 font-bold";
        wrap.appendChild(title);

        const username = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[username];

        /* Avatar Picker */
        wrap.appendChild(document.createTextNode("Choose Avatar:"));
        const grid = document.createElement("div");
        grid.className =
            "grid grid-cols-8 gap-2 p-2 bg-slate-800 rounded max-h-[200px] overflow-y-auto mb-4";

        Logic.avatarList.forEach(av => {
            const b = document.createElement("button");
            b.textContent = av;
            b.className =
                "text-2xl p-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer " +
                (acc.avatar === av ? "ring-2 ring-orange-400" : "");

            b.onclick = () => {
                Logic.Auth.changeAvatar(av);
                renderApp();
                this.render();
            };

            grid.appendChild(b);
        });

        wrap.appendChild(grid);

        /* Mood Input (UPGRADED) */
        const moodLbl = document.createElement("p");
        moodLbl.textContent = "Your Mood:";
        moodLbl.className = "mb-1";
        wrap.appendChild(moodLbl);

        const input = document.createElement("input");
        input.placeholder = "Enter your mood";
        input.value = acc.mood || "";
        input.className = "w-full p-2 rounded bg-slate-800";

        input.oninput = e => {
            Logic.Auth.setMood(e.target.value);

            // Show toast only once per short period
            if (!this._toastShown) {
                this._toastShown = true;
                showToast("Mood saved!");
                setTimeout(() => (this._toastShown = false), 1500);
            }
        };

        wrap.appendChild(input);

        return wrap;
    },

    /* ============================================================
       THEME TAB
    ============================================================ */
    renderTheme() {
        const wrap = document.createElement("div");

        const title = document.createElement("h2");
        title.textContent = "Theme Settings";
        title.className = "text-3xl mb-4 font-bold";
        wrap.appendChild(title);

        const subtitle = document.createElement("p");
        subtitle.textContent = "Choose your lava style:";
        subtitle.className = "mb-4";
        wrap.appendChild(subtitle);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeThemeBtn = (label, id) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "px-4 py-2 rounded bg-orange-300 hover:bg-orange-400 text-black cursor-pointer";
            b.onclick = () => {
                localStorage.setItem("themeMode", id);
                renderApp();
                this.render();
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

        const title = document.createElement("h2");
        title.textContent = "Admin Panel";
        title.className = "text-3xl mb-4 text-yellow-300 font-bold";
        wrap.appendChild(title);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments";
        btn.className =
            "bg-red-500 px-6 py-2 rounded text-lg cursor-pointer hover:bg-red-600";
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

        const title = document.createElement("h2");
        title.textContent = "About VolcanoChat";
        title.className = "text-3xl mb-4 font-bold";
        wrap.appendChild(title);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a chaotic experimental social playground made entirely in vanilla JavaScript.";
        p.className = "opacity-80";
        wrap.appendChild(p);

        return wrap;
    }
};
