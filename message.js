/* ============================================================
   VolcanoChat — MESSAGE & OVERLAY UI (Display Name Edition)
   Handles:
   - Notifications overlay
   - Profile overlay
   - Create Community overlay
   - Reports + admin actions
   - Toast popup utility
============================================================ */

/* ------------------------------------------------------------
   GLOBAL IMPORT — MUST NOT USE const/let
------------------------------------------------------------ */
Logic = window.VolcanoLogic;

/* Helper */
function el(tag, cls = "", text = "") {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
}

/* ------------------------------------------------------------
   PATCH MISSING LOGIC FUNCTIONS (GitHub Pages / fallback fixes)
------------------------------------------------------------ */
if (!Logic.Comments.getRecent) {
    Logic.Comments.getRecent = function (amount = 8) {
        const all = [];
        for (const slug in Logic.Storage.comments) {
            all.push(...Logic.Storage.comments[slug]);
        }
        return all
            .sort((a, b) => b.time - a.time)
            .slice(0, amount);
    };
}

if (!Logic.Comments.getAllByUser) {
    Logic.Comments.getAllByUser = function (user) {
        const arr = [];
        for (const slug in Logic.Storage.comments) {
            arr.push(...Logic.Storage.comments[slug].filter(c => c.user === user));
        }
        return arr.sort((a, b) => b.time - a.time);
    };
}

if (!Logic.Mod.clearAllComments) {
    Logic.Mod.clearAllComments = function () {
        for (const slug in Logic.Storage.comments) {
            Logic.Storage.comments[slug] = [];
        }
    };
}

/* Safety */
if (!Logic.communityIconList) {
    Logic.communityIconList = Logic.communityIcons;
}

/* ------------------------------------------------------------
   MESSAGE UI CORE
------------------------------------------------------------ */

window.MessageUI = {
    showNotif: false,
    showProfUser: null,
    showCreate: false,
    toastTimer: null,

    /* ====== PUBLIC OPENERS ====== */
    showNotifications() {
        this.showNotif = true;
        this.render();
    },

    showProfile(user) {
        this.showProfUser = user;
        this.render();
    },

    showCreateCommunity() {
        this.showCreate = true;
        this.render();
    },

    closeAll() {
        this.showNotif = false;
        this.showProfUser = null;
        this.showCreate = false;
        this.render();
    },

    /* ====== TOAST ====== */
    toast(msg, duration = 2000) {
        let box = document.getElementById("toast-box");
        if (!box) {
            box = document.createElement("div");
            box.id = "toast-box";
            box.style.position = "fixed";
            box.style.bottom = "20px";
            box.style.left = "50%";
            box.style.transform = "translateX(-50%)";
            box.style.padding = "12px 20px";
            box.style.background = "rgba(0,0,0,0.7)";
            box.style.color = "white";
            box.style.borderRadius = "10px";
            box.style.fontSize = "16px";
            box.style.zIndex = "99999";
            document.body.appendChild(box);
        }
        box.textContent = msg;
        box.style.display = "block";

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => { box.style.display = "none"; }, duration);
    },

    /* ====== MASTER RENDER ====== */
    render() {
        this.renderNotifications();
        this.renderProfile();
        this.renderCreate();
    },

    /* ============================================================
       NOTIFICATIONS OVERLAY
    ============================================================= */
    renderNotifications() {
        const o = document.getElementById("notifications-overlay");
        const c = document.getElementById("notifications-container");

        o.classList.toggle("hidden", !this.showNotif);
        if (!this.showNotif) {
            c.innerHTML = "";
            return;
        }

        c.innerHTML = "";
        c.className =
            "bg-black bg-opacity-70 p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto relative text-white";

        // close button
        const close = el("button", "absolute top-2 right-3 text-3xl", "❌");
        close.onclick = () => {
            this.showNotif = false;
            this.render();
        };
        c.appendChild(close);

        // heading
        c.appendChild(el("h2", "text-2xl mb-3", "Notifications"));

        /* ---- Latest Comments ---- */
        c.appendChild(el("h3", "text-xl mb-2", "Latest Comments"));

        Logic.Comments.getRecent(8).forEach(cm => {
            const banned = Logic.isBanned(cm.user);
            const account = Logic.Storage.accounts[cm.user];

            const p = el("p", "mb-2 text-sm");

            p.innerHTML = `
                ${cm.avatar} <b>${account.displayName}</b>
                <span class="opacity-70">@${cm.user}</span>:
                ${cm.text}
                <span class="text-xs text-gray-400">
                    [${Logic.Storage.communities[cm.community]?.name}]
                </span>
            `;

            if (banned) p.classList.add("text-red-400");
            c.appendChild(p);
        });

        /* ---- Admin Reports ---- */
        if (Logic.Storage.activeUser === Logic.ADMIN) {
            c.appendChild(el("h3", "text-xl mt-4 mb-2", "Reports"));

            const unresolved = Logic.Storage.reports.filter(r => !r.resolved);

            if (unresolved.length === 0) {
                c.appendChild(el("p", "", "No pending reports."));
                return;
            }

            unresolved.forEach(r => {
                const acc = Logic.Storage.accounts[r.target];

                const box = el("div", "border border-gray-500 rounded p-2 mb-2 text-sm");
                box.innerHTML = `
                    <p><b>Target:</b> ${acc.displayName} 
                        <span class="opacity-70">@${r.target}</span>
                    </p>
                    <p><b>Reporter:</b> ${Logic.Storage.accounts[r.reporter]?.displayName}
                        <span class="opacity-70">@${r.reporter}</span>
                    </p>
                    <p><b>Reason:</b> ${r.reason}</p>
                    <p class="text-xs">${new Date(r.time).toLocaleString()}</p>
                `;

                const row = el("div", "flex gap-2 mt-2");

                /* Ban */
                const ban = el("button", "bg-red-500 px-2 py-1 rounded text-xs", "Ban");
                ban.onclick = () => {
                    const mins = prompt("Ban minutes (0 = permanent):", "60");
                    if (mins === null) return;
                    const dur = parseInt(mins);
                    if (isNaN(dur) || dur < 0) return alert("Invalid.");

                    Logic.Mod.banUser(r, dur);
                    this.toast("User banned.");
                    this.renderNotifications();
                };
                row.appendChild(ban);

                /* Warn */
                const warn = el("button", "bg-yellow-400 px-2 py-1 rounded text-xs text-black", "Warn");
                warn.onclick = () => {
                    Logic.Mod.warnUser(r);
                    this.toast("Warning issued.");
                    this.renderNotifications();
                };
                row.appendChild(warn);

                /* Ignore */
                const ign = el("button", "bg-gray-400 px-2 py-1 rounded text-xs", "Ignore");
                ign.onclick = () => {
                    Logic.Mod.ignoreReport(r);
                    this.toast("Report ignored.");
                    this.renderNotifications();
                };
                row.appendChild(ign);

                box.appendChild(row);
                c.appendChild(box);
            });
        }
    },

    /* ============================================================
       PROFILE OVERLAY
    ============================================================= */
    renderProfile() {
        const o = document.getElementById("profile-overlay");
        const c = document.getElementById("profile-container");

        o.classList.toggle("hidden", !this.showProfUser);
        if (!this.showProfUser) {
            c.innerHTML = "";
            return;
        }

        const uname = this.showProfUser;
        const acc = Logic.Storage.accounts[uname];

        c.innerHTML = "";
        c.className =
            "bg-black bg-opacity-40 p-6 rounded-xl w-96 text-center max-h-[80vh] overflow-y-auto text-white relative";

        // close button
        const close = el("button", "absolute top-4 right-4 text-4xl", "❌");
        close.onclick = () => {
            this.showProfUser = null;
            this.render();
        };
        c.appendChild(close);

        // avatar
        c.appendChild(el("div", "text-6xl mb-3", acc.avatar));

        // display name
        const dn = el("h2", "text-3xl font-bold", acc.displayName);
        if (Logic.isBanned(uname)) dn.classList.add("text-red-400");
        c.appendChild(dn);

        // @username
        c.appendChild(el("p", "opacity-70 -mt-1 mb-3", `@${uname}`));

        // mood
        c.appendChild(
            el("p", "mb-4 text-sm", `Mood: ${acc.mood || "None"}`)
        );

        // warnings
        c.appendChild(
            el("p", "mb-4 text-sm",
                `Warnings: ${Logic.Storage.warnings[uname] || 0}`)
        );

        // report button
        if (Logic.Storage.activeUser && Logic.Storage.activeUser !== uname) {
            const btn = el("button", "bg-red-500 px-4 py-2 rounded mb-4", "Report User");
            btn.onclick = () => {
                Logic.Mod.submitReport(uname);
                this.toast("Report submitted.");
            };
            c.appendChild(btn);
        }

        // comments header
        c.appendChild(el("h3", "text-xl mb-2", "Comments"));

        const list = el(
            "div",
            "bg-black bg-opacity-30 rounded p-3 max-h-64 overflow-y-auto text-left text-sm"
        );

        Logic.Comments.getAllByUser(uname).forEach(cm => {
            const p = el("p", "mb-2");
            p.innerHTML = `
                ${cm.avatar} <b>${acc.displayName}</b>
                <span class="opacity-70">@${uname}</span>:
                ${cm.text}
                <span class="text-blue-300">(${Logic.Storage.communities[cm.community]?.name})</span>
            `;
            list.appendChild(p);
        });

        c.appendChild(list);
    },

    /* ============================================================
       CREATE COMMUNITY OVERLAY
    ============================================================= */
    renderCreate() {
        const o = document.getElementById("create-overlay");
        const c = document.getElementById("create-container");

        o.classList.toggle("hidden", !this.showCreate);
        if (!this.showCreate) {
            c.innerHTML = "";
            return;
        }

        c.innerHTML = "";
        c.className =
            "bg-slate-900 bg-opacity-90 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto text-white relative";

        const close = el("button", "absolute top-2 right-3 text-3xl", "❌");
        close.onclick = () => {
            this.showCreate = false;
            this.render();
        };
        c.appendChild(close);

        c.appendChild(el("h2", "text-2xl mb-3", "Create a Volcano"));

        // Name
        c.appendChild(el("label", "text-sm", "Community name"));
        const name = el("input", "w-full border rounded px-3 py-2 mb-3 text-black");
        name.placeholder = "John's Jamboree";
        name.oninput = e => (this.newCommName = e.target.value);
        c.appendChild(name);

        // Desc
        c.appendChild(el("label", "text-sm", "Description"));
        const desc = document.createElement("textarea");
        desc.className = "w-full border rounded px-3 py-2 mb-3 text-black";
        desc.rows = 3;
        desc.placeholder = "Describe your community...";
        desc.oninput = e => (this.newCommDesc = e.target.value);
        c.appendChild(desc);

        // Icon picker
        c.appendChild(el("label", "text-sm block mb-1", "Choose icon"));

        const iconBox = el(
            "div",
            "flex flex-wrap gap-2 text-2xl bg-slate-800 rounded p-2 max-h-40 overflow-y-auto mb-4"
        );

        Logic.communityIconList.forEach(ic => {
            const btn = el(
                "button",
                `px-2 py-1 rounded ${
                    this.newCommIcon === ic ? "bg-orange-400" : "bg-slate-700"
                }`,
                ic
            );
            btn.onclick = () => {
                this.newCommIcon = ic;
                this.renderCreate();
            };
            iconBox.appendChild(btn);
        });
        c.appendChild(iconBox);

        // Create button
        const createBtn = el(
            "button",
            "bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded w-full",
            "Create Volcano"
        );
        createBtn.onclick = () => {
            const name = this.newCommName?.trim();
            if (!name) return alert("Community needs a name.");

            const slug = Logic.slugify(name);
            if (!slug) return alert("Invalid name.");
            if (Logic.Storage.communities[slug])
                return alert("Already exists.");

            Logic.Community.create(
                name,
                this.newCommDesc?.trim() || "A VolcanoChat community.",
                this.newCommIcon
            );

            UI.currentCommunity = slug;
            this.showCreate = false;
            this.toast("Community created!");
            renderApp();
        };
        c.appendChild(createBtn);
    }
};
