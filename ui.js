/* ============================================================
   VolcanoChat — MAIN SCREEN UI (DISPLAY NAME + DESCRIPTION)
   ============================================================ */

/* ------------------------------------------------------------
   GLOBAL IMPORTS
------------------------------------------------------------ */
Logic = window.VolcanoLogic;
MsgUI = window.MessageUI;
SettingsUI = window.SettingsUI;

/* ------------------------------------------------------------
   GLOBAL UI STATE
------------------------------------------------------------ */
const UI = {
    menu: "none",
    theme: localStorage.getItem("themeMode") || "A",
    sort: "hot",

    // signup fields
    signupDisplay: "",
    signupUser: "",
    signupPass: "",
    selectedAvatar: "😀",

    // login fields
    loginUser: "",
    loginPass: "",

    // comments
    commentInput: "",

    // community
    communitySearch: "",
    currentCommunity: null,

    // greeting
    greetingText: "",
    shake: false,

    roastText: ""
};

const appRoot = document.getElementById("app-root");

/* ------------------------------------------------------------
   DOM HELPERS
------------------------------------------------------------ */
function el(t, cls = "", txt = "") {
    const e = document.createElement(t);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
}

function clear(n) {
    while (n.firstChild) n.firstChild.remove();
}

/* ------------------------------------------------------------
   THEMING (More Orange)
------------------------------------------------------------ */
function applyTheme() {
    const b = document.body;

    if (UI.theme === "A") {
        b.className =
            "min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-100 text-slate-900";
    } else if (UI.theme === "B") {
        b.className =
            "min-h-screen bg-slate-950 text-orange-200";
    } else {
        b.className =
            "min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-700 text-orange-50";
    }

    if (UI.shake) {
        b.classList.add("shake");
        setTimeout(() => b.classList.remove("shake"), 600);
        UI.shake = false;
    }
}

/* ------------------------------------------------------------
   MAIN RENDER FUNCTION
------------------------------------------------------------ */
function renderApp() {
    applyTheme();
    clear(appRoot);

    const wrap = el("div", "max-w-5xl mx-auto w-full flex gap-6 p-4");
    appRoot.appendChild(wrap);

    wrap.appendChild(renderSidebar());
    wrap.appendChild(renderMainScreen());

    // overlays
    MsgUI.render();
    SettingsUI.render();
}

/* ------------------------------------------------------------
   INITIALIZATION
------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
    if (!Logic.Storage.communities || Object.keys(Logic.Storage.communities).length === 0) {
        Logic.Community.create("VolcanoChat", "The main lava pit of chaos.", "🌋");
        UI.currentCommunity = "volcanochat";
    } else {
        UI.currentCommunity = Object.keys(Logic.Storage.communities)[0];
    }

    if (Logic.Storage.activeUser) {
        const u = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[u];
        UI.greetingText = `${Logic.randomGreeting()}, ${acc.display}!`;
    }

    renderApp();
});

/* ============================================================
   SIDEBAR
============================================================ */
function renderSidebar() {
    const box = el("div", "w-64 p-3 rounded-lg shadow text-sm");
    box.style.background = "rgba(255,230,200,0.8)";
    box.style.color = "#4a1f00";

    const top = el("div", "flex justify-between items-center mb-2");
    top.appendChild(el("h2", "font-bold text-lg text-orange-800", "Volcanoes"));

    const add = el("button",
        "text-xs bg-orange-400 hover:bg-orange-500 px-2 py-1 rounded",
        "+ New"
    );
    add.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first");
        MsgUI.showCreateCommunity();
    };

    top.appendChild(add);
    box.appendChild(top);

    // search
    const search = el("input", "border rounded px-2 py-1 w-full mb-2");
    search.placeholder = "Search...";
    search.value = UI.communitySearch;
    search.oninput = e => {
        UI.communitySearch = e.target.value;
        renderApp();
    };
    box.appendChild(search);

    const all = Object.values(Logic.Storage.communities);

    // trending
    box.appendChild(el("h3", "text-xs font-semibold text-orange-700", "Trending"));
    const trending = [...all].sort(
        (a, b) =>
            (Logic.Storage.comments[b.slug] || []).length -
            (Logic.Storage.comments[a.slug] || []).length
    );

    const tbox = el("div", "max-h-56 overflow-y-auto mb-2");
    trending.forEach(c => tbox.appendChild(renderCommunityListItem(c)));
    box.appendChild(tbox);

    // all
    box.appendChild(el("h3", "text-xs font-semibold text-orange-700 mt-3", "All"));
    const filtered = all.filter(c =>
        c.name.toLowerCase().includes(UI.communitySearch.toLowerCase())
    );

    const abox = el("div", "max-h-56 overflow-y-auto");
    filtered.forEach(c => abox.appendChild(renderCommunityListItem(c)));
    box.appendChild(abox);

    return box;
}

function renderCommunityListItem(comm) {
    const active = UI.currentCommunity === comm.slug;

    const div = el(
        "div",
        `flex justify-between px-2 py-1 mb-1 rounded cursor-pointer ${active ? "bg-orange-200" : "hover:bg-orange-100"}`
    );

    div.onclick = () => {
        UI.currentCommunity = comm.slug;
        renderApp();
    };

    div.appendChild(el("span", "", `${comm.icon} ${comm.name}`));
    return div;
}

/* ============================================================
   MAIN SCREEN
============================================================ */
function renderMainScreen() {
    const user = Logic.Storage.activeUser;

    const box = el("div", "flex-1");

    if (!user) {
        box.appendChild(renderWelcome());
        if (UI.menu === "login") box.appendChild(renderLogin());
        if (UI.menu === "signup") box.appendChild(renderSignup());
        return box;
    }

    box.appendChild(renderGreeting());
    box.appendChild(renderRoastPanel());     // NOW BUILT-IN HERE 🔥
    box.appendChild(renderCommunityHeader());
    box.appendChild(renderCommentsSection());

    return box;
}

/* ============================================================
   WELCOME / LOGIN / SIGNUP
============================================================ */
function renderWelcome() {
    const wrap = el("div", "p-4 mb-4 rounded shadow");
    wrap.style.background = "rgba(255,240,200,0.95)";

    wrap.appendChild(el("h2", "text-2xl mb-2 text-orange-900", "Welcome to VolcanoChat 🌋"));
    wrap.appendChild(el("p", "mb-4", "Log in or sign up to begin."));

    const row = el("div", "flex gap-3");
    const login = el("button", "bg-orange-400 px-4 py-2 rounded", "Log In");
    const signup = el("button", "bg-orange-500 text-white px-4 py-2 rounded", "Sign Up");

    login.onclick = () => { UI.menu = "login"; renderApp(); };
    signup.onclick = () => { UI.menu = "signup"; renderApp(); };

    row.appendChild(login);
    row.appendChild(signup);
    wrap.appendChild(row);

    return wrap;
}

/* ---------------- LOGIN ---------------- */
function renderLogin() {
    const wrap = el("div", "p-4 rounded shadow mb-4 bg-white text-black");

    wrap.appendChild(el("h2", "text-xl mb-2", "Log In"));

    const u = el("input", "border px-3 py-2 w-full mb-2");
    u.placeholder = "Username";
    u.value = UI.loginUser;
    u.oninput = e => UI.loginUser = e.target.value;

    const p = el("input", "border px-3 py-2 w-full mb-2");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.loginPass;
    p.oninput = e => UI.loginPass = e.target.value;

    const btn = el("button", "bg-orange-400 px-4 py-2 w-full mb-2 rounded", "Log In");
    btn.onclick = () => {
        const res = Logic.Auth.login(UI.loginUser, UI.loginPass);

        if (res === "NO_ACCOUNT") return alert("No such account.");
        if (res === "WRONG_PASSWORD") return alert("Wrong password.");
        if (res === "BANNED") return alert("You are banned.");

        UI.menu = "none";

        const uname = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[uname];

        UI.greetingText = `${Logic.randomGreeting()}, ${acc.display}!`;
        renderApp();
    };

    const back = el("button", "bg-gray-300 px-4 py-2 w-full rounded", "Back");
    back.onclick = () => { UI.menu = "none"; renderApp(); };

    wrap.appendChild(u);
    wrap.appendChild(p);
    wrap.appendChild(btn);
    wrap.appendChild(back);
    return wrap;
}

/* ---------------- SIGNUP ---------------- */
function renderSignup() {
    const wrap = el("div", "p-4 rounded shadow mb-4 bg-white text-black");

    wrap.appendChild(el("h2", "text-xl mb-2", "Sign Up"));

    const d = el("input", "border px-3 py-2 w-full mb-2");
    d.placeholder = "Display Name";
    d.value = UI.signupDisplay;
    d.oninput = e => UI.signupDisplay = e.target.value;

    const u = el("input", "border px-3 py-2 w-full mb-2");
    u.placeholder = "Username";
    u.value = UI.signupUser;
    u.oninput = e => UI.signupUser = e.target.value;

    const p = el("input", "border px-3 py-2 w-full mb-2");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.signupPass;
    p.oninput = e => UI.signupPass = e.target.value;

    const avWrap = el("div", "flex flex-wrap gap-2 text-2xl max-h-32 overflow-y-auto mb-2");
    Logic.avatarList.forEach(av => {
        const b = el("button",
            `px-2 rounded ${UI.selectedAvatar === av ? "bg-orange-400" : "bg-white"}`,
            av
        );
        b.onclick = () => { UI.selectedAvatar = av; renderApp(); };
        avWrap.appendChild(b);
    });

    const btn = el("button", "bg-orange-500 text-white px-4 py-2 w-full mb-2 rounded", "Sign Up");
    btn.onclick = () => {
        const res = Logic.Auth.signup(
            UI.signupDisplay,
            UI.signupUser,
            UI.signupPass,
            UI.selectedAvatar
        );

        if (res === "INVALID") return alert("Invalid input.");
        if (res === "EXISTS") return alert("Account exists.");

        const acc = Logic.Storage.accounts[Logic.Storage.activeUser];

        UI.greetingText = `Welcome, ${acc.display}!`;
        UI.menu = "none";

        renderApp();
    };

    const back = el("button", "bg-gray-300 px-4 py-2 w-full rounded", "Back");
    back.onclick = () => { UI.menu = "none"; renderApp(); };

    wrap.appendChild(d);
    wrap.appendChild(u);
    wrap.appendChild(p);
    wrap.appendChild(avWrap);
    wrap.appendChild(btn);
    wrap.appendChild(back);

    return wrap;
}

/* ============================================================
   GREETING HEADER
============================================================ */
function renderGreeting() {
    const user = Logic.Storage.activeUser;
    const acc = Logic.Storage.accounts[user];

    const wrap = el("div", "p-3 mb-4 rounded shadow bg-orange-100 relative");

    const row = el("div", "flex items-center gap-3");
    row.appendChild(el("span", "text-4xl", acc.avatar));

    const textWrap = el("div");
    const g = el("p", "text-3xl font-bold text-orange-900", UI.greetingText);
    g.style.fontFamily = "Comic Sans MS";
    textWrap.appendChild(g);

    row.appendChild(textWrap);
    wrap.appendChild(row);

    // buttons
    const icons = el("div", "absolute right-3 top-3 flex gap-3");

    const bell = el("button", "text-3xl", "🔔");
    bell.onclick = () => MsgUI.showNotifications();

    const gear = el("button", "text-4xl", "⚙️");
    gear.onclick = () => SettingsUI.show();

    icons.appendChild(bell);
    icons.appendChild(gear);
    wrap.appendChild(icons);

    return wrap;
}

/* ============================================================
   ROAST PANEL
============================================================ */
function renderRoastPanel() {
    const wrap = el("div", "p-4 rounded shadow mb-4 bg-white text-black");

    wrap.appendChild(el("h2", "text-xl mb-2 text-orange-800", "Roast Menu"));

    const roast = el("button", "bg-orange-400 w-full py-2 rounded mb-2", "Roast Me");
    roast.onclick = () => {
        UI.roastText = Logic.Roast.normal();
        renderApp();
    };

    const volcano = el("button", "bg-red-500 text-white w-full py-2 rounded", "VOLCANIC ROAST 🌋");
    volcano.onclick = () => {
        UI.shake = true;
        UI.roastText = Logic.Roast.volcanic();
        renderApp();
    };

    wrap.appendChild(roast);
    wrap.appendChild(volcano);

    if (UI.roastText)
        wrap.appendChild(el("p", "mt-3 text-lg", UI.roastText));

    return wrap;
}

/* ============================================================
   COMMUNITY HEADER
============================================================ */
function renderCommunityHeader() {
    const slug = UI.currentCommunity;
    const comm = Logic.Storage.communities[slug];
    const comments = Logic.Storage.comments[slug] || [];

    const wrap = el("div", "p-4 rounded shadow mb-3 bg-white text-black");

    const title = el("h2", "text-2xl font-bold text-orange-900", `${comm.icon} ${comm.name}`);
    wrap.appendChild(title);

    wrap.appendChild(el("p", "text-sm text-gray-600", comm.description));

    // join/leave
    if (Logic.Storage.activeUser) {
        const user = Logic.Storage.activeUser;
        const joined = comm.members.includes(user);

        const box = el("div", "mt-2");

        const btn = el(
            "button",
            "px-3 py-1 rounded bg-orange-200 hover:bg-orange-300 text-sm",
            joined ? "Leave" : "Join"
        );

        btn.onclick = () => {
            if (joined) Logic.Community.leave(slug);
            else Logic.Community.join(slug);
            renderApp();
        };

        box.appendChild(btn);
        wrap.appendChild(box);
    }

    wrap.appendChild(
        el("p", "text-xs mt-2", `Members: ${comm.members.length} | Posts: ${comments.length}`)
    );

    // sorting
    const s = el("div", "text-xs mt-1");
    s.appendChild(el("span", "", "Sort: "));

    const hot = el("button", UI.sort === "hot" ? "font-bold underline" : "text-gray-500", "Hot");
    hot.onclick = () => { UI.sort = "hot"; renderApp(); };

    const newest = el("button",
        UI.sort === "new" ? "font-bold underline ml-1" : "text-gray-500 ml-1",
        "New"
    );
    newest.onclick = () => { UI.sort = "new"; renderApp(); };

    s.appendChild(hot);
    s.appendChild(newest);

    wrap.appendChild(s);
    return wrap;
}

/* ============================================================
   COMMENTS SECTION
============================================================ */
function renderCommentsSection() {
    const slug = UI.currentCommunity;
    const list = Logic.Storage.comments[slug] || [];
    const sorted = Logic.Comments.sort(list, UI.sort);

    const wrap = el("div", "p-4 rounded shadow bg-white text-black mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 text-orange-800", "Comments"));

    sorted.forEach(c => {
        const div = el("div", "mb-3 cursor-pointer");
        div.onclick = () => MsgUI.showProfile(c.user);

        const top = el("div", "flex justify-between");
        top.appendChild(el("span", "", `${c.avatar} ${c.display}`));
        top.appendChild(el("span", "text-xs text-gray-500",
            new Date(c.time).toLocaleTimeString()
        ));

        div.appendChild(top);
        div.appendChild(el("p", "", c.text));

        // voting
        const row = el("div", "flex gap-2 text-xs mt-1");

        const voteKey = `${Logic.Storage.activeUser}|${c.id}`;
        const prev = Logic.Storage.votes[voteKey] || 0;

        const up = el("button", prev === 1 ? "font-bold text-orange-600" : "", "▲");
        up.onclick = e => {
            e.stopPropagation();
            Logic.Comments.vote(c, 1);
            renderApp();
        };

        const down = el("button", prev === -1 ? "font-bold text-blue-600" : "", "▼");
        down.onclick = e => {
            e.stopPropagation();
            Logic.Comments.vote(c, -1);
            renderApp();
        };

        row.appendChild(up);
        row.appendChild(el("span", "", c.score || 0));
        row.appendChild(down);

        div.appendChild(row);
        wrap.appendChild(div);
    });

    // post input
    const input = el("input", "border rounded px-3 py-2 w-full mt-3");
    input.placeholder = "Write a comment...";
    input.value = UI.commentInput;
    input.oninput = e => UI.commentInput = e.target.value;

    const post = el("button", "bg-orange-400 w-full py-2 mt-2 rounded", "Post");
    post.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first");
        Logic.Comments.post(slug, UI.commentInput);
        UI.commentInput = "";
        renderApp();
    };

    wrap.appendChild(input);
    wrap.appendChild(post);

    return wrap;
}
