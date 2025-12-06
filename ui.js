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

const Logic = window.VolcanoLogic;
const MsgUI = window.MessageUI;     // message.js overlays
const SettingsUI = window.SettingsUI; // settings.js overlays

/* ------------------------------------------------------------
   UI STATE (only main-screen things go here)
------------------------------------------------------------ */
const UI = {
    menu: "none",            // none | login | signup
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
    const box = el("div",
        "w-64 rounded-lg shadow-lg p-3 text-sm");
    box.style.background = "rgba(255,255,255,0.9)";
    box.style.color = "#4a1f00";

    // top row
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

    // search bar
    const search = el("input", "border rounded px-2 py-1 w-full mb-2 text-sm");
    search.placeholder = "Search communities...";
    search.value = UI.communitySearch;
    search.oninput = e => {
        UI.communitySearch = e.target.value;
        renderApp();
    };
    box.appendChild(search);

    // trending
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

    // ALL list
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

    // not logged in → show login/signup panel
    if (!user) {
        box.appendChild(renderWelcomePanel());
        if (UI.menu === "login") box.appendChild(renderLoginForm());
        if (UI.menu === "signup") box.appendChild(renderSignupForm());
        return box;
    }

    // logged in → greeting, roast
    box.appendChild(renderGreetingHeader());
    box.appendChild(renderRoastPanel());
    box.appendChild(renderCommunityHeader());
    box.appendChild(renderCommentsSection());

    return box;
}


/* ============================================================
   WELCOME PANEL (WHEN LOGGED OUT)
============================================================ */
function renderWelcomePanel() {
    const wrap = el("div",
        "mb-4 rounded-lg shadow p-4",
    );
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
   LOGIN FORM
============================================================ */
function renderLoginForm() {
    const wrap = el("div", "bg-white rounded shadow p-4 mb-4 text-black");

    wrap.appendChild(el("h2", "text-xl mb-2", "Log In"));

    const u = el("input", "border rounded px-3 py-2 w-full mb-2");
    u.placeholder = "Username";
    u.value = UI.loginUser;
    u.oninput = e => UI.loginUser = e.target.value;
    wrap.appendChild(u);

    const p = el("input", "border rounded px-3 py-2 w-full mb-2");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.loginPass;
    p.oninput = e => UI.loginPass = e.target.value;
    wrap.appendChild(p);

    const btn = el("button",
        "bg-green-300 hover:bg-green-400 px-4 py-2 rounded w-full mb-2",
        "Log In");
    btn.onclick = () => {
        const res = Logic.Auth.login(UI.loginUser, UI.loginPass);

        if (res === "NO_ACCOUNT") return alert("No such account.");
        if (res === "WRONG_PASSWORD") return alert("Wrong password.");
        if (res === "BANNED") return alert("You are banned.");

        UI.menu = "none";
        UI.greetingText = `${Logic.randomGreeting()}, ${Logic.Storage.activeUser}!`;
        renderApp();
    };
    wrap.appendChild(btn);

    const back = el("button",
        "bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded w-full",
        "Back");
    back.onclick = () => { UI.menu = "none"; renderApp(); };
    wrap.appendChild(back);

    return wrap;
}


/* ============================================================
   SIGNUP FORM
============================================================ */
function renderSignupForm() {
    const wrap = el("div", "bg-white rounded shadow p-4 mb-4 text-black");

    wrap.appendChild(el("h2", "text-xl mb-2", "Sign Up"));

    const u = el("input", "border rounded px-3 py-2 w-full mb-2");
    u.placeholder = "Create Username";
    u.value = UI.signupUser;
    u.oninput = e => UI.signupUser = e.target.value;
    wrap.appendChild(u);

    const p = el("input", "border rounded px-3 py-2 w-full mb-2");
    p.placeholder = "Create Password";
    p.type = "password";
    p.value = UI.signupPass;
    p.oninput = e => UI.signupPass = e.target.value;
    wrap.appendChild(p);

    wrap.appendChild(el("p", "mb-1", "Choose Avatar:"));

    const avBox = el("div", "flex flex-wrap gap-2 text-2xl max-h-32 overflow-y-auto mb-2");
    Logic.avatarList.forEach(av => {
        const b = el("button",
            `px-2 rounded ${UI.selectedAvatar === av ? "bg-yellow-300" : "bg-white"}`);
        b.textContent = av;
        b.onclick = () => { UI.selectedAvatar = av; renderApp(); };
        avBox.appendChild(b);
    });
    wrap.appendChild(avBox);

    const btn = el("button",
        "bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded w-full mb-2",
        "Sign Up");
    btn.onclick = () => {
        const res = Logic.Auth.signup(UI.signupUser, UI.signupPass, UI.selectedAvatar);

        if (res === "INVALID") return alert("Invalid input.");
        if (res === "EXISTS") return alert("Account already exists.");

        UI.menu = "none";
        UI.greetingText = `Welcome to VolcanoChat, ${Logic.Storage.activeUser}!`;
        renderApp();
    };
    wrap.appendChild(btn);

    const back = el("button",
        "bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded w-full",
        "Back");
    back.onclick = () => { UI.menu = "none"; renderApp(); };
    wrap.appendChild(back);

    return wrap;
}


/* ============================================================
   GREETING HEADER (Comic Sans)
============================================================ */
function renderGreetingHeader() {
    const user = Logic.Storage.activeUser;
    const acc = Logic.Storage.accounts[user];

    const wrap = el("div",
        "relative mb-4 p-3 rounded-lg shadow");
    wrap.style.background = "rgba(255,250,240,0.95)";

    const row = el("div", "flex items-center gap-3");
    wrap.appendChild(row);

    row.appendChild(el("span", "text-4xl", acc.avatar));

    const nameWrap = el("div");
    const g = el("p",
        "text-3xl font-bold text-orange-900",
        UI.greetingText);
    g.style.fontFamily = "Comic Sans MS";
    nameWrap.appendChild(g);

    if (user === Logic.ADMIN)
        nameWrap.appendChild(el("span", "text-yellow-500 font-bold text-sm", "[ADMIN]"));

    row.appendChild(nameWrap);

    // top icons
    const icons = el("div", "absolute right-3 top-2 flex flex-col gap-2");
    wrap.appendChild(icons);

    const bell = el("button", "text-3xl", "🔔");
    bell.onclick = () => MsgUI.showNotifications();
    icons.appendChild(bell);

    const gear = el("button", "text-4xl", "⚙️");
    gear.onclick = () => SettingsUI.show();
    icons.appendChild(gear);

    return wrap;
}


/* ============================================================
   ROAST PANEL
============================================================ */
function renderRoastPanel() {
    const wrap = el("div", "bg-white text-black p-4 rounded shadow mb-4");

    wrap.appendChild(el("h2", "text-xl mb-2 text-orange-800", "Roast Menu"));

    const roastBtn = el("button",
        "bg-orange-300 hover:bg-orange-400 px-4 py-2 rounded w-full mb-2",
        "Roast Me");
    roastBtn.onclick = () => {
        const text = Logic.Roast.normal();
        UI.roastText = text;
        renderApp();
    };
    wrap.appendChild(roastBtn);

    const volcanoBtn = el("button",
        "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full",
        "VOLCANIC ROAST 🌋");
    volcanoBtn.onclick = () => {
        UI.shake = true;
        UI.roastText = Logic.Roast.volcanic();
        renderApp();
    };
    wrap.appendChild(volcanoBtn);

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

    const wrap = el("div",
        `bg-white text-black p-4 rounded shadow mb-3 ${Logic.generateAccentClass(comm.icon)}`);

    const row = el("div", "flex justify-between items-center");
    wrap.appendChild(row);

    const left = el("div");
    const title = el("h2",
        "text-2xl font-bold text-orange-900 flex items-center gap-1",
        `${comm.icon} ${comm.name}`);
    left.appendChild(title);

    if (comm.verified)
        title.appendChild(el("span", "text-blue-500 text-sm", "✔ Verified"));

    left.appendChild(el("p", "text-sm text-gray-600", comm.description));
    row.appendChild(left);

    if (Logic.Storage.activeUser) {
        const buttons = el("div", "flex flex-col items-end gap-1");

        const user = Logic.Storage.activeUser;
        if (comm.members.includes(user)) {
            const leaveBtn = el("button",
                "bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm",
                "Leave");
            leaveBtn.onclick = () => {
                Logic.Community.leave(slug);
                renderApp();
            };
            buttons.appendChild(leaveBtn);
        } else {
            const joinBtn = el("button",
                "bg-green-200 hover:bg-green-300 px-3 py-1 rounded text-sm",
                "Join");
            joinBtn.onclick = () => {
                Logic.Community.join(slug);
                renderApp();
            };
            buttons.appendChild(joinBtn);
        }

        if (user === Logic.ADMIN) {
            const verifyBtn = el("button",
                "bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded text-xs",
                comm.verified ? "Unverify" : "Verify");
            verifyBtn.onclick = () => {
                Logic.Community.toggleVerified(slug);
                renderApp();
            };
            buttons.appendChild(verifyBtn);
        }

        row.appendChild(buttons);
    }

    // stats & sorting
    const bottom = el("div", "mt-2 flex items-center gap-3 text-sm");
    bottom.appendChild(
        el("span", "",
            `Members: ${comm.members.length} | Posts: ${comments.length}`)
    );

    const sortWrap = el("span", "ml-auto");
    sortWrap.appendChild(el("span", "", "Sort: "));

    const hot = el("button",
        UI.sort === "hot" ? "font-bold underline" : "text-gray-500",
        "Hot");
    hot.onclick = () => { UI.sort = "hot"; renderApp(); };

    const sep = document.createTextNode(" | ");

    const newest = el("button",
        UI.sort === "new" ? "font-bold underline" : "text-gray-500",
        "New");
    newest.onclick = () => { UI.sort = "new"; renderApp(); };

    sortWrap.appendChild(hot);
    sortWrap.appendChild(sep);
    sortWrap.appendChild(newest);

    bottom.appendChild(sortWrap);
    wrap.appendChild(bottom);

    return wrap;
}


/* ============================================================
   COMMENTS SECTION
============================================================ */
function renderCommentsSection() {
    const slug = UI.currentCommunity;
    const comm = Logic.Storage.comments[slug] || [];

    const wrap = el("div", "bg-white text-black p-4 rounded shadow mb-4");
    wrap.appendChild(el("h2", "text-xl mb-2 text-orange-800", "Comments"));

    // Sorted comments
    const sorted = Logic.Comments.sort(comm, UI.sort);

    sorted.forEach(c => {
        const banned = Logic.isBanned(c.user);

        const item = el("div", "mb-3 cursor-pointer");
        item.onclick = () => MsgUI.showProfile(c.user);

        const top = el("div", "flex items-center justify-between");
        const left = el("span", banned ? "text-red-500 font-bold" : "");
        left.textContent = `${c.avatar} ${c.user}`;
        if (c.mood) left.textContent += ` (${c.mood})`;
        top.appendChild(left);

        top.appendChild(el("span", "text-xs text-gray-500",
            new Date(c.time).toLocaleTimeString()));
        item.appendChild(top);

        const text = el("p", banned ? "text-red-500" : "", c.text);
        item.appendChild(text);

        const voteRow = el("div", "flex items-center gap-2 text-xs mt-1");

        const key = `${Logic.Storage.activeUser}|${c.id}`;
        const myVote = Logic.Storage.votes[key] || 0;

        const up = el("button", myVote === 1 ? "font-bold text-orange-600" : "", "▲");
        up.onclick = e => {
            e.stopPropagation();
            Logic.Comments.vote(c, 1);
            renderApp();
        };

        const down = el("button", myVote === -1 ? "font-bold text-blue-600" : "", "▼");
        down.onclick = e => {
            e.stopPropagation();
            Logic.Comments.vote(c, -1);
            renderApp();
        };

        voteRow.appendChild(up);
        voteRow.appendChild(el("span", "", (c.score || 0).toString()));
        voteRow.appendChild(down);

        item.appendChild(voteRow);

        wrap.appendChild(item);
    });

    // comment input
    const input = el("input",
        "border rounded px-3 py-2 w-full mt-3");
    input.placeholder = "Write a comment...";
    input.value = UI.commentInput;
    input.oninput = e => UI.commentInput = e.target.value;

    wrap.appendChild(input);

    const post = el("button",
        "bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded w-full mt-2",
        "Post");
    post.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first.");
        Logic.Comments.post(slug, UI.commentInput);
        UI.commentInput = "";
        renderApp();
    };

    wrap.appendChild(post);
    return wrap;
}


/* ------------------------------------------------------------
   READY → first render
------------------------------------------------------------ */
renderApp();
