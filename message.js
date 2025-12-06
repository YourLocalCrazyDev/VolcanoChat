/* ============================================================
   VolcanoChat — PROFILE OVERLAY UPDATED
============================================================ */

renderProfile() {
    const o = document.getElementById("profile-overlay");
    const c = document.getElementById("profile-container");
    const user = this.showProfUser;

    o.classList.toggle("hidden", !user);
    if (!user) { c.innerHTML = ""; return; }

    const acc = Logic.Storage.accounts[user];

    c.innerHTML = "";
    c.className = "bg-black bg-opacity-40 p-6 rounded-xl w-96 text-center text-white relative";

    /* close button */
    const close = el("button", "absolute top-4 right-4 text-3xl", "✖");
    close.onclick = () => { this.showProfUser = null; this.render(); };
    c.appendChild(close);

    /* avatar */
    c.appendChild(el("div", "text-6xl mb-3", acc.avatar));

    /* display name */
    const nm = el("h2", "text-3xl font-bold", acc.display);
    c.appendChild(nm);

    /* @username */
    c.appendChild(el("p", "text-sm text-gray-300 mb-3", "@" + user));

    /* description */
    c.appendChild(el("p", "mb-4 text-sm italic", acc.description || "No description"));

    /* report button (if not yourself) */
    if (Logic.Storage.activeUser && Logic.Storage.activeUser !== user) {
        const btn = el("button", "bg-red-500 px-3 py-1 rounded", "Report User");
        btn.onclick = () => {
            Logic.Mod.submitReport(user);
            MessageUI.toast("Report submitted.");
        };
        c.appendChild(btn);
    }

    /* comments list */
    const title = el("h3", "text-xl mt-4 mb-2", "Recent Comments:");
    c.appendChild(title);

    const list = el("div", "bg-black bg-opacity-30 p-2 rounded max-h-48 overflow-y-auto text-left");
    Logic.Comments.getAllByUser(user).forEach(cm => {
        const p = document.createElement("p");
        p.className = "mb-2";
        p.innerHTML =
            `${cm.avatar} <b>${cm.display}</b>: ${cm.text}`;
        list.appendChild(p);
    });

    c.appendChild(list);
}
