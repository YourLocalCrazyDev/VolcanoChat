/* ============================================================
   VolcanoChat — Persistent Storage (LocalStorage Version)
   ============================================================ */

const STORAGE_KEY = "VolcanoChat_Data_v1";

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Storage));
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

const loaded = loadState();

const Storage = loaded || {
    accounts: {},          
    activeUser: null,      
    communities: {},       
    comments: {},          
    votes: {},             
    reports: [],           
    warnings: {},          
    bans: {},              
};

/* -------------------------
   SAVE AFTER EVERY CHANGE
------------------------- */
function autosave(fn) {
    fn();
    saveState();
}

/* -------------------------
   RESET EVERYTHING
------------------------- */
Storage.resetAll = function () {
    autosave(() => {
        Storage.accounts = {};
        Storage.activeUser = null;
        Storage.communities = {};
        Storage.comments = {};
        Storage.votes = {};
        Storage.reports = [];
        Storage.warnings = {};
        Storage.bans = {};
    });
};

/* -------------------------
   ACCOUNTS
------------------------- */
Storage.createAccount = function (username, password, avatar) {
    if (Storage.accounts[username]) return false;

    autosave(() => {
        Storage.accounts[username] = {
            password,
            avatar,
            mood: ""
        };
    });

    return true;
};

Storage.login = function (username, password) {
    const acc = Storage.accounts[username];
    if (!acc) return "NO_ACCOUNT";
    if (acc.password !== password) return "WRONG_PASSWORD";

    autosave(() => {
        Storage.activeUser = username;
    });

    return "OK";
};

Storage.logout = function () {
    autosave(() => {
        Storage.activeUser = null;
    });
};

Storage.updateAccount = function (username, data) {
    if (!Storage.accounts[username]) return;

    autosave(() => {
        Object.assign(Storage.accounts[username], data);

        // update comments by the user
        for (const slug in Storage.comments) {
            Storage.comments[slug] = Storage.comments[slug].map(c =>
                c.user === username ? { ...c, ...data } : c
            );
        }
    });
};

/* -------------------------
   COMMUNITIES
------------------------- */
Storage.createCommunity = function (slug, data) {
    if (Storage.communities[slug]) return false;

    autosave(() => {
        Storage.communities[slug] = data;
        Storage.comments[slug] = [];
    });

    return true;
};

Storage.addComment = function (slug, commentObj) {
    autosave(() => {
        if (!Storage.comments[slug]) Storage.comments[slug] = [];
        Storage.comments[slug].push(commentObj);
    });
};

/* -------------------------
   VOTING
------------------------- */
Storage.setVote = function (key, value) {
    autosave(() => {
        Storage.votes[key] = value;
    });
};

/* -------------------------
   REPORTING + MODERATION
------------------------- */
Storage.addReport = function (reportObj) {
    autosave(() => {
        Storage.reports.push(reportObj);
    });
};

Storage.banUser = function (username, until) {
    autosave(() => {
        Storage.bans[username] = { until };
    });
};

Storage.warnUser = function (username) {
    autosave(() => {
        Storage.warnings[username] = (Storage.warnings[username] || 0) + 1;
    });
};
