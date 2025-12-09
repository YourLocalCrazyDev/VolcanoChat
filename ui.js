/* ============================================================
   VolcanoChat — MAIN SCREEN UI (Non-React, FINAL FIXED VERSION)
   ============================================================ */

/* ------------------------------------------------------------
   GLOBAL IMPORTS
   (Do NOT use const/let — these must attach to the global scope)
------------------------------------------------------------ */
Logic = window.VolcanoLogic;
MsgUI = window.MessageUI;
SettingsUI = window.SettingsUI;

/* ------------------------------------------------------------
   GLOBAL UI STATE
------------------------------------------------------------ */
// FIX: UI is now a global variable (no const/let) so other scripts can access it.
UI = {
    menu: "none",
    theme: localStorage.getItem("themeMode") || "A",
    sort: "hot",

    // login + signup
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
    roastText: ""
};

const appRoot = document.getElementById("app-root");

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
   THEME HANDLING
------------------------------------------------------------ */
function applyTheme() {
    const b = document.body;

    // Reset base classes
    b.className = "min-h-screen";

    if (UI.theme === "A") {
        b.classList.add("bg-orange-50", "text-slate-900");
    } else if (UI.theme === "B") {
        b.classList.add("bg-slate-950", "text-orange-50");
    } else {
        b.classList.add(
            "bg-gradient-to-br",
            "from-slate-900",
            "via-orange-900",
            "to-red-900",
            "text-orange-50"
        );
    }

    if (UI.shake) {
        b.classList.add("shake");
        setTimeout(() => b.classList.remove("shake"), 600);
        UI.shake = false;
    }
}

/* ------------------------------------------------------------
   SAFE RENDER ENTRY POINT
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
window.renderApp = renderApp; // Make it globally accessible for other scripts

/* ------------------------------------------------------------
   SAFE INITIALIZATION (FIXED)
------------------------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
    // Initialize default community if none exist
    if (!Logic.Storage.communities ||
        Object.keys(Logic.Storage.communities).length === 0) {

        Logic.Community.create(
            "VolcanoChat",
            "The main lava pit of chaos.",
            "🌋"
        );

        UI.currentCommunity = "volcanochat";
    } else {
        // Set to the first community if a default isn't set, ensuring no null error
        if (!UI.currentCommunity || !Logic.Storage.communities[UI.currentCommunity]) {
            UI.currentCommunity = Object.keys(Logic.Storage.communities)[0];
        }
    }

    // Call the main render function to start the app
    renderApp();
});

/* ============================================================
   SIDEBAR
============================================================ */
function renderSidebar() {
    const isDark = UI.theme !== "A";
    const box = el("div", "w-64 p-3 rounded-lg shadow text-sm");
    
    // Theme-based styling for sidebar
    box.className = `w-64 p-3 rounded-lg shadow text-sm ${
        isDark ? "bg-slate-900 text-orange-50" : "bg-white text-slate-900"
    }`;

    const top = el("div", "flex justify-between items-center mb-2");
    top.appendChild(el("h2", `font-bold text-lg ${isDark ? "text-orange-400" : "text-orange-800"}`, "Volcanoes"));

    const add = el(
        "button",
        `text-xs px-2 py-1 rounded transition-colors ${
            isDark ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-orange-300 hover:bg-orange-400"
        }`,
        "+ New"
    );
    add.onclick = () => {
        if (!Logic.Storage.activeUser) return alert("Log in first");
        MsgUI.showCreateCommunity();
    };
    top.appendChild(add);
    box.appendChild(top);

    // search
    const search = el("input", "border rounded px-2 py-1 w-full mb-2 text-black");
    search.placeholder = "Search...";
    search.value = UI.communitySearch;
    search.oninput = e => {
        UI.communitySearch = e.target.value;
        renderApp();
    };
    box.appendChild(search);

    // trending
    const all = Object.values(Logic.Storage.communities);
    const trending = [...all].sort(
        (a, b) =>
            (Logic.Storage.comments[b.slug] || []).length -
            (Logic.Storage.comments[a.slug] || []).length
    );

    box.appendChild(el("h3", `text-xs font-semibold mt-3 ${isDark ? "text-amber-500" : "text-amber-700"}`, "Trending"));

    const tbox = el("div", "max-h-56 overflow-y-auto mb-2");
    trending.forEach(comm => {
        tbox.appendChild(renderCommunityListItem(comm));
    });
    box.appendChild(tbox);

    // all communities
    box.appendChild(el("h3", `text-xs font-semibold mt-3 ${isDark ? "text-amber-500" : "text-amber-700"}`, "All"));

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
    const isDark = UI.theme !== "A";

    const div = el(
        "div",
        `flex justify-between px-2 py-1 mb-1 rounded cursor-pointer 
         ${active 
            ? isDark ? "bg-orange-900" : "bg-orange-100" 
            : isDark ? "hover:bg-slate-700" : "hover:bg-orange-50"
        }`
    );

    div.onclick = () => {
        UI.currentCommunity = comm.slug;
        renderApp();
    };

    const left = el("span", "", `${comm.icon} ${comm.name}`);
    if (comm.verified)
        left.appendChild(el("span", "text-blue-400 text-xs ml-1", "✔"));

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
        box.appendChild(renderLoginSignupMenu());
    } else {
        box.appendChild(renderHeader());
        box.appendChild(renderRoastWidget());
        if (UI.currentCommunity) {
            box.appendChild(renderCommunityHeader());
            box.appendChild(renderCommentBox());
            box.appendChild(renderCommentList());
        } else {
            box.appendChild(el("p", "p-4 text-lg", "Select a Volcano to join the chaos."));
        }
    }
    
    return box;
}

/* ============================================================
   WELCOME SCREEN
============================================================ */
function renderWelcome() {
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-900/50 text-white" : "bg-white text-slate-900";
    
    const wrap = el("div", `p-6 rounded-lg shadow mb-6 ${bg}`);
    wrap.appendChild(el("h1", "text-4xl font-extrabold text-red-500 mb-2", "🔥 VolcanoChat 🌋"));
    wrap.appendChild(el("p", "text-xl mb-4", "The most chaotic place to chat online."));
    wrap.appendChild(el("p", "mb-4", "Please log in or sign up to begin."));

    const loginBtn = el("button", "bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded text-lg text-white mr-4", "Log In");
    loginBtn.onclick = () => {
        UI.menu = "login";
        renderApp();
    };
    
    const signupBtn = el("button", "bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded text-lg text-black", "Sign Up");
    signupBtn.onclick = () => {
        UI.menu = "signup";
        renderApp();
    };

    wrap.appendChild(loginBtn);
    wrap.appendChild(signupBtn);

    return wrap;
}

function renderLoginSignupMenu() {
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900";

    const wrap = el("div", `p-4 rounded-lg shadow ${bg}`);
    wrap.appendChild(el("h2", "text-2xl mb-3", "Access the Lava Pit"));

    if (UI.menu === "login") {
        return renderLogin();
    } else if (UI.menu === "signup") {
        return renderSignup();
    } else {
        return el("div", "text-center", "Select an option above.");
    }
}

function renderLogin() {
    const wrap = el("div", "p-4 rounded shadow mb-4");

    const u = el("input", "border px-3 py-2 w-full mb-2 text-black");
    u.placeholder = "Username";
    u.value = UI.loginUser;
    u.oninput = e => UI.loginUser = e.target.value;

    const p = el("input", "border px-3 py-2 w-full mb-4 text-black");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.loginPass;
    p.oninput = e => UI.loginPass = e.target.value;

    const btn = el("button", "bg-red-500 hover:bg-red-600 px-4 py-2 w-full rounded text-white mb-2", "Log In");
    btn.onclick = () => {
        const res = Logic.Auth.login(UI.loginUser, UI.loginPass);
        if (res === "OK") {
            UI.menu = "none";
            UI.greetingText = `${Logic.randomGreeting()}, ${Logic.Storage.activeUser}!`;
            renderApp();
        } else if (res === "NO_ACCOUNT") {
            MsgUI.toast("Account not found.");
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 600);
        } else if (res === "WRONG_PASSWORD") {
            MsgUI.toast("Wrong password.");
            document.body.classList.add("shake");
            setTimeout(() => document.body.classList.remove("shake"), 600);
        } else if (res === "BANNED") {
            alert("You are banned.");
        }
    };

    const back = el("button", "bg-gray-300 hover:bg-gray-400 px-4 py-2 w-full rounded text-black", "Back");
    back.onclick = () => {
        UI.menu = "none";
        renderApp();
    };

    wrap.appendChild(el("h3", "text-xl mb-3", "Log In"));
    wrap.appendChild(u);
    wrap.appendChild(p);
    wrap.appendChild(btn);
    wrap.appendChild(back);
    return wrap;
}

function renderSignup() {
    const wrap = el("div", "p-4 rounded shadow mb-4");

    const u = el("input", "border px-3 py-2 w-full mb-2 text-black");
    u.placeholder = "Username";
    u.value = UI.signupUser;
    u.oninput = e => UI.signupUser = e.target.value;

    const p = el("input", "border px-3 py-2 w-full mb-2 text-black");
    p.placeholder = "Password";
    p.type = "password";
    p.value = UI.signupPass;
    p.oninput = e => UI.signupPass = e.target.value;

    wrap.appendChild(el("h3", "text-xl mb-3", "Sign Up"));
    wrap.appendChild(u);
    wrap.appendChild(p);

    const avWrap = el("div", "flex flex-wrap gap-2 text-2xl max-h-32 overflow-y-auto mb-2 p-2 rounded bg-gray-100");
    Logic.avatarList.forEach(av => {
        const b = el("button", `px-2 py-1 rounded transition-colors ${UI.selectedAvatar === av ? "bg-yellow-400 text-black" : "bg-white hover:bg-gray-200"}`, av);
        b.onclick = () => {
            UI.selectedAvatar = av;
            renderApp();
        };
        avWrap.appendChild(b);
    });
    wrap.appendChild(avWrap);

    const btn = el("button", "bg-blue-500 hover:bg-blue-600 px-4 py-2 w-full rounded text-white mb-2", "Create Account");
    btn.onclick = () => {
        const res = Logic.Auth.signup(UI.signupUser, UI.signupPass, UI.selectedAvatar);
        if (res === "OK") {
            UI.menu = "none";
            UI.greetingText = `${Logic.randomGreeting()}, ${Logic.Storage.activeUser}!`;
            renderApp();
        } else if (res === "EXISTS") {
            MsgUI.toast("User already exists.");
        } else if (res === "INVALID") {
            MsgUI.toast("Username and password must be at least 3 characters.");
        } else if (res === "BANNED") {
            alert("You are banned.");
        }
    };

    const back = el("button", "bg-gray-300 hover:bg-gray-400 px-4 py-2 w-full rounded text-black", "Back");
    back.onclick = () => {
        UI.menu = "none";
        renderApp();
    };

    wrap.appendChild(btn);
    wrap.appendChild(back);
    return wrap;
}

/* ============================================================
   LOGGED-IN HEADER
============================================================ */
function renderHeader() {
    const user = Logic.Storage.activeUser;
    const acc = Logic.Storage.accounts[user];
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-900/50 text-white" : "bg-white text-slate-900";

    const wrap = el("div", `p-4 rounded-lg shadow mb-3 flex justify-between items-center ${bg}`);

    const left = el("div", "flex items-center gap-3");
    left.appendChild(el("div", "text-4xl", acc.avatar));

    const nameBox = el("div", "");
    nameBox.appendChild(el("p", "text-xl font-bold", user));
    if (acc.mood) {
        nameBox.appendChild(el("p", "text-xs italic", `Mood: ${acc.mood}`));
    }
    left.appendChild(nameBox);
    wrap.appendChild(left);

    const right = el("div", "flex items-center gap-3");

    // Notifications Button
    const notifBtn = el("button", `text-3xl p-1 rounded transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`);
    notifBtn.textContent = "🔔";
    notifBtn.onclick = () => MsgUI.showNotifications();
    right.appendChild(notifBtn);

    // Settings Button
    const settingsBtn = el("button", `text-3xl p-1 rounded transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`);
    settingsBtn.textContent = "⚙️";
    settingsBtn.onclick = () => SettingsUI.show();
    right.appendChild(settingsBtn);

    wrap.appendChild(right);
    return wrap;
}

/* ============================================================
   ROAST WIDGET
============================================================ */
function renderRoastWidget() {
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-800 text-white" : "bg-gray-100 text-slate-900";

    const wrap = el("div", `p-4 rounded-lg shadow mb-4 ${bg}`);
    wrap.appendChild(el("h3", "text-lg font-bold mb-2", "Volcano Roast 🌋"));

    const roast = el("button", "bg-yellow-500 hover:bg-yellow-600 text-black w-full py-2 rounded mb-2", "Roast Me");
    roast.onclick = () => {
        UI.roastText = Logic.Roast.normal();
        renderApp();
    };

    const volcano = el("button", "bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded", "VOLCANIC ROAST 🌋");
    volcano.onclick = () => {
        UI.shake = true;
        UI.roastText = Logic.Roast.volcanic();
        renderApp();
    };
    
    wrap.appendChild(roast);
    wrap.appendChild(volcano);

    if (UI.roastText) {
        const roastDisplay = el("p", "mt-3 text-lg font-mono p-2 rounded", UI.roastText);
        roastDisplay.style.background = isDark ? "rgba(255, 165, 0, 0.2)" : "rgba(255, 165, 0, 0.4)";
        wrap.appendChild(roastDisplay);
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
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-900/50 text-white" : "bg-white text-slate-900";

    const wrap = el("div", `p-4 rounded-lg shadow mb-3 border-t-4 border-accent-${comm.accent || 0} ${bg}`);
    
    const title = el("h2", `text-2xl font-bold ${isDark ? "text-orange-400" : "text-orange-900"}`, `${comm.icon} ${comm.name}`);
    if (comm.verified)
        title.appendChild(el("span", "text-blue-400 text-base ml-2", "✔"));
    wrap.appendChild(title);

    wrap.appendChild(el("p", "text-sm italic mb-2", comm.description));
    wrap.appendChild(el("p", "text-xs mb-2", `Members: ${comm.members.length} | Posts: ${comments.length}`));

    const user = Logic.Storage.activeUser;
    if (user) {
        const isMember = comm.members.includes(user);
        const joinBtn = el("button", 
            `text-xs px-3 py-1 rounded transition-colors ${
                isMember 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-green-500 hover:bg-green-600 text-white"
            }`,
            isMember ? "Leave" : "Join"
        );
        joinBtn.onclick = () => {
            if (isMember) {
                Logic.Community.leave(slug);
                MsgUI.toast(`Left ${comm.name}`);
            } else {
                Logic.Community.join(slug);
                MsgUI.toast(`Joined ${comm.name}`);
            }
            renderApp();
        };
        wrap.appendChild(joinBtn);
    }

    return wrap;
}

/* ============================================================
   COMMENT INPUT
============================================================ */
function renderCommentBox() {
    const slug = UI.currentCommunity;
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-900/50" : "bg-white";

    const wrap = el("div", `p-4 rounded-lg shadow mb-4 ${bg}`);
    
    const input = el("input", "border rounded px-3 py-2 w-full text-black");
    input.placeholder = "Write a comment...";
    input.value = UI.commentInput;
    input.oninput = e => UI.commentInput = e.target.value;

    const post = el("button", "mt-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white w-full", "Post Comment");
    post.onclick = () => {
        const res = Logic.Comments.post(slug, UI.commentInput);
        if (res === "OK") {
            UI.commentInput = "";
            renderApp();
        } else if (res === "BLOCKED") {
            MsgUI.toast("Post failed (Banned or Empty).");
        }
    };

    wrap.appendChild(input);
    wrap.appendChild(post);
    return wrap;
}

/* ============================================================
   COMMENT LIST
============================================================ */
function renderCommentList() {
    const slug = UI.currentCommunity;
    const comments = Logic.Storage.comments[slug] || [];
    const isDark = UI.theme !== "A";
    const bg = isDark ? "bg-slate-900/50" : "bg-white";

    const wrap = el("div", `p-4 rounded-lg shadow ${bg}`);
    wrap.appendChild(el("h3", "text-lg font-bold mb-3", "Lava Flow (Comments)"));

    // Sorting buttons
    const sortWrap = el("div", "flex gap-3 mb-3");
    
    const makeSortBtn = (sortType, label) => {
        const btn = el("button", 
            `text-sm px-3 py-1 rounded transition-colors ${
                UI.sort === sortType 
                ? "bg-orange-500 text-white" 
                : isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
            }`, 
            label
        );
        btn.onclick = () => {
            UI.sort = sortType;
            renderApp();
        };
        return btn;
    };
    
    sortWrap.appendChild(makeSortBtn("hot", "Hot 🔥"));
    sortWrap.appendChild(makeSortBtn("new", "New 🆕"));
    wrap.appendChild(sortWrap);

    let sortedComments = [...comments];

    if (UI.sort === "hot") {
        sortedComments.sort((a, b) => b.score - a.score);
    } else if (UI.sort === "new") {
        sortedComments.sort((a, b) => b.time - a.time);
    }
    
    if (sortedComments.length === 0) {
        wrap.appendChild(el("p", "text-center py-4 text-gray-500", "No comments yet. Start the eruption!"));
        return wrap;
    }

    sortedComments.forEach(c => {
        const div = el("div", `p-3 mb-2 rounded border-l-4 border-orange-500 ${isDark ? "bg-slate-800" : "bg-gray-50"}`);

        // User and time
        const header = el("div", "flex justify-between items-center text-xs mb-1");
        const userLink = el("span", `font-bold cursor-pointer ${Logic.isBanned(c.user) ? "text-red-400" : (isDark ? "text-orange-400" : "text-orange-700")}`, `${c.avatar} ${c.user}`);
        userLink.onclick = e => {
            e.stopPropagation();
            MsgUI.showProfile(c.user);
        };
        header.appendChild(userLink);
        header.appendChild(el("span", "text-gray-500", new Date(c.time).toLocaleTimeString()));
        div.appendChild(header);

        // Text
        div.appendChild(el("p", "", c.text));

        // votes
        const row = el("div", "flex gap-2 text-xs mt-1 items-center");

        const voteKey = `${Logic.Storage.activeUser}|${c.id}`;
        const prev = Logic.Storage.votes[voteKey] || 0;

        const up = el("button", `text-lg transition-colors ${prev === 1 ? "font-bold text-orange-600" : "text-gray-400 hover:text-orange-500"}`, "▲");
        up.onclick = e => {
            if (!Logic.Storage.activeUser) return MsgUI.toast("Log in to vote.");
            e.stopPropagation();
            Logic.Comments.vote(c, 1);
            renderApp();
        };

        const down = el("button", `text-lg transition-colors ${prev === -1 ? "font-bold text-blue-600" : "text-gray-400 hover:text-blue-500"}`, "▼");
        down.onclick = e => {
            if (!Logic.Storage.activeUser) return MsgUI.toast("Log in to vote.");
            e.stopPropagation();
            Logic.Comments.vote(c, -1);
            renderApp();
        };

        row.appendChild(up);
        row.appendChild(el("span", `text-sm font-bold ${c.score > 0 ? "text-green-500" : c.score < 0 ? "text-red-500" : ""}`, c.score || 0));
        row.appendChild(down);

        div.appendChild(row);
        wrap.appendChild(div);
    });

    return wrap;
}
