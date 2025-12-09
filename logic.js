/* ============================================================
   VolcanoChat — CORE LOGIC SYSTEM (Non-React Version)
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
   UTILITY FUNCTIONS
------------------------------------------------------------ */

function randomGreeting() {
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function slugify(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function isBanned(user) {
    const ban = Storage.bans[user];
    if (!ban) return false;
    if (ban.until === null) return true; // Permanent
    return ban.until > Date.now();
}

/* ------------------------------------------------------------
   AUTHENTICATION
------------------------------------------------------------ */

const Auth = {
    signup(username, password, avatar) {
        if (isBanned(username)) return "BANNED";
        if (!username || !password || username.length < 3) return "INVALID";
        const ok = Storage.createAccount(username, password, avatar);
        if (ok) {
            Storage.login(username, password);
            return "OK";
        }
        return "EXISTS";
    },

    login(username, password) {
        if (isBanned(username)) return "BANNED";
        return Storage.login(username, password);
    },

    logout() {
        Storage.logout();
    },

    setAvatar(user, avatar) {
        Storage.updateAccount(user, { avatar });
    },

    setMood(mood) {
        Storage.updateAccount(Storage.activeUser, { mood });
    },

    setTheme(theme) {
        localStorage.setItem("themeMode", theme);
    }
};

/* ------------------------------------------------------------
   ROAST SYSTEM
------------------------------------------------------------ */
const Roast = {
    normal() {
        const user = Storage.activeUser || "Someone";
        const list = Storage.warnings[user] > 3 ? volcanicRoasts : roasts;
        const fn = list[Math.floor(Math.random() * list.length)];
        return fn(user);
    },

    volcanic() {
        const user = Storage.activeUser || "Someone";
        const fn = volcanicRoasts[Math.floor(Math.random() * volcanicRoasts.length)];
        return fn(user);
    }
};

/* ------------------------------------------------------------
   COMMUNITIES
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
            verified: false,
            accent: Math.floor(Math.random() * 5)
        });

        return { ok: true, slug };
    },

    join(slug) {
        const c = Storage.communities[slug];
        if (!c) return;
        const u = Storage.activeUser;
        if (!u) return;
        if (!c.members.includes(u)) c.members.push(u);
    },

    leave(slug) {
        const c = Storage.communities[slug];
        if (!c) return;
        const u = Storage.activeUser;
        if (!u) return;
        c.members = c.members.filter(m => m !== u);
    }
};

/* ------------------------------------------------------------
   COMMENTS
------------------------------------------------------------ */

const Comments = {
    post(slug, text) {
        const user = Storage.activeUser;
        if (!user || !text.trim() || isBanned(user)) return "BLOCKED";

        const cmt = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            user,
            text: text.trim(),
            time: Date.now(),
            score: 0,
            community: slug,
            avatar: Storage.accounts[user].avatar
        };

        Storage.addComment(slug, cmt);
        return "OK";
    },

    vote(comment, value) {
        const user = Storage.activeUser;
        if (!user) return;

        const voteKey = `${user}|${comment.id}`;
        const prevVote = Storage.votes[voteKey] || 0;

        if (prevVote === value) {
            // Already voted this way, so unvote
            Storage.setVote(voteKey, 0);
            comment.score -= value;
        } else {
            // New vote or change vote
            comment.score -= prevVote; // Remove previous vote's impact
            comment.score += value; // Add new vote's impact
            Storage.setVote(voteKey, value);
        }
    },

    getRecent(amount = 8) {
        const all = [];
        for (const slug in Storage.comments) {
            all.push(...Storage.comments[slug]);
        }
        return all
            .sort((a, b) => b.time - a.time)
            .slice(0, amount);
    },

    getAllByUser(user) {
        const arr = [];
        for (const slug in Storage.comments) {
            arr.push(...Storage.comments[slug].filter(c => c.user === user));
        }
        return arr.sort((a, b) => b.time - a.time);
    }
};

/* ------------------------------------------------------------
   MODERATION (Reports / Bans / Warnings)
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
    },

    clearAllComments() {
        for (const slug in Storage.comments) {
            Storage.comments[slug] = [];
        }
    }
};

/* ------------------------------------------------------------
   EXPORT TO UI
------------------------------------------------------------ */

window.VolcanoLogic = {
    avatarList,
    communityIcons,
    Auth,
    Roast,
    Community,
    Comments,
    Mod,
    slugify,
    randomGreeting,
    isBanned,
    ADMIN,
    Storage // This is correctly referencing the global Storage variable
};
