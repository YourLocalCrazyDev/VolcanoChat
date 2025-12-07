/* ============================================================
   VolcanoChat — MAIN UI SYSTEM (FULL ORANGE THEME VERSION)
============================================================ */

let Logic = window.VolcanoLogic;
let MsgUI = window.MessageUI;
let SettingsUI = window.SettingsUI;

/* ------------------------------------------------------------
   UI STATE
------------------------------------------------------------ */
const UI = {
    menu: "none",
    theme: localStorage.getItem("themeMode") || "A",
    sort: "hot",

    // login + signup fields
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
    greetingText: "",
    shake: false,

    // roast
    roastText: ""
};

const appRoot = document.getElementById("app-root");

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */
function el(tag, cls = "", text = "") {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
}

function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

/* ------------------------------------------------------------
   THEMING — UPDATED FULL ORANGE THEME
------------------------------------------------------------ */
function applyTheme() {
    const b = document.body;

    if (UI.theme === "A") {
        b.className =
            "min-h-screen text-slate-900 " +
            "bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300";

        document.documentElement.style.setProperty("--panel-bg", "rgba(255,240,225,0.95)");
        document.documentElement.style.setProperty("--panel-border", "#ffb36b");
        document.documentElement.style.setProperty("--panel-shadow", "rgba(255,150,80,0.35)");
        document.documentElement.style.setProperty("--btn-orange", "#ff8c42");
        document.documentElement.style.setProperty("--btn-orange-hover", "#ff7a1f");
        document.documentElement.style.setProperty("--accent-orange", "#ff6a00");
    }

    else if (UI.theme === "B") {
        b.className = "min-h-screen bg-slate-950 text-orange-50";
    }

    else {
        b.className =
            "min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 text-orange-50";
    }

    if (UI.shake) {
        b.classList.add("shake");
        setTimeout(() => b.classList.remove("shake"), 600);
        UI.shake = false;
    }
}

/* ------------------------------------------------------------
   MAIN RENDER
------------------------------------------------------------ */
function renderApp() {
    applyTheme();
    clear(appRoot);

    const wrap = el("div", "max-w-5xl mx-auto w-full flex gap-6 p-4");
    appRoot.appendChild(wrap);

    wrap.appendChild(renderSidebar());
    wrap.appendChild(renderMainScreen());

    MsgUI.render();
    SettingsUI.render();
}

/* ------------------------------------------------------------
   INITIAL LOAD
------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {

    if (!Logic.Storage.communities ||
        Object.keys(Logic.Storage.communities).length === 0) {

        Logic.Community.create(
            "VolcanoChat",
            "The main lava pit of chaos.",
            "🌋"
        );

        UI.currentCommunity = "volcanochat";
    } else {
        UI.currentCommunity = Object.keys(Logic.Storage.communities)[0];
    }

    if (Logic.Storage.activeUser) {
        UI.greetingText =
            `${Logic.randomGreeting()}, ${Logic.Storage.activeUser}!`;
    }

    renderApp();
});

/* ============================================================
   SIDEBAR
============================================================ */
function renderSidebar() {
    const box = el("div", "w-64 p-3 rounded-lg shadow text-sm card");

    const top = el("div", "flex justify-between items-center mb-2");
    top.appendChild(el("h2", "font-bold text-lg orange-title", "Volcanoes"));

    const add = el(
        "button",
        "btn-orange px-2 py-1 rounded text-xs",
        "+ New"
    );
    add.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first!");
        MsgUI.showCreateCommunity();
    };

    top.appendChild(add);
    box.appendChild(top);

    const search = el("input", "border rounded px-2 py-1 w-full mb-2");
    search.placeholder = "Search...";
    search.value = UI.communitySearch;
    search.oninput = e => {
        UI.communitySearch = e.target.value;
        renderApp();
    };
    box.appendChild(search);

    const all = Object.values(Logic.Storage.communities);
    const trending = [...all].sort(
        (a, b) =>
            (Logic.Storage.comments[b.slug] || []).length -
            (Logic.Storage.comments[a.slug] || []).length
    );

    box.appendChild(el("h3", "text-xs font-semibold mb-1 orange-title", "Trending"));

    const tbox = el("div", "max-h-56 overflow-y-auto mb-2");
    trending.forEach(comm => {
        tbox.appendChild(renderCommunityListItem(comm));
    });
    box.appendChild(tbox);

    box.appendChild(el("h3", "text-xs font-semibold mb-1 orange-title", "All Volcanoes"));

    const abox = el("div", "max-h-56 overflow-y-auto");
    const filtered = all.filter(c =>
        c.name.toLowerCase().includes(UI.communitySearch.toLowerCase())
    );
    filtered.forEach(comm => abox.appendChild(renderCommunityListItem(comm)));

    box.appendChild(abox);
    return box;
}

function renderCommunityListItem(comm) {
    const active = UI.currentCommunity === comm.slug;

    const div = el(
        "div",
        `flex justify-between px-2 py-1 mb-1 rounded cursor-pointer 
         ${active ? "bg-orange-200" : "hover:bg-orange-100"}`
    );

    div.onclick = () => {
        UI.currentCommunity = comm.slug;
        renderApp();
    };

    const left = el("span", "", `${comm.icon} ${comm.name}`);
    if (comm.verified)
        left.appendChild(el("span", "text-blue-500 text-xs ml-1", "✔"));

    div.appendChild(left);
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
    box.appendChild(renderRoastPanel());
    box.appendChild(renderCommunityHeader());
    box.appendChild(renderCommentsSection());
    return box;
}

/* ============================================================
   WELCOME / LOGIN / SIGNUP
============================================================ */
function renderWelcome() {
    const wrap = el("div", "card mb-4");

    wrap.appendChild(el("h2", "text-2xl mb-2 orange-title", "Welcome to VolcanoChat 🌋"));
    wrap.appendChild(el("p", "mb-4", "Log in or sign up to begin."));

    const row = el("div", "flex gap-3");
    const login = el("button", "btn-orange px-4 py-2 rounded", "Log In");
    const signup = el("button", "btn-orange px-4 py-2 rounded", "Sign Up");

    login.onclick = () => { UI.menu = "login"; renderApp(); };
    signup.onclick = () => { UI.menu = "signup"; renderApp(); };

    row.appendChild(login);
    row.appendChild(signup);
    wrap.appendChild(row);

    return wrap;
}

/* login form */
function renderLogin() {
    const wrap = el("div", "card mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 orange-title", "Log In"));

    const u = el("input", "border px-3 py-2 w-full mb-2");
    u.placeholder = "Username";
    u.value = UI.loginUser;
    u.oninput = e => UI.loginUser = e.target.value;

    const p = el("input", "border px-3 py-2 w-full mb-2");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.loginPass;
    p.oninput = e => UI.loginPass = e.target.value;

    const btn = el("button", "btn-orange w-full py-2 rounded mb-2", "Log In");
    btn.onclick = () => {
        const r = Logic.Auth.login(UI.loginUser, UI.loginPass);
        if (r === "NO_ACCOUNT") return alert("No such account.");
        if (r === "WRONG_PASSWORD") return alert("Wrong password.");
        if (r === "BANNED") return alert("You are banned.");

        UI.menu = "none";
        UI.greetingText = `${Logic.randomGreeting()}, ${Logic.Storage.activeUser}!`;
        renderApp();
    };

    const back = el("button", "px-4 py-2 w-full rounded bg-gray-300", "Back");
    back.onclick = () => { UI.menu = "none"; renderApp(); };

    wrap.appendChild(u);
    wrap.appendChild(p);
    wrap.appendChild(btn);
    wrap.appendChild(back);

    return wrap;
}

/* signup form */
function renderSignup() {
    const wrap = el("div", "card mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 orange-title", "Sign Up"));

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
            `px-2 rounded ${UI.selectedAvatar === av ? "bg-orange-300" : "bg-white"}`,
            av
        );
        b.onclick = () => { UI.selectedAvatar = av; renderApp(); };
        avWrap.appendChild(b);
    });

    const btn = el("button", "btn-orange w-full py-2 rounded mb-2", "Sign Up");
    btn.onclick = () => {
        const res = Logic.Auth.signup(UI.signupUser, UI.signupPass, UI.selectedAvatar);

        if (res === "INVALID") return alert("Invalid input.");
        if (res === "EXISTS") return alert("Account exists.");

        UI.menu = "none";
        UI.greetingText = `Welcome, ${Logic.Storage.activeUser}!`;
        renderApp();
    };

    const back = el("button", "px-4 py-2 w-full rounded bg-gray-300", "Back");
    back.onclick = () => { UI.menu = "none"; renderApp(); };

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

    const wrap = el("div", "card relative mb-4");

    const row = el("div", "flex items-center gap-3");
    row.appendChild(el("span", "text-4xl", acc.avatar));

    const textWrap = el("div");
    const g = el("p", "text-3xl font-bold orange-title", UI.greetingText);
    textWrap.appendChild(g);

    if (user === Logic.ADMIN)
        textWrap.appendChild(
            el("span", "text-yellow-500 text-sm font-bold ml-2", "[ADMIN]")
        );

    row.appendChild(textWrap);
    wrap.appendChild(row);

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
    const wrap = el("div", "card mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 orange-title", "Roast Menu"));

    const roast = el("button", "btn-orange w-full py-2 rounded mb-2", "Roast Me");
    roast.onclick = () => {
        UI.roastText = Logic.Roast.normal();
        renderApp();
    };

    const volcano = el(
        "button",
        "bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded",
        "VOLCANIC ROAST 🌋"
    );
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

    const wrap = el("div", "card mb-3");

    const title = el("h2", "text-2xl font-bold orange-title", `${comm.icon} ${comm.name}`);
    if (comm.verified)
        title.appendChild(el("span", "text-blue-500 ml-1 text-sm", "✔ Verified"));

    wrap.appendChild(title);
    wrap.appendChild(el("p", "text-sm opacity-80", comm.description));

    if (Logic.Storage.activeUser) {
        const user = Logic.Storage.activeUser;
        const box = el("div", "mt-2");

        const joined = comm.members.includes(user);

        const btn = el(
            "button",
            "bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm",
            joined ? "Leave" : "Join"
        );

        btn.onclick = () => {
            if (joined) Logic.Community.leave(slug);
            else Logic.Community.join(slug);
            renderApp();
        };

        box.appendChild(btn);

        if (user === Logic.ADMIN) {
            const v = el(
                "button",
                "bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded text-sm ml-2",
                comm.verified ? "Unverify" : "Verify"
            );
            v.onclick = () => {
                Logic.Community.toggleVerified(slug);
                renderApp();
            };
            box.appendChild(v);
        }

        wrap.appendChild(box);
    }

    wrap.appendChild(el("p", "text-xs mt-2 opacity-70",
        `Members: ${comm.members.length} | Posts: ${comments.length}`
    ));

    const s = el("div", "text-xs mt-1");
    s.appendChild(el("span", "", "Sort: "));

    const hot = el(
        "button",
        UI.sort === "hot" ? "font-bold underline" : "opacity-60",
        "Hot"
    );
    hot.onclick = () => { UI.sort = "hot"; renderApp(); };

    const newest = el(
        "button",
        UI.sort === "new" ? "font-bold underline ml-1" : "opacity-60 ml-1",
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

    const wrap = el("div", "card mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 orange-title", "Comments"));

    const sorted = Logic.Comments.sort(list, UI.sort);

    sorted.forEach(c => {
        const div = el("div", "mb-3 cursor-pointer");
        div.onclick = () => MsgUI.showProfile(c.user);

        const top = el("div", "flex justify-between");
        const userDisplay = Logic.Storage.accounts[c.user]?.display || c.user;

        top.appendChild(el("span", "", `${c.avatar} ${userDisplay}`));
        top.appendChild(el("span", "text-xs opacity-60",
            new Date(c.time).toLocaleTimeString()
        ));

        div.appendChild(top);
        div.appendChild(el("p", "", c.text));

        const row = el("div", "flex gap-2 text-xs mt-1");

        const voteKey = `${Logic.Storage.activeUser}|${c.id}`;
        const prev = Logic.Storage.votes[voteKey] || 0;

        const up = el("button", prev === 1 ? "font-bold text-orange-700" : "", "▲");
        up.onclick = e => {
            e.stopPropagation();
            Logic.Comments.vote(c, 1);
            renderApp();
        };

        const down = el("button", prev === -1 ? "font-bold text-blue-700" : "", "▼");
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

    const input = el("input", "border rounded px-3 py-2 w-full mt-3");
    input.placeholder = "Write a comment...";
    input.value = UI.commentInput;
    input.oninput = e => UI.commentInput = e.target.value;

    const post = el("button", "btn-orange w-full py-2 mt-2 rounded", "Post");
    post.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first!");
        Logic.Comments.post(slug, UI.commentInput);
        UI.commentInput = "";
        renderApp();
    };

    wrap.appendChild(input);
    wrap.appendChild(post);

    return wrap;
}

/* ============================================================
   EXPORT
============================================================ */
window.renderApp = renderApp;
