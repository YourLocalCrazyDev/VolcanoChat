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
        logout.className = "settings-tab cursor-pointer p-3 rounded-md transition-colors bg-red-600 hover:bg-red-700 mt-6";
        logout.onclick = () => {
            Logic.Auth.logout();
            this.hide();
            // Global render function defined in ui.js
            renderApp();
        };
        sb.appendChild(logout);

        return sb;
    },

    /* ============================================================
       PANEL (right content)
    ============================================================= */
    renderPanel() {
        const box = el("div", "settings-panel ml-6 bg-slate-800 p-6 rounded-lg w-[400px]");

        switch (this.tab) {
            case "profile":
                box.appendChild(this.renderProfile());
                break;
            case "theme":
                box.appendChild(this.renderTheme());
                break;
            case "admin":
                if (Logic.Storage.activeUser === Logic.ADMIN) {
                    box.appendChild(this.renderAdmin());
                } else {
                    box.appendChild(el("p", "text-red-400", "Access Denied."));
                }
                break;
            case "about":
                box.appendChild(this.renderAbout());
                break;
        }

        return box;
    },

    /* ============================================================
       PROFILE TAB
    ============================================================= */
    renderProfile() {
        const user = Logic.Storage.activeUser;
        if (!user) return el("p", "text-red-400", "You must be logged in to view your profile settings.");

        const acc = Logic.Storage.accounts[user];
        if (!acc) return el("p", "text-red-400", "Account data not found.");

        const box = el("div", "");
        box.appendChild(el("h2", "text-3xl mb-4 text-orange-400", "Profile Settings"));

        // Avatar Picker
        box.appendChild(el("p", "mb-1", "Current Avatar:"));
        const currentAv = el("div", "text-6xl mb-3", acc.avatar);
        box.appendChild(currentAv);

        const avWrap = el("div", "flex flex-wrap gap-2 text-2xl max-h-32 overflow-y-auto mb-4 p-2 bg-slate-700 rounded-md");
        Logic.avatarList.forEach(av => {
            const b = el("button", `px-2 py-1 rounded transition-colors ${acc.avatar === av ? "bg-yellow-400 text-black" : "bg-slate-600 hover:bg-slate-500"}`, av);
            b.onclick = () => {
                Logic.Auth.setAvatar(user, av);
                // Global render function defined in ui.js
                renderApp();
                this.render(); // Re-render settings to show new avatar
            };
            avWrap.appendChild(b);
        });
        box.appendChild(avWrap);

        // Mood
        const moodLabel = el("p", "mb-1", "Your Mood:");
        box.appendChild(moodLabel);

        const input = el("input", "text-black border rounded px-3 py-2 w-full");
        input.value = acc.mood || "";
        input.placeholder = "Enter your mood";
        input.oninput = e => {
            Logic.Auth.setMood(e.target.value);
        };
        box.appendChild(input);

        return box;
    },

    /* ============================================================
       THEME TAB
    ============================================================= */
    renderTheme() {
        const box = el("div", "");
        box.appendChild(el("h2", "text-3xl mb-4 text-orange-400", "Theme Settings"));

        const themes = [
            { id: "A", name: "Light (Default)", cls: "bg-orange-50 text-slate-900", desc: "A bright, warm theme." },
            { id: "B", name: "Dark (Slate)", cls: "bg-slate-950 text-orange-50", desc: "A chill, dark mode." },
            { id: "C", name: "Volcanic (Lava)", cls: "bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 text-orange-50", desc: "For extreme heat." },
        ];

        themes.forEach(t => {
            const active = UI.theme === t.id;

            const card = el("div", `p-4 rounded-lg mb-3 cursor-pointer border-2 transition-all ${active ? "border-orange-500 scale-[1.02] shadow-lg" : "border-slate-700 hover:border-slate-500"}`);
            card.onclick = () => {
                Logic.Auth.setTheme(t.id);
                // Access the global UI object (defined in ui.js)
                UI.theme = t.id; 
                // Global render function defined in ui.js
                renderApp();
                this.render();
            };

            const header = el("div", "flex items-center justify-between mb-2");
            header.appendChild(el("h3", "text-xl font-bold", t.name));

            const indicator = el("div", `w-4 h-4 rounded-full ${active ? "bg-orange-500" : "bg-gray-500 border border-white"}`);
            header.appendChild(indicator);
            card.appendChild(header);

            card.appendChild(el("p", "text-sm text-gray-300", t.desc));
            card.appendChild(el("div", `w-full h-8 mt-2 rounded-md ${t.cls}`));

            box.appendChild(card);
        });

        return box;
    },

    /* ============================================================
       ADMIN TAB
    ============================================================= */
    renderAdmin() {
        const box = el("div", "");

        box.appendChild(el("h2", "text-3xl mb-4 text-yellow-300", "Admin Panel"));
        box.appendChild(el("p", "mb-4 text-sm", "Moderation & lava control. Use with extreme caution."));

        const btn = el("button", "bg-red-500 hover:bg-red-600 px-6 py-2 rounded text-lg transition-colors", "Clear All Comments");
        btn.onclick = () => {
            if (confirm("ARE YOU SURE YOU WANT TO WIPE ALL COMMENTS? This is irreversible.")) {
                Logic.Mod.clearAllComments();
                // Global render function defined in ui.js
                renderApp();
                this.render();
                window.MessageUI.toast("All comments incinerated. 😈");
            }
        };
        box.appendChild(btn);

        return box;
    },

    /* ============================================================
       ABOUT TAB
    ============================================================= */
    renderAbout() {
        const box = el("div", "");

        box.appendChild(el("h2", "text-3xl mb-4 text-orange-400", "About VolcanoChat"));

        box.appendChild(el("p", "mb-4",
            "VolcanoChat is a chaotic, lava-powered discussion pit. Join volcanoes, roast friends, post comments, and cause eruptions."
        ));

        box.appendChild(el("p", "text-sm text-gray-400", "Version: 1.0.0 (Non-React, Final Fixed Build)"));
        box.appendChild(el("p", "text-sm text-gray-400", "Created by: JBB (with help from the AI collective)"));

        return box;
    }
};
