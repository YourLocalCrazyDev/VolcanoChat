/* ============================================================
   VolcanoChat — SETTINGS OVERLAY UI
   Handles:
   - Profile tab (avatar, mood)
   - Theme tab
   - Admin tab (clear comments)
   - About tab
   - Logout
============================================================ */

/* ------------------------------------------------------------
   IMPORTANT:
   Use global Logic reference — do NOT redeclare it.
------------------------------------------------------------ */
Logic = window.VolcanoLogic;

// Safe helper (assuming UI.js is loaded, but including a fallback)
if (!window.el) {
    window.el = (tag, cls = "", text = "") => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    };
}
const el = window.el; // Use the global helper function

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

        // The hidden class is managed by Tailwind/CSS, but we ensure the element exists
        if (!o || !c) return;

        o.classList.toggle("hidden", !this.open);

        if (!this.open) {
            c.innerHTML = "";
            return;
        }

        c.innerHTML = "";
        c.className = "flex bg-slate-900 text-white p-6 rounded-xl shadow-xl";

        const close = el("button", "absolute top-2 right-3 text-3xl", "❌");
        close.onclick = () => this.hide();

        c.appendChild(this.renderSidebar());
        c.appendChild(this.renderPanel());
        c.appendChild(close);
    },

    /* ============================================================
       SIDEBAR (left column)
    ============================================================= */
    renderSidebar() {
        const sb = el("div", "settings-sidebar"); // Uses class from styles.css
        sb.className = "settings-sidebar text-white w-40 flex flex-col gap-3 p-4 bg-slate-800 rounded-lg";

        const makeBtn = (id, label) => {
            const b = el("div", "settings-tab"); // Uses class from styles.css
            b.textContent = label;
            b.className =
                `settings-tab cursor-pointer p-3 rounded-md transition-colors 
                 ${this.tab === id ? "bg-orange-500 text-white" : "hover:bg-slate-700 bg-slate-700/50"}`;
            b.onclick = () => this.setTab(id);
            return b;
        };

        sb.appendChild(makeBtn("profile", "PROFILE"));
        sb.appendChild(makeBtn("theme", "THEME"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            sb.appendChild(makeBtn("admin", "ADMIN"));

        sb.appendChild(makeBtn("about", "ABOUT"));

        // logout
        const logout = el("div", "settings-tab mt-auto");
        logout.textContent = "LOG OUT";
        logout.className = "settings-tab cursor-pointer p-3 rounded-md transition-colors bg-red-600 hover:bg-red-70
