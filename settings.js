/* ============================================================
   VolcanoChat — FIXED & POLISHED SETTINGS UI
   Matches Notifications/Create UI design
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",

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
       RENDER ROOT OVERLAY
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

        const makeBtn = (name, tab) => {
            const b = document.createElement("button");
            b.textContent = name;
            b.className =
                "text-left px-2 py-1 rounded hover:bg-slate-800 " +
                (this.tab === tab ? "bg-slate-700 font-bold" : "");
            b.onclick = () => this.setTab(tab);
            return b;
        };

        wrap.appendChild(makeBtn("PROFILE", "profile"));
        wrap.appendChild(makeBtn("THEME", "theme"));
        wrap.appendChild(makeBtn("ABOUT", "about"));

        const logout = document.createElement("button");
        logout.textContent = "LOG OUT";
        logout.className = "text-left px-2 py-1 rounded hover:bg-red-800 text-red-400";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
            location.reload();
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
        return this.renderAbout();
    },

    /* ============================================================
       PROFILE SETTINGS
    ============================================================ */
    renderProfile() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1";

        const close = this.renderCloseBtn();
        wrap.appendChild(close);

        const title = document.createElement("h2");
        title.textContent = "Profile Settings";
        title.className = "text-2xl mb-4 font-bold";
        wrap.appendChild(title);

        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        /* Avatar grid */
        const avTitle = document.createElement("p");
        avTitle.textContent = "Choose Avatar:";
        avTitle.className = "mb-1";
        wrap.appendChild(avTitle);

        const grid = document.createElement("div");
        grid.className =
            "grid grid-cols-8 gap-2 p-2 bg-slate-800 rounded max-h-[200px] overflow-y-auto";

        Logic.avatarList.forEach(av => {
            const b = document.createElement("button");
            b.textContent = av;
            b.className =
                "text-2xl p-2 rounded bg-slate-700 hover:bg-slate-600 " +
                (acc.avatar === av ? "ring-2 ring-orange-400" : "");
            b.onclick = () => {
                Logic.Auth.changeAvatar(av);
                this.render();
            };
            grid.appendChild(b);
        });

        wrap.appendChild(grid);

        /* Mood input */
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Your Mood:";
        moodLabel.className = "mt-4 mb-1";
        wrap.appendChild(moodLabel);

        const mood = document.createElement("input");
        mood.className = "w-full p-2 rounded bg-slate-800";
        mood.placeholder = "Enter your mood";
        mood.value = acc.mood || "";
        mood.oninput = e => Logic.Auth.setMood(e.target.value);
        wrap.appendChild(mood);

        return wrap;
    },

    /* ============================================================
       THEME SETTINGS
    ============================================================ */
    renderTheme() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "Theme Settings";
        title.className = "text-2xl font-bold mb-4";
        wrap.appendChild(title);

        const sub = document.createElement("p");
        sub.textContent = "Choose your lava style.";
        sub.className = "mb-4";
        wrap.appendChild(sub);

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const makeThemeBtn = (label, key) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "px-4 py-2 rounded bg-orange-300 text-black hover:bg-orange-400";
            b.onclick = () => {
                localStorage.setItem("themeMode", key);
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
       ABOUT PAGE
    ============================================================ */
    renderAbout() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1";

        wrap.appendChild(this.renderCloseBtn());

        const title = document.createElement("h2");
        title.textContent = "About VolcanoChat";
        title.className = "text-2xl font-bold mb-4";
        wrap.appendChild(title);

        const p = document.createElement("p");
        p.textContent =
            "VolcanoChat is a chaotic experimental social playground created entirely in vanilla JS.";
        wrap.appendChild(p);

        return wrap;
    },

    /* ≡≡≡ CLOSE BUTTON (matches notifications panel) ≡≡≡ */
    renderCloseBtn() {
        const b = document.createElement("button");
        b.textContent = "✖";
        b.className =
            "absolute top-2 right-2 text-3xl text-orange-500 hover:text-orange-300";
        b.onclick = () => this.hide();
        return b;
    }
};
