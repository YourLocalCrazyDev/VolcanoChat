/* ============================================================
   VolcanoChat — CORE LOGIC SYSTEM (Display Name Version)
============================================================ */

const ADMIN = "johnny big balls";

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
    "⚾","🎳","🏓","🛠","⚙️","🔧","🔨","📌","📎","📁","📦","🔒",
    "🔑","💣","❤️","💛","💚","💙","💜","🖤","💥","🔥","✨","⚔️",
    "🛡","⛏","🏔","🏴‍☠️"
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
    (n) => `${n}, your brain runs at potato-powered WiFi levels.`,
    (n) => `${n}, even NPCs would refuse your side quests.`,
    (n) => `${n}, your chaos energy could fuel a final boss.`,
    (n) => `${n}, you generate plot twists by accident.`,
    (n) => `${n}, your decision-making lags in real life.`
];

const volcanicRoasts = [
    (n) => `${n}, your presence alone causes reality to stutter.`,
    (n) => `${n}, fate patched you out but you keep respawning.`,
    (n) => `${n}, the universe needs therapy after watching you.`,
    (n) => `${n}, you are the lore reason the timeline fractured.`
];

/* ------------------------------------------------------------
   UTILITIES
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

function generateAccentClass(icon) {
    if (!icon) return "border-accent-0";
    const code = icon.codePointAt(0) || 0;
    return `border-accent-${code % 5}`;
}

function isBanned(username) {
    const info = Storage.bans[username];
    if (!info) return false;
    if (!info.until) return true; // permanent ban
    return info.until > Date.now();
}

/* ------------------------------------------------------------
   AUTH (now supports Display Name)
------------------------------------------------------------ */

const Auth = {
    signup(username, password, avatar, displayName) {
        if (!username.trim() || !password.trim()) return "INVALID";

        // Use username as default display name if none provided
        const dn = displayName?.trim() || username.trim();

        if (!Storage.createAccount(username, password, avatar, dn))
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

    changeAvatar(avatar) {
        if (!Storage.activeUser) return;
        Storage.updateAccount(Storage.activeUser, { avatar });
    },

    changeDisplayName(displayName) {
        if (!Storage.activeUser) return;
        Storage.updateAccount(Storage.activeUser, { displayName });
    }
};

/* ------------------------------------------------------------
   ROAST SYSTEM (now targets display names)
------------------------------------------------------------ */

const Roast = {
    normal() {
        const u = Storage.activeUser;
        if (!u) return "";
        const dn = Storage.accounts[u].displayName;
        return roasts[Math.floor(Math.random() * roasts.length)](dn);
    },

    volcanic() {
        const u = Storage.activeUser;
        if (!u) return "";
        const dn = Storage.accounts[u].displayName;
        return volcanicRoasts[Math.floor(Math.random() * volcanicRoasts.length)](dn);
    }
};

/* ------------------------------------------------------------
   COMMUNITY
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
        if (!c) return;
        const u = Storage.activeUser;
        if (!u) return;

        if (!c.members.includes(u))
            c.members.push(u);
    },

    leave(slug) {
        const c = Storage.communities[slug];
        if (!c) return;
        const u = Storage.activeUser;
        if (!u) return;

        c.members = c.members.filter(m => m !== u);
    },

    toggleVerified(slug) {
        if (Storage.activeUser !== ADMIN) return;
        const c = Storage.communities[slug];
        if (!c) return;
        c.verified = !c.verified;
    }
};

/* ------------------------------------------------------------
   COMMENTS (now store displayName)
------------------------------------------------------------ */

const Comments = {
    post(slug, text) {
        const u = Storage.activeUser;
        if (!u || !text.trim()) return;

        const acc = Storage.accounts[u];

        const obj = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            user: u,
            displayName: acc.displayName,
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
        const u = Storage.activeUser;
        if (!u) return;

        const key = `${u}|${comment.id}`;
        const prev = Storage.votes[key] || 0;
        let newVote = direction;

        if (prev === direction) newVote = 0;

        const delta = newVote - prev;
        Storage.votes[key] = newVote;

        // update score
        const arr = Storage.comments[comment.community];
        const idx = arr.findIndex(c => c.id === comment.id);
        if (idx !== -1) arr[idx].score += delta;
    },

    sort(list, mode) {
        const arr = [...list];
        if (mode === "new") {
            return arr.sort((a, b) => b.time - a.time);
        }
        // hot (score first, then recency)
        return arr.sort((a, b) => {
            const s = (b.score || 0) - (a.score || 0);
            if (s !== 0) return s;
            return b.time - a.time;
        });
    }
};

/* ------------------------------------------------------------
   MODERATION
------------------------------------------------------------ */

const Mod = {
    submitReport(target, reason) {
        const reporter = Storage.activeUser;
        if (!reporter || reporter === target) return;

        Storage.addReport({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            target,
            reporter,
            reason: reason || "No reason provided",
            resolved: false,
            action: null,
            time: Date.now()
        });
    },

    warnUser(report) {
        Storage.warnUser(report.target);
        report.resolved = true;
        report.action = "warn";
    },

    banUser(report, mins) {
        const until = mins === 0 ? null : Date.now() + mins * 60000;
        Storage.banUser(report.target, until);
        report.resolved = true;
        report.action = "ban";
    },

    ignoreReport(report) {
        report.resolved = true;
        report.action = "ignore";
    }
};

/* ------------------------------------------------------------
   EXPORT
------------------------------------------------------------ */

window.VolcanoLogic = {
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
    generateAccentClass,
    isBanned,
    ADMIN
};
