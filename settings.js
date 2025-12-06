/* ============================================================
   VolcanoChat — FINAL SETTINGS UI (No-Deselect + Avatar Fix)
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {
    open: false,
    tab: "profile",

    tempMood: "",  // local mood buffer (typing does NOT rerender)

    /* ------------------------------------------------------------
       OPEN SETTINGS
    ------------------------------------------------------------ */
    show() {
        this.open = true;

        const user = Logic.Storage.activeUser;
        if (user) {
            const acc = Logic.Storage.accounts[user];
            this.tempMood = acc.mood || "";
        }

        this.render();
    },

    /* ------------------------------------------------------------
       CLOSE SETTINGS (SAVE MOOD HERE)
    ------------------------------------------------------------ */
    hide() {
        const user = Logic.Storage.activeUser;
        if (user) {
            Logic.Auth.setMood(this.tempMood);
        }

        this.open = false;
        renderApp();  // close + refresh main UI
    },

    /* ------------------------------------------------------------
       SWITCH TABS
    ------------------------------------------------------------ */
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

        // rebuild container
        box.innerHTML = "";
        box.className =
            "bg-slate-900 text-white p-6 rounded-xl shadow-xl flex gap-6 max-h-[80vh] overflow-y-auto";

        box.appendChild(this.renderSidebar());
        box.appendChild(this.renderPanel());
    },

    /* ------------------------------------------------------------
       PANEL-ONLY RERENDER (used for avatar fixes)
    ------------------------------------------------------------ */
    rerenderPanel() {
        const box = document.getElementById("settings-container");

        // If panel already exists, remove it
        if (box.children.length > 1) {
            box.removeChild(box.children[1]);
        }

        box.appendChild(this.renderPanel());
    },

    /* ============================================================
       SIDEBAR BUTTONS
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
       PROFILE TAB
       (Mood input does NOT rerender. Avatar buttons DO rerender panel only.)
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

        /* ---------------- Avatar Grid ---------------- */
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
                "text-2xl p-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer " +
                (acc.avatar === av ? "ring-2 ring-orange-400" : "");

            btn.onclick = () => {
                Logic.Auth.changeAvatar(av);

                // ONLY refresh right panel — does NOT break mood input
                this.rerenderPanel();
            };

            grid.appendChild(btn);
        });

        wrap.appendChild(grid);

        /* ---------------- Mood Input ---------------- */
        const moodLabel = document.createElement("p");
        moodLabel.textContent = "Your Mood:";
        moodLabel.className = "mt-4 mb-1";
        wrap.appendChild(moodLabel);

        const mood = document.createElement("input");
        mood.className = "w-full p-2 rounded bg-slate-800";
        mood.placeholder = "Enter your mood";

        // Use temp local value (NOT live account)
        mood.value = this.tempMood;

        // DO NOT RERENDER ANYTHING
        mood.oninput = e => {
            this.tempMood = e.target.value; // stored for later saving
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

        const row = document.createElement("div");
        row.className = "flex gap-3";

        const mk = (label, id) => {
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
        title.className = "text-2xl mb-4 text-yellow-300 font-bold";
        wrap.appendChild(title);

        const btn = document.createElement("button");
        btn.textContent = "Clear All Comments";
        btn.className =
            "bg-red-600 px-6 py-2 rounded text-lg cursor-pointer hover:bg-red-700";
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
