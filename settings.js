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

// FIX: Safely grab global el() helper function (defined in message.js or ui.js)
const el = window.el || ((tag, cls = "", text = "") => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
});

window.SettingsUI = {
    open: false,
    tab: "profile",   // profile | theme | admin | about

    /* ------------------------------------------------------------
       PUBLIC SHOW/HIDE
    ------------------------------------------------------------ */
    show() {
        this.open = true;
        // FIX: Default to a safe tab if not logged in
        this.tab = Logic.Storage.activeUser ? "profile" : "about"; 
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

        o.classList.toggle("hidden", !this.open);

        if (!this.open) {
            c.innerHTML = "";
            return;
        }

        c.innerHTML = "";
        // FIX: Added basic styling for the container
        c.className = "flex bg-slate-900 text-white p-6 rounded-xl shadow-xl relative"; 

        // FIX: Changed to use el() and added to container after panel for positioning
        const close = el("span", "absolute top-2 right-3 text-3xl cursor-pointer", "❌"); 
        close.onclick = () => this.hide();

        c.appendChild(this.renderSidebar());
        c.appendChild(this.renderPanel());
        c.appendChild(close);
    },

    /* ============================================================
       SIDEBAR (left column)
    ============================================================= */
    renderSidebar() {
        // Re-implemented using el() for consistency
        const sb = el("div", "settings-sidebar w-40 flex flex-col gap-3 p-4 bg-slate-800 rounded-lg");

        const makeBtn = (id, label) => {
            const b = el("div", "settings-tab cursor-pointer p-3 rounded-md transition-colors");
            b.textContent = label;
            b.className +=
                ` ${this.tab === id ? "bg-orange-500 text-white" : "hover:bg-slate-700 bg-slate-700/50"}`;
            b.onclick = () => this.setTab(id);
            return b;
        };

        if (Logic.Storage.activeUser) { // Only show profile if logged in
            sb.appendChild(makeBtn("profile", "PROFILE"));
        }
        sb.appendChild(makeBtn("theme", "THEME"));

        if (Logic.Storage.activeUser === Logic.ADMIN)
            sb.appendChild(makeBtn("admin", "ADMIN"));

        sb.appendChild(makeBtn("about", "ABOUT"));

        // logout
        if (Logic.Storage.activeUser) {
            // Re-implemented using el() for consistency
            const logout = el("div", "settings-tab cursor-pointer p-3 rounded-md transition-colors bg-red-600 hover:bg-red-700 mt-6");
            logout.textContent = "LOG OUT";
            logout.onclick = () => {
                Logic.Auth.logout();
                this.hide();
                window.renderApp(); // FIX: Use window prefix for global function
            };
            sb.appendChild(logout);
        }

        return sb;
    },

    /* ============================================================
       RIGHT PANEL CONTENT
    ============================================================= */
    renderPanel() {
        // Re-implemented using el() for consistency
        const panel = el("div", "settings-panel ml-6 bg-slate-800 p-6 rounded-lg w-[400px]");

        if (this.tab === "profile") panel.appendChild(this.renderProfile());
        else if (this.tab === "theme") panel.appendChild(this.renderTheme());
        else if (this.tab === "admin") panel.appendChild(this.renderAdmin());
        else if (this.tab === "about") panel.appendChild(this.renderAbout());

        return panel;
    },

    /* ============================================================
       PROFILE TAB
    ============================================================= */
    renderProfile() {
        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];
        if (!acc) return el("div", "text-red-400", "Must be logged in to view profile.");

        const box = el("div");

        box.appendChild(el("h2", "text-3xl mb-4", "Profile Settings"));

        box.appendChild(el("p", "mb-1", "Choose Avatar:"));
        const avBox = el("div", "flex flex-wrap gap-2 text-3xl justify-center mb-6 max-h-40 overflow-y-auto");

        Logic.avatarList.forEach(av => {
            // Re-implemented using el() for consistency
            const btn = el("button", `px-2 py-1 rounded text-black ${acc.avatar === av ? "bg-yellow-300" : "bg-white"}`, av);
            btn.onclick = () => {
                Logic.Auth.changeAvatar(av);
                window.renderApp(); // FIX: Use window prefix
                this.render();
            };
            avBox.appendChild(btn);
        });

        box.appendChild(avBox);

        box.appendChild(el("p", "mb-1", "Your Mood:"));

        // Re-implemented using el() for consistency
        const input = el("input", "text-black border rounded px-3 py-2 w-64");
        input.value = acc.mood || "";
        input.placeholder = "Enter your mood";
        input.oninput = e => {
            Logic.Auth.setMood(e.target.value);
            window.renderApp(); // FIX: Use window prefix
        };
        box.appendChild(input);

        return box;
    },

    /* ============================================================
       THEME TAB
    ============================================================= */
    renderTheme() {
        const box = el("div");

        box.appendChild(el("h2", "text-3xl mb-4", "Theme Settings"));

        box.appendChild(el("p", "mb-2 text-sm", "Choose your lava style."));

        const row = el("div", "flex gap-3");

        const currentTheme = localStorage.getItem("themeMode") || "A";

        const makeBtn = (id, label) => {
            // Re-implemented using el() for consistency
            const b = el("button", 
                `px-4 py-2 rounded text-black ${currentTheme === id ? "bg-orange-400" : "bg-orange-200"}`
                , label);
            b.onclick = () => {
                window.UI.theme = id; // FIX: Use window prefix
                localStorage.setItem("themeMode", id);
                window.renderApp(); // FIX: Use window prefix
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
        const box = el("div");

        box.appendChild(el("h2", "text-3xl mb-4 text-yellow-300", "Admin Panel"));

        box.appendChild(el("p", "mb-2 text-sm", "Moderation & lava control."));

        // Re-implemented using el() for consistency
        const btn = el("button", "bg-red-500 hover:bg-red-600 px-6 py-2 rounded text-lg", "Clear All Comments");
        btn.onclick = () => {
            Logic.Mod.clearAllComments();
            window.renderApp(); // FIX: Use window prefix
            this.render();
        };
        box.appendChild(btn);

        return box;
    },

    /* ============================================================
       ABOUT TAB
    ============================================================= */
    renderAbout() {
        const box = el("div", "text-center");

        box.appendChild(el("h2", "text-3xl mb-4", "About VolcanoChat"));

        box.appendChild(el("p", "max-w-md mx-auto", 
            "VolcanoChat is a chaotic, lava-powered discussion pit. Join volcanoes, roast friends, post comments, and cause eruptions. All data is stored in memory and resets on refresh."
        ));

        return box;
    }
};
