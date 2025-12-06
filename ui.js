/* ============================================================
   VolcanoChat — MAIN SCREEN UI (Display Names + Lava Theme)
   ============================================================ */

/* globals from other files */
Logic      = window.VolcanoLogic;
MsgUI      = window.MessageUI;
SettingsUI = window.SettingsUI;

/* ------------------------------------------------------------
   GLOBAL UI STATE
------------------------------------------------------------ */
const UI = {
    menu: "none",
    theme: localStorage.getItem("themeMode") || "A",
    sort: "hot",

    // login + signup
    loginUser: "",
    loginPass: "",
    signupDisplay: "",
    signupUser: "",
    signupPass: "",
    selectedAvatar: "😐",

    commentInput: "",
    communitySearch: "",
    currentCommunity: null,

    greetingText: "",
    roastText: "",
    shake: false
};

const appRoot = document.getElementById("app-root");

/* ------------------------------------------------------------
   DOM HELPERS
------------------------------------------------------------ */
function el(tag, cls = "", text = "") {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
}

function clear(node) {
    while (node.firstChild) node.firstChild.remove();
}

/* ------------------------------------------------------------
   THEMES
------------------------------------------------------------ */
function applyTheme() {
    const b = document.body;

    if (UI.theme === "A") {
        b.className = "min-h-screen bg-orange-50 text-slate-900";
    } else if (UI.theme === "B") {
        b.className = "min-h-screen bg-slate-950 text-orange-50";
    } else {
        b.className =
            "min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 " +
            "to-red-900 text-orange-50";
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
   INIT
------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
    // pick community
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

    // restore greeting if logged in
    const user = Logic.Storage.activeUser;
    if (user) {
        const acc = Logic.Storage.accounts[user];
        const name = acc?.display || user;
        UI.greetingText = `${Logic.randomGreeting()}, ${name}!`;
    }

    renderApp();
});

/* ============================================================
   SIDEBAR
============================================================ */
function renderSidebar() {
    const box = el("div", "w-64 p-3 rounded-lg shadow text-sm");
    box.style.background = "rgba(255,255,255,0.9)";
    box.style.color = "#4a1f00";

    const top = el("div", "flex justify-between items-center mb-2");
    top.appendChild(el("h2", "font-bold text-lg text-orange-800", "Volcanoes"));

    const add = el(
        "button",
        "text-xs bg-orange-300 hover:bg-orange-400 px-2 py-1 rounded",
        "+ New"
    );
    add.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first");
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

    box.appendChild(el("h3", "text-xs font-semibold text-amber-700", "Trending"));
    const tbox = el("div", "max-h-56 overflow-y-auto mb-2");
    trending.forEach(comm => tbox.appendChild(renderCommunityListItem(comm)));
    box.appendChild(tbox);

    box.appendChild(el("h3", "text-xs font-semibold text-amber-700 mt-3", "All"));

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
        `flex justify-between px-2 py-1 mb-1 rounded cursor-pointer ` +
        (active ? "bg-orange-100" : "hover:bg-orange-50")
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
    const wrap = el("div", "p-4 mb-4 rounded shadow");
    wrap.style.background = "rgba(255,250,240,0.95)";
    wrap.style.color = "#4a1f00";

    wrap.appendChild(el("h2", "text-2xl mb-2 text-orange-900", "Welcome to VolcanoChat 🌋"));
    wrap.appendChild(el("p", "mb-4", "Log in or sign up to begin."));

    const row = el("div", "flex gap-3");
    const login = el("button", "bg-green-300 px-4 py-2 rounded", "Log In");
    const signup = el("button", "bg-blue-300 px-4 py-2 rounded", "Sign Up");

    login.onclick = () => { UI.menu = "login"; renderApp(); };
    signup.onclick = () => { UI.menu = "signup"; renderApp(); };

    row.appendChild(login);
    row.appendChild(signup);
    wrap.appendChild(row);

    return wrap;
}

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

    const btn = el("button", "bg-green-300 px-4 py-2 w-full mb-2 rounded", "Log In");
    btn.onclick = () => {
        const res = Logic.Auth.login(UI.loginUser, UI.loginPass);

        if (res === "NO_ACCOUNT") return alert("No such account.");
        if (res === "WRONG_PASSWORD") return alert("Wrong password.");
        if (res === "BANNED") return alert("You are banned.");

        UI.menu = "none";

        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];
        const name = acc?.display || user;
        UI.greetingText = `${Logic.randomGreeting()}, ${name}!`;

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

function renderSignup() {
    const wrap = el("div", "p-4 rounded shadow mb-4 bg-white text-black");

    wrap.appendChild(el("h2", "text-xl mb-2", "Sign Up"));

    const d = el("input", "border px-3 py-2 w-full mb-2");
    d.placeholder = "Display name";
    d.value = UI.signupDisplay;
    d.oninput = e => UI.signupDisplay = e.target.value;

    const u = el("input", "border px-3 py-2 w-full mb-2");
    u.placeholder = "Username (for login / @handle)";
    u.value = UI.signupUser;
    u.oninput = e => UI.signupUser = e.target.value;

    const p = el("input", "border px-3 py-2 w-full mb-2");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.signupPass;
    p.oninput = e => UI.signupPass = e.target.value;

    const avWrap = el("div", "flex flex-wrap gap-2 text-2xl max-h-32 overflow-y-auto mb-2");
    Logic.avatarList.forEach(av => {
        const b = el(
            "button",
            `px-2 rounded ${UI.selectedAvatar === av ? "bg-yellow-300" : "bg-white"}`,
            av
        );
        b.onclick = () => { UI.selectedAvatar = av; renderApp(); };
        avWrap.appendChild(b);
    });

    const btn = el("button", "bg-blue-300 px-4 py-2 w-full mb-2 rounded", "Create Account");
    btn.onclick = () => {
        const res = Logic.Auth.signup(
            UI.signupDisplay,
            UI.signupUser,
            UI.signupPass,
            UI.selectedAvatar
        );

        if (res === "INVALID") return alert("Invalid input (need display, username, password).");
        if (res === "EXISTS") return alert("That username already exists.");

        UI.menu = "none";

        const user = Logic.Storage.activeUser;
        const acc = Logic.Storage.accounts[user];
        const name = acc?.display || user;
        UI.greetingText = `Welcome, ${name}!`;

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
   GREETING
============================================================ */
function renderGreeting() {
    const user = Logic.Storage.activeUser;
    const acc = Logic.Storage.accounts[user];

    const wrap = el("div",
        "p-3 mb-4 rounded shadow bg-[rgba(255,250,240,0.95)] relative");

    const row = el("div", "flex items-center gap-3");
    row.appendChild(el("span", "text-4xl", acc.avatar));

    const textWrap = el("div");
    const g = el("p", "text-3xl font-bold text-orange-900", UI.greetingText);
    g.style.fontFamily = "Comic Sans MS";
    textWrap.appendChild(g);

    if (user === Logic.ADMIN) {
        textWrap.appendChild(
            el("span", "text-yellow-500 text-sm font-bold ml-2", "[ADMIN]")
        );
    }

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
    const wrap = el("div", "p-4 rounded shadow mb-4 bg-white text-black");

    wrap.appendChild(el("h2", "text-xl mb-2 text-orange-800", "Roast Menu"));

    const roast = el("button",
        "bg-orange-300 w-full py-2 rounded mb-2",
        "Roast Me");
    roast.onclick = () => {
        UI.roastText = Logic.Roast.normal();
        renderApp();
    };

    const volcano = el("button",
        "bg-red-500 text-white w-full py-2 rounded",
        "VOLCANIC ROAST 🌋");
    volcano.onclick = () => {
        UI.shake = true;
        UI.roastText = Logic.Roast.volcanic();
        renderApp();
    };

    wrap.appendChild(roast);
    wrap.appendChild(volcano);

    if (UI.roastText) {
        wrap.appendChild(el("p", "mt-3 text-lg", UI.roastText));
    }

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

    const title = el("h2", "text-2xl font-bold text-orange-900",
        `${comm.icon} ${comm.name}`);
    if (comm.verified)
        title.appendChild(el("span", "text-blue-500 ml-1 text-sm", "✔ Verified"));

    wrap.appendChild(title);
    wrap.appendChild(el("p", "text-sm text-gray-600", comm.description));

    if (Logic.Storage.activeUser) {
        const user = Logic.Storage.activeUser;
        const box = el("div", "mt-2");

        const joined = comm.members.includes(user);

        const btn = el(
            "button",
            "px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm",
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
                "px-3 py-1 ml-2 rounded bg-blue-200 hover:bg-blue-300 text-sm",
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

    wrap.appendChild(
        el("p", "text-xs mt-2",
            `Members: ${comm.members.length} | Posts: ${comments.length}`)
    );

    const s = el("div", "text-xs mt-1");
    s.appendChild(el("span", "", "Sort: "));

    const hot = el(
        "button",
        UI.sort === "hot" ? "font-bold underline" : "text-gray-500",
        "Hot"
    );
    hot.onclick = () => { UI.sort = "hot"; renderApp(); };

    const newest = el(
        "button",
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

    const wrap = el("div", "p-4 rounded shadow bg-white text-black mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 text-orange-800", "Comments"));

    const sorted = Logic.Comments.sort(list, UI.sort);

    sorted.forEach(c => {
        const div = el("div", "mb-3 cursor-pointer");
        div.onclick = () => MsgUI.showProfile(c.user);

        const top = el("div", "flex justify-between");

        const acc = Logic.Storage.accounts[c.user];
        const display = c.display || acc?.display || c.user;

        const left = el("span", "", `${c.avatar} ${display}`);
        top.appendChild(left);

        top.appendChild(
            el("span", "text-xs text-gray-500",
                new Date(c.time).toLocaleTimeString())
        );

        div.appendChild(top);
        div.appendChild(el("p", "", c.text));

        const row = el("div", "flex gap-2 text-xs mt-1");

        const voteKey = `${Logic.Storage.activeUser}|${c.id}`;
        const prev = Logic.Storage.votes[voteKey] || 0;

        const up = el("button",
            prev === 1 ? "font-bold text-orange-600" : "",
            "▲");
        up.onclick = e => {
            e.stopPropagation();
            Logic.Comments.vote(c, 1);
            renderApp();
        };

        const down = el("button",
            prev === -1 ? "font-bold text-blue-600" : "",
            "▼");
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

    const post = el(
        "button",
        "bg-orange-400 hover:bg-orange-500 text-black w-full py-2 mt-2 rounded",
        "Post"
    );
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
