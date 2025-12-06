/* ============================================================
   VolcanoChat — MESSAGE & OVERLAY UI
   - Notifications
   - Profile overlay
   - Create community
   - Toast helper
   ============================================================ */

const Logic = window.VolcanoLogic;

/* simple element helper (local to this file) */
function el(tag, cls = "", text = "") {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
}

window.MessageUI = {
    showNotif: false,
    showProfUser: null,
    showCreate: false,

    toastTimer: null,

    /* --------------------------------------------------------
       PUBLIC API
    -------------------------------------------------------- */
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

    /* --------------------------------------------------------
       TOAST
    -------------------------------------------------------- */
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
            box.style.background = "rgba(0,0,0,0.75)";
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

    /* --------------------------------------------------------
       RENDER ROOT
    -------------------------------------------------------- */
    render() {
        this.renderNotifications();
        this.renderProfile();
        this.renderCreate();
    },

    /* ========================================================
       NOTIFICATIONS OVERLAY
    ======================================================== */
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
            "bg-black bg-opacity-70 p-6 rounded-xl w-96 max-h-[80vh] " +
            "overflow-y-auto relative text-white";

        // close
        const close = el("button", "absolute top-2 right-3 text-3xl", "✖");
        close.onclick = () => { this.showNotif = false; this.render(); };
        c.appendChild(close);

        c.appendChild(el("h2", "text-2xl mb-3", "Notifications"));

        c.appendChild(el("h3", "text-xl mb-2", "Latest Comments"));

        Logic.Comments.getRecent(8).forEach(cm => {
            const banned = Logic.isBanned(cm.user);
            const acc = Logic.Storage.accounts[cm.user];
            const display = cm.display || acc?.display || cm.user;

            const p = document.createElement("p");
            p.className = "mb-1 text-sm";

            p.innerHTML = `
                <span class="${banned ? "text-red-400" : ""}">
                    ${cm.avatar} <b>${display}</b>
                </span>: ${cm.text}
                <span class="text-xs text-gray-400">
                    [${Logic.Storage.communities[cm.community]?.name || "Unknown"}]
                </span>
            `;

            c.appendChild(p);
        });

        /* ADMIN REPORTS */
        if (Logic.Storage.activeUser === Logic.ADMIN) {
            c.appendChild(el("h3", "text-xl mt-4 mb-2", "Reports"));

            const unresolved = Logic.Storage.reports.filter(r => !r.resolved);

            if (unresolved.length === 0) {
                c.appendChild(el("p", "", "No pending reports."));
                return;
            }

            unresolved.forEach(r => {
                const box = el("div", "border border-gray-500 rounded p-2 mb-2 text-sm");

                box.innerHTML = `
                    <p><b>Target:</b> <span class="${Logic.isBanned(r.target) ? "text-red-400" : ""}">${r.target}</span></p>
                    <p><b>Reporter:</b> ${r.reporter}</p>
                    <p><b>Reason:</b> ${r.reason}</p>
                    <p class="text-xs">${new Date(r.time).toLocaleString()}</p>
                `;

                const row = el("div", "flex gap-2 mt-2");

                const ban = el("button",
                    "bg-red-500 px-2 py-1 rounded text-xs",
                    "Ban");
                ban.onclick = () => {
                    const mins = prompt("Ban duration in minutes (0 = permanent):", "60");
                    if (mins === null) return;
                    const dur = parseInt(mins, 10);
                    if (isNaN(dur) || dur < 0) return alert("Invalid duration.");
                    Logic.Mod.banUser(r, dur);
                    this.toast("User banned.");
                    this.renderNotifications();
                };
                row.appendChild(ban);

                const warn = el("button",
                    "bg-yellow-400 px-2 py-1 rounded text-xs text-black",
                    "Warning");
                warn.onclick = () => {
                    Logic.Mod.warnUser(r);
                    this.toast("Warning issued.");
                    this.renderNotifications();
                };
                row.appendChild(warn);

                const ign = el("button",
                    "bg-gray-400 px-2 py-1 rounded text-xs",
                    "Ignore");
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

    /* ========================================================
       PROFILE OVERLAY  (display name + @username + description)
    ======================================================== */
    renderProfile() {
        const o = document.getElementById("profile-overlay");
        const c = document.getElementById("profile-container");
        const user = this.showProfUser;

        o.classList.toggle("hidden", !user);
        if (!user) {
            c.innerHTML = "";
            return;
        }

        const acc = Logic.Storage.accounts[user];

        c.innerHTML = "";
        c.className =
            "bg-black bg-opacity-40 p-6 rounded-xl w-96 text-center " +
            "max-h-[80vh] overflow-y-auto text-white relative";

        // close
        const close = el("button", "absolute top-4 right-4 text-3xl", "✖");
        close.onclick = () => { this.showProfUser = null; this.render(); };
        c.appendChild(close);

        // avatar
        c.appendChild(el("div", "text-6xl mb-3", acc.avatar));

        const display = acc.display || user;

        // display name
        c.appendChild(el("h2", "text-3xl font-bold", display));

        // @username
        c.appendChild(el("p", "text-sm text-gray-300 mb-2", "@" + user));

        // description
        c.appendChild(
            el("p", "mb-3 text-sm italic",
                acc.description || "No description set.")
        );

        // warnings
        const warns = Logic.Storage.warnings[user] || 0;
        c.appendChild(
            el("p", "text-xs mb-2 opacity-70", `Warnings: ${warns}`)
        );

        // report button
        if (Logic.Storage.activeUser && Logic.Storage.activeUser !== user) {
            const btn = el("button",
                "bg-red-500 px-4 py-2 rounded mb-3",
                "Report User");
            btn.onclick = () => {
                Logic.Mod.submitReport(user);
                this.toast("Report submitted.");
            };
            c.appendChild(btn);
        }

        // comments list
        c.appendChild(el("h3", "text-xl mt-3 mb-2", "Recent Comments:"));
        const list = el("div",
            "bg-black bg-opacity-30 rounded p-3 max-h-64 overflow-y-auto text-left text-sm");

        Logic.Comments.getAllByUser(user).forEach(cm => {
            const p = document.createElement("p");
            p.className = "mb-2";

            const disp = cm.display || display;

            p.innerHTML =
                `${cm.avatar} <b>${disp}</b>: ${cm.text} ` +
                `<span class="text-blue-300">(${Logic.Storage.communities[cm.community]?.name || "Unknown"})</span>`;
            list.appendChild(p);
        });

        c.appendChild(list);
    },

    /* ========================================================
       CREATE COMMUNITY OVERLAY
    ======================================================== */
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
            "bg-slate-900 bg-opacity-90 rounded-xl p-6 w-[480px] " +
            "max-h-[80vh] overflow-y-auto relative text-white";

        const close = el("button", "absolute top-2 right-3 text-3xl", "✖");
        close.onclick = () => { this.showCreate = false; this.render(); };
        c.appendChild(close);

        c.appendChild(el("h2", "text-2xl mb-3", "Create a Volcano"));

        // name
        c.appendChild(el("label", "text-sm", "Community name"));
        const nameInput = el("input",
            "w-full border rounded px-3 py-2 mb-3 text-black");
        nameInput.placeholder = "John's Jamboree";
        nameInput.oninput = e => this.newCommName = e.target.value;
        c.appendChild(nameInput);

        // description
        c.appendChild(el("label", "text-sm", "Description"));
        const desc = document.createElement("textarea");
        desc.className = "w-full border rounded px-3 py-2 mb-3 text-black";
        desc.rows = 3;
        desc.placeholder = "Describe your community...";
        desc.oninput = e => this.newCommDesc = e.target.value;
        c.appendChild(desc);

        // icon list
        c.appendChild(el("label", "text-sm block mb-1", "Choose icon"));
        const iconBox = el("div",
            "flex flex-wrap gap-2 text-2xl bg-slate-800 rounded p-2 " +
            "max-h-40 overflow-y-auto mb-4");

        (Logic.communityIcons || []).forEach(ic => {
            const b = el(
                "button",
                "px-2 py-1 rounded " +
                (this.newCommIcon === ic ? "bg-orange-400" : "bg-slate-700"),
                ic
            );
            b.onclick = () => {
                this.newCommIcon = ic;
                this.renderCreate();
            };
            iconBox.appendChild(b);
        });

        c.appendChild(iconBox);

        // create button
        const createBtn = el(
            "button",
            "bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded w-full",
            "Create Volcano"
        );
        createBtn.onclick = () => {
            const name = (this.newCommName || "").trim();
            if (!name) return alert("Community needs a name.");

            const created = Logic.Community.create(
                name,
                (this.newCommDesc || "").trim(),
                this.newCommIcon
            );

            if (!created.ok && created.reason === "EXISTS") {
                return alert("That volcano already exists.");
            }
            if (!created.ok) {
                return alert("Invalid name.");
            }

            UI.currentCommunity = created.slug;
            this.showCreate = false;
            this.toast("Community created!");
            renderApp();
        };
        c.appendChild(createBtn);
    }
};
