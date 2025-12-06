/* ============================================================
   VolcanoChat — SETTINGS UI (Description + Display Name)
============================================================ */

Logic = window.VolcanoLogic;

window.SettingsUI = {

    open: false,
    tab: "profile",
    tempDescription: "",

    show() {
        this.open = true;

        const user = Logic.Storage.activeUser;
        if (user) {
            const acc = Logic.Storage.accounts[user];
            this.tempDescription = acc.description || "";
        }

        this.render();
    },

    hide() {
        const user = Logic.Storage.activeUser;
        if (user) Logic.Auth.setDescription(this.tempDescription);

        this.open = false;
        renderApp();
    },

    setTab(tab) {
        this.tab = tab;
        this.render();
    },

    render() {
        const overlay = document.getElementById("settings-overlay");
        const box = document.getElementById("settings-container");

        overlay.classList.toggle("hidden", !this.open);
        if (!this.open) { box.innerHTML = ""; return; }

        box.innerHTML = "";
        box.className = "bg-slate-900 text-white p-6 rounded-xl shadow-xl flex gap-6";

        box.appendChild(this.renderSidebar());
        box.appendChild(this.renderPanel());
    },

    /* ---------------- SIDEBAR ---------------- */
    renderSidebar() {
        const sb = document.createElement("div");
        sb.className = "flex flex-col gap-3 min-w-[140px]";

        const makeBtn = (label, id) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.className =
                "px-3 py-2 rounded text-left cursor-pointer " +
                (this.tab === id ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-700");
            b.onclick = () => this.setTab(id);
            return b;
        };

        sb.appendChild(makeBtn("PROFILE", "profile"));
        sb.appendChild(makeBtn("THEME", "theme"));
        sb.appendChild(makeBtn("ABOUT", "about"));

        return sb;
    },

    /* ---------------- PANEL SWITCH ---------------- */
    renderPanel() {
        if (this.tab === "profile") return this.renderProfile();
        if (this.tab === "theme") return this.renderTheme();
        return this.renderAbout();
    },

    /* ---------------- PROFILE TAB ---------------- */
    renderProfile() {
        const wrap = document.createElement("div");
        wrap.className = "flex-1 relative";

        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];

        /* Avatar grid */
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
                renderApp();
                this.render();
            };

            grid.appendChild(btn);
        });

        /* Description input */
        const desc = document.createElement("textarea");
        desc.placeholder = "Write a short description...";
        desc.className = "w-full p-2 mt-4 rounded bg-slate-800";
        desc.value = this.tempDescription;
        desc.oninput = e => this.tempDescription = e.target.value;

        wrap.appendChild(grid);
        wrap.appendChild(desc);

        return wrap;
    },

    /* ---------------- THEME TAB ---------------- */
    renderTheme() { /* unchanged */ },

    /* ---------------- ABOUT TAB ---------------- */
    renderAbout() { /* unchanged */ }
};
