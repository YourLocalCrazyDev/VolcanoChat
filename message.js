/* ============================================================
   VolcanoChat — MESSAGE + PROFILE UI SYSTEM (FULL FIXED VERSION)
============================================================ */

window.MessageUI = {
    showProfUser: null,
    notifyOpen: false,

    /* ------------------------------------------------------------
       SHOW NOTIFICATIONS
    ------------------------------------------------------------ */
    showNotifications() {
        this.notifyOpen = true;
        this.render();
    },

    hideNotifications() {
        this.notifyOpen = false;
        this.render();
    },

    /* ------------------------------------------------------------
       SHOW PROFILE OVERLAY
    ------------------------------------------------------------ */
    showProfile(username) {
        this.showProfUser = username;
        this.render();
    },

    /* ------------------------------------------------------------
       TOAST MESSAGE
    ------------------------------------------------------------ */
    toast(msg) {
        const box = document.getElementById("toast-box");
        box.style.display = "block";

        box.innerHTML = `
            <div class="bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow mb-2">
                ${msg}
            </div>
        `;

        setTimeout(() => {
            box.style.display = "none";
        }, 2000);
    },

    /* ------------------------------------------------------------
       MAIN RENDER FUNCTION (notifications + profile)
    ------------------------------------------------------------ */
    render() {
        this.renderNotifications();
        this.renderProfile();
    },

    /* ------------------------------------------------------------
       NOTIFICATIONS UI
    ------------------------------------------------------------ */
    renderNotifications() {
        const o = document.getElementById("notifications-overlay");
        const c = document.getElementById("notifications-container");

        o.classList.toggle("hidden", !this.notifyOpen);
        if (!this.notifyOpen) {
            c.innerHTML = "";
            return;
        }

        c.innerHTML = `
            <button class="absolute top-2 right-2 text-3xl text-orange-500 hover:text-orange-300"
                    onclick="MessageUI.hideNotifications()">
                ✖
            </button>
            <h2 class="text-2xl font-bold mb-3">Notifications</h2>
            <h3 class="text-lg mb-2">Latest Comments</h3>
        `;

        const list = document.createElement("div");
        list.className = "max-h-64 overflow-y-auto";

        Logic.Comments.getRecent(10).forEach(cm => {
            const item = document.createElement("div");
            item.className = "mb-2";
            item.innerHTML = `
                ${cm.avatar} <b>${cm.display}</b>: ${cm.text}
                <span class="text-gray-400 text-xs">[${cm.community}]</span>
            `;
            list.appendChild(item);
        });

        c.appendChild(list);
    },

    /* ------------------------------------------------------------
       PROFILE OVERLAY UI
    ------------------------------------------------------------ */
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
            "bg-black bg-opacity-40 p-6 rounded-xl w-96 text-center text-white relative";

        /* CLOSE BUTTON */
        const close = el("button", "absolute top-4 right-4 text-3xl", "✖");
        close.onclick = () => {
            this.showProfUser = null;
            this.render();
        };
        c.appendChild(close);

        /* AVATAR */
        c.appendChild(el("div", "text-6xl mb-3", acc.avatar));

        /* DISPLAY NAME */
        const nm = el("h2", "text-3xl font-bold", acc.display);
        c.appendChild(nm);

        /* @USERNAME */
        c.appendChild(
            el("p", "text-sm text-gray-300 mb-3", "@" + user)
        );

        /* DESCRIPTION */
        c.appendChild(
            el("p", "mb-4 text-sm italic", acc.description || "No description")
        );

        /* REPORT BUTTON */
        if (
            Logic.Storage.activeUser &&
            Logic.Storage.activeUser !== user
        ) {
            const btn = el(
                "button",
                "bg-red-500 px-3 py-1 rounded",
                "Report User"
            );
            btn.onclick = () => {
                Logic.Mod.submitReport(user);
                MessageUI.toast("Report submitted.");
            };
            c.appendChild(btn);
        }

        /* RECENT COMMENTS */
        const title = el("h3", "text-xl mt-4 mb-2", "Recent Comments:");
        c.appendChild(title);

        const list = el(
            "div",
            "bg-black bg-opacity-30 p-2 rounded max-h-48 overflow-y-auto text-left"
        );

        Logic.Comments.getAllByUser(user).forEach(cm => {
            const p = document.createElement("p");
            p.className = "mb-2";
            p.innerHTML = `
                ${cm.avatar} <b>${cm.display}</b>: ${cm.text}
            `;
            list.appendChild(p);
        });

        c.appendChild(list);
    }
};
