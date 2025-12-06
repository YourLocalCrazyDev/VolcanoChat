/* ============================================================
   VolcanoChat — Core Logic System (FINAL VERSION)
   Works with persistent Storage.js and UI/message/settings.
   ============================================================ */

const ADMIN = "johnny big balls"; // 🔥 Your admin username

/* ------------------------------------------------------------
   STATIC DATA
------------------------------------------------------------ */

const avatarList = [
    "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
    "🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚",
    "😋","😛","😜","😝","🤪","🤨","🧐","🤓","😎","🥸",
    "🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️",
    "😣","😖","😫","😩","🥺","😭","😤","😠","😡","🤬",
    "🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗",
    "🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯",
    "😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐",
    "🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈",
    "👿","👻","💀","☠️","🤖","👽","👾","🎃","🔥","⭐"
];

const communityIcons = [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮",
    "🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦉","🦅","🦆","🐙","🦈",
    "🌵","🌲","🌳","🌴","🌾","🌻","🌹","🍎","🍌","🍉","🍕","🍔",
    "🍟","🌭","🍣","🍩","🍪","🍰","🍫","🍿","🍺","🍷","🥤","🍭",
    "☀️","🌤","⛅","🌧","⚡","🌈","❄️","🌙","⭐","🌟","🌎","🪐",
    "💡","📚","🎮","🎧","🎲","🎯","🎹","🎸","🎺","⚽","🏀","🏈",
    "⚾","🎳","🏓","🛠","⚙️","🔧","🔨","📌","📎","📁","📦","🔒","🔑","💣",
    "❤️","💛","💚","💙","💜","🖤","💥","🔥","✨","⚔️","🛡","⛏","🏔","🏴‍☠️"
];

const greetings = [
    "Welcome back",
    "Good to see you again",
    "Hey there",
    "You're back!",
    "Nice to see you",
    "Yo",
    "Sup",
    "Greetings, traveler",
    "Behold!"
];

const roasts = [
    n => `${n}, your brain runs at potato-powered WiFi levels.`,
    n => `${n}, even NPCs would refuse your side quests.`,
    n => `${n}, your chaos energy could fuel a final boss.`,
    n => `${n}, you generate plot twists by accident.`,
    n => `${n}, your decision-making lags in real life.`,
];

const volcanicRoasts = [
    n => `${n}, your presence alone causes reality to stutter.`,
    n => `${n}, fate patched you out but you keep respawning.`,
    n => `${n}, the universe needs therapy after watching you.`,
    n => `${n}, you are the lore reason the timeline fractured.`,
];

/* ------------------------------------------------------------
   UTILITY FUNCTIONS
------------------------------------------------------------ */

function randomGreeting() {
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

function isBanned(username) {
    const b = Storage.bans[username];
    if (!b) return false;
    if (!b.until) return true; // permanent
    return b.until > Date.now();
}

/* ------------------------------------------------------------
   AUTH LOGIC
------------------------------------------------------------ */

const Auth = {
    signup(username, password, avatar) {
        username = username.trim();
        password = password.trim();

        if (!username || !password) return "INVALID";

        if (!Storage.createAccount(username, password, avatar))
            return "EXISTS";

        Storage.activeUser = username;
        return "OK";
    },

    login(username, password) {
        if (isBanned(username)) return "BANNED";
        return Storage.login(username, password);
    },

    logout() {
        Storage.logout();
    },

    setMood(mood) {
        if (!Storage.activeUser) return;
        Storage.updateAccount(Storage.activeUser, { mood });
    },

    setAvatar(avatar) {
        if (!Storage.activeUser) return;
        Storage.updateAccount(Storage.activeUser, { avatar });
    }
};

/* ------------------------------------------------------------
   ROAST SYSTEM
------------------------------------------------------------ */

const Roast = {
    normal() {
        const u = Storage.activeUser;
        const fn = roasts[Math.floor(Math.random() * roasts.length)];
        return fn(u);
    },

    volcanic() {
        const u = Storage.activeUser;
        const fn = volcanicRoasts[Math.floor(Math.random() * volcanicRoasts.length)];
        return fn(u);
    }
};

/* ------------------------------------------------------------
   COMMUNITY SYSTEM
------------------------------------------------------------ */

const Community = {
    create(name, desc, icon) {
        const slug = slugify(name);
        if (!slug) return { ok: false, reason: "INVALID" };
        if (Storage.communities[slug]) return { ok: false, reason: "EXISTS" };

        Storage.createCommunity(slug, {
            slug,
            name,
            description: desc || "A VolcanoChat community.",
            icon: icon || "🔥",
            creator: Storage.activeUser,
            createdAt: Date.now(),
            mods: [Storage.activeUser],
            members: [Storage.activeUser],
            verified: false
        });

        return { ok: true, slug };
    },

    join(slug) {
        const c = Storage.communities[slug];
        const u = Storage.activeUser;
        if (!c || !u) return;
        if (!c.members.includes(u)) c.members.push(u);
        Storage.save();
    },

    leave(slug) {
        const c = Storage.communities[slug];
        const u = Storage.activeUser;
        if (!c || !u) return;
        c.members = c.members.filter(x => x !== u);
        Storage.save();
    },

    toggleVerified(slug) {
        if (Storage.activeUser !== ADMIN) return;
        const c = Storage.communities[slug];
        if (!c) return;
        c.verified = !c.verified;
        Storage.save();
    }
};

/* ------------------------------------------------------------
   COMMENTS SYSTEM
------------------------------------------------------------ */

const Comments = {
    post(slug, text) {
        const u = Storage.activeUser;
        if (!u) return;
        if (!text.trim()) return;

        const acc = Storage.accounts[u];

        const obj = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            user: u,
            avatar: acc.avatar,
            mood: acc.mood,
            text,
            time: Date.now(),
            score: 0,
            community: slug
        };

        Storage.addComment(slug, obj);
    },

    vote(comment, direction) {
        const user = Storage.activeUser;
        if (!user) return;

        const key = `${user}|${comment.id}`;
        const prev = Storage.votes[key] || 0;
        let newVote = direction;

        if (prev === direction) newVote = 0;

        const delta = newVote - prev;
        Storage.setVote(key, newVote);

        const arr = Storage.comments[comment.community];
        const idx = arr.findIndex(c => c.id === comment.id);
        if (idx !== -1) arr[idx].score += delta;

        Storage.save();
    },

    sort(list, mode) {
        const arr = [...list];

        if (mode === "new")
            return arr.sort((a, b) => b.time - a.time);

        return arr.sort((a, b) => {
            const s = (b.score || 0) - (a.score || 0);
            return s !== 0 ? s : b.time - a.time;
        });
    },

    getRecent(n = 10) {
        let all = [];
        for (const slug in Storage.comments)
            all = all.concat(Storage.comments[slug]);

        return all.sort((a, b) => b.time - a.time).slice(0, n);
    },

    getAllByUser(user) {
        let arr = [];
        for (const slug in Storage.comments)
            arr = arr.concat(Storage.comments[slug].filter(c => c.user === user));

        return arr.sort((a, b) => b.time - a.time);
    }
};

/* ------------------------------------------------------------
   MODERATION
------------------------------------------------------------ */

const Mod = {
    submitReport(target, reason = "No reason provided") {
        const reporter = Storage.activeUser;
        if (!reporter || reporter === target) return;

        Storage.addReport({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            target,
            reporter,
            reason,
            resolved: false,
            action: null,
            time: Date.now()
        });
    },

    banUser(reportObj, minutes) {
        const until = minutes === 0 ? null : (Date.now() + minutes * 60000);
        Storage.banUser(reportObj.target, until);

        reportObj.resolved = true;
        reportObj.action = "ban";
        Storage.save();
    },

    warnUser(reportObj) {
        Storage.warnUser(reportObj.target);
        reportObj.resolved = true;
        reportObj.action = "warn";
        Storage.save();
    },

    ignoreReport(reportObj) {
        reportObj.resolved = true;
        reportObj.action = "ignore";
        Storage.save();
    },

    clearAllComments() {
        for (const slug in Storage.comments)
            Storage.comments[slug] = [];
        Storage.save();
    }
};

/* ------------------------------------------------------------
   EXPORT TO GLOBAL
------------------------------------------------------------ */

window.VolcanoLogic = {
    ADMIN,
    avatarList,
    communityIcons,
    Auth,
    Roast,
    Community,
    Comments,
    Mod,
    Storage,
    randomGreeting,
    slugify,
    isBanned
};
