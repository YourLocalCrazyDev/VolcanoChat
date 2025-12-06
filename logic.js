/* ============================================================
   VolcanoChat — Core Logic System (Non-React Version)
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
   UTILITIES
------------------------------------------------------------ */

function randomGreeting() {
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function slugify(name) {
    return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function generateAccentClass(icon) {
    if (!icon) return "";
    const code = icon.codePointAt(0);
    return `border-accent-${code % 5}`;
}

function isBanned(username) {
    const info = Storage.bans[username];
    if (!info) return false;
    if (!info.until) return true; // permanent ban
    return info.until > Date.now();
}

/* ------------------------------------------------------------
   AUTH
------------------------------------------------------------ */

const Auth = {
    signup(username, password, avatar) {
        if (!username.trim() || !password.trim()) return "INVALID";
        if (!Storage.createAccount(username, password, avatar)) return "EXISTS";
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
   ROASTS
------------------------------------------------------------ */

const Roast = {
    normal() {
        const u = Storage.activeUser;
        if (!u) return "";
        return roasts[Math.floor(Math.random() * roasts.length)](u);
    },

    volcanic() {
        const u = Storage.activeUser;
        if (!u) return "";
        return volcanicRoasts[Math.floor(Math.random() * volcanicRoasts.length)](u);
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
            verified: false
        });

        return { ok: true, slug };
    },

    join(slug) {
        const user = Storage.activeUser;
        if (!user) return;
        const com = Storage.communities[slug];
        if (!com) return;

        if (!com.members.includes(user))
            com.members.push(user);
    },

    leave(slug) {
        const user = Storage.activeUser;
        if (!user) return;
        const com = Storage.communities[slug];
        if (!com) return;

        com.members = com.members.filter(m => m !== user);
    },

    toggleVerified(slug) {
        if (Storage.activeUser !== ADMIN) return;
        const com = Storage.communities[slug];
        if (!com) return;
        com.verified = !com.verified;
    }
};

/* ------------------------------------------------------------
   COMMENTS
------------------------------------------------------------ */

const Comments = {
    post(slug, text) {
        const u = Storage.activeUser;
        if (!u || !text.trim()) return;

        const acc = Storage.accounts[u];

        Storage.addComment(slug, {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            user: u,
            avatar: acc.avatar,
            mood: acc.mood,
            text,
            time: Date.now(),
            score: 0,
            community: slug
        });
    },

    vote(comment, direction) {
        const u = Storage.activeUser;
        if (!u) return;

        const key = `${u}|${comment.id}`;
        const prev = Storage.votes[key] || 0;
        let newVote = direction;

        if (prev === direction) newVote = 0;

        Storage.setVote(key, newVote);
        const delta = newVote - prev;

        const arr = Storage.comments[comment.community];
        const i = arr.findIndex(c => c.id === comment.id);
        if (i !== -1) arr[i].score += delta;
    },

    sort(comments, mode) {
        const arr = [...comments];
        if (mode === "new") return arr.sort((a, b) => b.time - a.time);
        return arr.sort((a, b) =>
            (b.score - a.score) || (b.time - a.time)
        );
    },

    getRecent(limit = 10) {
        let all = [];
        for (const slug in Storage.comments) {
            all = all.concat(Storage.comments[slug]);
        }
        return all.sort((a, b) => b.time - a.time).slice(0, limit);
    },

    getAllByUser(user) {
        let out = [];
        for (const slug in Storage.comments) {
            out = out.concat(Storage.comments[slug].filter(c => c.user === user));
        }
        return out.sort((a, b) => b.time - a.time);
    }
};

/* ------------------------------------------------------------
   MODERATION SYSTEM (FIXED)
------------------------------------------------------------ */

const Mod = {
    submitReport(target, reason = "No reason provided") {
        const reporter = Storage.activeUser;
        if (!reporter || reporter === target) return;

        Storage.addReport({
            id: Date.now().toString(36),
            target,
            reporter,
            reason,
            resolved: false,
            action: null,
            time: Date.now()
        });
    },

    ban(reportId, target, minutes) {
        const until = minutes === 0 ? null : Date.now() + minutes * 60000;
        Storage.banUser(target, until);

        Storage.reports = Storage.reports.map(r =>
            r.id === reportId ? { ...r, resolved: true, action: "ban" } : r
        );
    },

    warn(reportId, target) {
        Storage.warnUser(target);
        Storage.reports = Storage.reports.map(r =>
            r.id === reportId ? { ...r, resolved: true, action: "warn" } : r
        );
    },

    ignore(reportId) {
        Storage.reports = Storage.reports.map(r =>
            r.id === reportId ? { ...r, resolved: true, action: "ignore" } : r
        );
    }
};

/* ------------------------------------------------------------
   EXPORT LOGIC TO GLOBAL
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
    generateAccentClass,
    isBanned
};
