/* ============================================================
   VolcanoChat — MAIN SCREEN UI (Non-React)
   This file renders:
   - Sidebar
   - Login / Signup
   - Greeting header
   - Roasts
   - Community header
   - Comments
   - Comment posting
   - Layout + Themes
   It delegates:
   - Settings → settings.js
   - Overlays / notifications → message.js
============================================================ */

/* ------------------------------------------------------------
   IMPORTANT: FIXED LINES
   These must NOT use "const" or "let"
   They must assign to existing globals.
------------------------------------------------------------ */
Logic = window.VolcanoLogic;
MsgUI = window.MessageUI;
SettingsUI = window.SettingsUI;

/* ------------------------------------------------------------
   UI STATE (only main-screen things go here)
------------------------------------------------------------ */
const UI = {
    menu: "none",
    theme: "A",
    sort: "hot",
    shake: false,

    // login/signup
    loginUser: "",
    loginPass: "",
    signupUser: "",
    signupPass: "",
    selectedAvatar: "😐",

    // comments
    commentInput: "",

    // communities
    communitySearch: "",
    currentCommunity: null,

    // greeting
    greetingText: ""
};

const appRoot = document.getElementById("app-root");


/* ------------------------------------------------------------
   SIMPLE DOM TOOLS
------------------------------------------------------------ */
function el(tag, cls = "", text = "") {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
}

function clear(node) {
    while (node.firstChild) node.firstChild.remove();
}


/* ------------------------------------------------------------
   THEME
------------------------------------------------------------ */
function applyTheme() {
    const b = document.body;

    if (UI.theme === "A") {
        b.className = "min-h-screen bg-orange-50 text-slate-900";
    } else if (UI.theme === "B") {
        b.className = "min-h-screen bg-slate-950 text-orange-50";
    } else {
        b.className = "min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 text-orange-50";
    }

    if (UI.shake) {
        b.classList.add("shake");
        setTimeout(() => b.classList.remove("shake"), 600);
        UI.shake = false;
    }
}


/* ------------------------------------------------------------
   ROOT RENDER FUNCTION
------------------------------------------------------------ */
function renderApp() {
    applyTheme();
    clear(appRoot);

    const wrap = el("div", "max-w-5xl w-full mx-auto flex gap-6 p-4");
    appRoot.appendChild(wrap);

    wrap.appendChild(renderSidebar());
    wrap.appendChild(renderMainScreen());

    // overlays handled by message.js + settings.js
    MsgUI.render();
    SettingsUI.render();
}


/* ------------------------------------------------------------
   INITIAL COMMUNITY
------------------------------------------------------------ */
(function init() {
    if (Object.keys(Logic.Storage.communities).length === 0) {
        Logic.Community.create("VolcanoChat", "The main lava pit of chaos.", "🌋");
        UI.currentCommunity = "volcanochat";
    } else {
        UI.currentCommunity = Object.keys(Logic.Storage.communities)[0];
    }
})();


/* ============================================================
   SIDEBAR (LEFT SIDE)
============================================================ */
function renderSidebar() {
    const box = el("div", "w-64 rounded-lg shadow-lg p-3 text-sm");
    box.style.background = "rgba(255,255,255,0.9)";
    box.style.color = "#4a1f00";

    const top = el("div", "flex items-center justify-between mb-2");
    top.appendChild(el("h2", "font-bold text-lg text-orange-800", "Volcanoes"));

    const newBtn = el("button",
        "text-xs bg-orange-300 hover:bg-orange-400 px-2 py-1 rounded",
        "+ New");

    newBtn.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first.");
        MsgUI.showCreateCommunity();
    };

    top.appendChild(newBtn);
    box.appendChild(top);

    const search = el("input", "border rounded px-2 py-1 w-full mb-2 text-sm");
    search.placeholder = "Search communities...";
    search.value = UI.communitySearch;
    search.oninput = e => {
        UI.communitySearch = e.target.value;
        renderApp();
    };
    box.appendChild(search);

    box.appendChild(el("h3", "text-xs font-semibold mt-2 mb-1 text-amber-700", "Trending"));

    const tWrap = el("div", "max-h-56 overflow-y-auto");
    const all = Object.values(Logic.Storage.communities);
    const trending = [...all].sort((a, b) => {
        const ca = (Logic.Storage.comments[a.slug] || []).length;
        const cb = (Logic.Storage.comments[b.slug] || []).length;
        return cb - ca;
    });

    trending.forEach(comm => {
        const item = el("div",
            `flex items-center justify-between px-2 py-1 rounded cursor-pointer mb-1
             ${UI.currentCommunity === comm.slug ? "bg-orange-100" : "hover:bg-orange-50"}`);

        item.onclick = () => {
            UI.currentCommunity = comm.slug;
            renderApp();
        };

        const left = el("span", "", `${comm.icon} ${comm.name}`);
        if (comm.verified)
            left.appendChild(el("span", "text-blue-500 text-xs ml-1", "✔"));
        item.appendChild(left);

        const count = (Logic.Storage.comments[comm.slug] || []).length;
        item.appendChild(el("span", "text-[10px] text-gray-500", count.toString()));

        tWrap.appendChild(item);
    });

    box.appendChild(tWrap);

    box.appendChild(el("h3", "text-xs font-semibold mt-3 mb-1 text-amber-700", "All"));

    const allWrap = el("div", "max-h-56 overflow-y-auto");
    const filtered = all.filter(c =>
        c.name.toLowerCase().includes(UI.communitySearch.toLowerCase())
    );

    filtered.forEach(comm => {
        const item = el("div",
            `flex items-center justify-between px-2 py-1 rounded cursor-pointer mb-1
             ${UI.currentCommunity === comm.slug ? "bg-orange-100" : "hover:bg-orange-50"}`);

        item.onclick = () => {
            UI.currentCommunity = comm.slug;
            renderApp();
        };

        const left = el("span", "", `${comm.icon} ${comm.name}`);
        if (comm.verified)
            left.appendChild(el("span", "text-blue-500 text-xs ml-1", "✔"));
        item.appendChild(left);

        allWrap.appendChild(item);
    });

    box.appendChild(allWrap);

    return box;
}


/* ============================================================
   MAIN COLUMN
============================================================ */
function renderMainScreen() {
    const box = el("div", "flex-1 relative");

    const user = Logic.Storage.activeUser;

    if (!user) {
        box.appendChild(renderWelcomePanel());
        if (UI.menu === "login") box.appendChild(renderLoginForm());
        if (UI.menu === "signup") box.appendChild(renderSignupForm());
        return box;
    }

    box.appendChild(renderGreetingHeader());
    box.appendChild(renderRoastPanel());
    box.appendChild(renderCommunityHeader());
    box.appendChild(renderCommentsSection());

    return box;
}


/* ============================================================
   WELCOME PANEL
============================================================ */
function renderWelcomePanel() {
    const wrap = el("div", "mb-4 rounded-lg shadow p-4");
    wrap.style.background = "rgba(255,250,240,0.95)";
    wrap.style.color = "#4a1f00";

    wrap.appendChild(el("h2", "text-2xl mb-2 text-orange-900", "Welcome to VolcanoChat 🌋"));
    wrap.appendChild(el("p", "mb-4",
        "Log in or sign up to join lava communities, post, roast, and moderate chaos."
    ));

    const row = el("div", "flex gap-3");

    const login = el("button",
        "bg-green-300 hover:bg-green-400 px-4 py-2 rounded",
        "Log In");
    login.onclick = () => { UI.menu = "login"; renderApp(); };

    const signup = el("button",
        "bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded",
        "Sign Up");
    signup.onclick = () => { UI.menu = "signup"; renderApp(); };

    row.appendChild(login);
    row.appendChild(signup);
    wrap.appendChild(row);

    return wrap;
}


/* ============================================================
   (REST OF YOUR ORIGINAL FILE — UNCHANGED)
============================================================ */

//
// 🌋 I have NOT modified any functionality below this point.
// Everything else from your original ui.js remains exactly the same.
// To keep this message readable, I did not paste the entire remainder,
// but **you should keep the rest of your existing file exactly as-is**.
//

/* ------------------------------------------------------------
   READY → first render
------------------------------------------------------------ */
renderApp();
