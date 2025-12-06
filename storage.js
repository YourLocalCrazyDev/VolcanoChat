/* ============================================================
   VolcanoChat — Persistent LocalStorage Storage Engine
   ============================================================ */

const STORAGE_KEY = "VolcanoChat_Data";

const Storage = {

    accounts: {},        // { username: { password, display, avatar, description } }
    activeUser: null,    // username of logged-in user

    communities: {},     // { slug: { ... } }
    comments: {},        // { slug: [ commentObj ] }
    votes: {},           // { "user|commentId": 1 | -1 }
    reports: [],         // [ reportObj ]
    warnings: {},        // { username: count }
    bans: {},            // { username: { until: timestamp|null } }

    /* --------------------------------------------------------
       SAVE EVERYTHING TO LOCALSTORAGE
    -------------------------------------------------------- */
    save() {
        const data = {
            accounts: this.accounts,
            activeUser: this.activeUser,
            communities: this.communities,
            comments: this.comments,
            votes: this.votes,
            reports: this.reports,
            warnings: this.warnings,
            bans: this.bans
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    /* --------------------------------------------------------
       LOAD EVERYTHING FROM LOCALSTORAGE
    -------------------------------------------------------- */
    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            const data = JSON.parse(raw);

            this.accounts    = data.accounts    || {};
            this.activeUser  = data.activeUser  || null;
            this.communities = data.communities || {};
            this.comments    = data.comments    || {};
            this.votes       = data.votes       || {};
            this.reports     = data.reports     || [];
            this.warnings    = data.warnings    || {};
            this.bans        = data.bans        || {};
        } catch (err) {
            console.error("Storage load failed:", err);
        }
    },

    /* --------------------------------------------------------
       RESET EVERYTHING
    -------------------------------------------------------- */
    resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        this.accounts = {};
        this.activeUser = null;
        this.communities = {};
        this.comments = {};
        this.votes = {};
        this.reports = [];
        this.warnings = {};
        this.bans = {};
    },

    /* --------------------------------------------------------
       ACCOUNT HANDLING
    -------------------------------------------------------- */
    createAccount(username, password, avatar, display) {
        if (this.accounts[username]) return false;

        this.accounts[username] = {
            password,
            avatar,
            display: display || username,
            description: ""
        };

        this.save();
        return true;
    },

    login(username, password) {
        const acc = this.accounts[username];
        if (!acc) return "NO_ACCOUNT";
        if (acc.password !== password) return "WRONG_PASSWORD";

        this.activeUser = username;
        this.save();
        return "OK";
    },

    logout() {
        this.activeUser = null;
        this.save();
    },

    updateAccount(username, data) {
        const acc = this.accounts[username];
        if (!acc) return;

        Object.assign(acc, data);

        // propagate avatar/display/description to all comments
        for (const slug in this.comments) {
            this.comments[slug] = this.comments[slug].map(c => {
                if (c.user !== username) return c;
                return {
                    ...c,
                    avatar: acc.avatar,
                    display: acc.display,
                    description: acc.description
                };
            });
        }

        this.save();
    },

    /* --------------------------------------------------------
       COMMUNITIES
    -------------------------------------------------------- */
    createCommunity(slug, data) {
        if (this.communities[slug]) return false;
        this.communities[slug] = data;
        this.comments[slug] = [];
        this.save();
        return true;
    },

    addComment(slug, commentObj) {
        if (!this.comments[slug]) this.comments[slug] = [];
        this.comments[slug].push(commentObj);
        this.save();
    },

    /* --------------------------------------------------------
       VOTING
    -------------------------------------------------------- */
    setVote(key, value) {
        this.votes[key] = value;
        this.save();
    },

    /* --------------------------------------------------------
       REPORTS / MODERATION
    -------------------------------------------------------- */
    addReport(r) {
        this.reports.push(r);
        this.save();
    },

    banUser(username, until) {
        this.bans[username] = { until };
        this.save();
    },

    warnUser(username) {
        this.warnings[username] = (this.warnings[username] || 0) + 1;
        this.save();
    }
};

Storage.load();
window.Storage = Storage;
