/* ============================================================
   VolcanoChat — Persistent Storage (Namespaced LocalStorage)
   ============================================================ */

const STORAGE_KEY = "VolcanoChat_DATA";

/*
    Data saved inside localStorage looks like this:

    {
        accounts: { username: { password, avatar, mood } },
        activeUser: "name",
        communities: { slug: { ... } },
        comments: { slug: [ ... ] },
        votes: { "user|commentId": 1/-1 },
        reports: [ ... ],
        warnings: { user: count },
        bans: { user: { until } }
    }
*/

const Storage = {
    data: {
        accounts: {},
        activeUser: null,
        communities: {},
        comments: {},
        votes: {},
        reports: [],
        warnings: {},
        bans: {}
    },

    /* ------------------------------------------------------------
       LOAD + SAVE
    ------------------------------------------------------------ */
    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            this.save();
            return;
        }

        try {
            this.data = JSON.parse(raw);
        } catch (e) {
            console.error("❌ Storage corrupted — resetting.", e);
            this.resetAll();
        }
    },

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    },

    /* ------------------------------------------------------------
       GLOBAL RESET
    ------------------------------------------------------------ */
    resetAll() {
        this.data = {
            accounts: {},
            activeUser: null,
            communities: {},
            comments: {},
            votes: {},
            reports: [],
            warnings: {},
            bans: {}
        };
        this.save();
    },

    /* ------------------------------------------------------------
       GETTERS
    ------------------------------------------------------------ */
    get accounts() { return this.data.accounts; },
    get activeUser() { return this.data.activeUser; },
    get communities() { return this.data.communities; },
    get comments() { return this.data.comments; },
    get votes() { return this.data.votes; },
    get reports() { return this.data.reports; },
    get warnings() { return this.data.warnings; },
    get bans() { return this.data.bans; },

    /* ------------------------------------------------------------
       SETTERS
    ------------------------------------------------------------ */
    set activeUser(v) {
        this.data.activeUser = v;
        this.save();
    },

    /* ============================================================
       ACCOUNT SYSTEM
    ============================================================ */
    createAccount(username, password, avatar) {
        if (this.data.accounts[username]) return false;

        this.data.accounts[username] = {
            password,
            avatar,
            mood: ""
        };

        this.save();
        return true;
    },

    login(username, password) {
        const acc = this.data.accounts[username];
        if (!acc) return "NO_ACCOUNT";
        if (acc.password !== password) return "WRONG_PASSWORD";

        this.data.activeUser = username;
        this.save();
        return "OK";
    },

    logout() {
        this.data.activeUser = null;
        this.save();
    },

    updateAccount(username, data) {
        if (!this.data.accounts[username]) return;

        Object.assign(this.data.accounts[username], data);

        // update comments by that user
        for (const slug in this.data.comments) {
            this.data.comments[slug] = this.data.comments[slug].map(c =>
                c.user === username ? { ...c, ...data } : c
            );
        }

        this.save();
    },

    /* ============================================================
       COMMUNITIES
    ============================================================ */
    createCommunity(slug, data) {
        if (this.data.communities[slug]) return false;

        this.data.communities[slug] = data;
        this.data.comments[slug] = [];

        this.save();
        return true;
    },

    addComment(slug, commentObj) {
        if (!this.data.comments[slug]) this.data.comments[slug] = [];
        this.data.comments[slug].push(commentObj);
        this.save();
    },

    /* ============================================================
       VOTES
    ============================================================ */
    setVote(key, value) {
        this.data.votes[key] = value;
        this.save();
    },

    /* ============================================================
       REPORTS + BANS + WARNINGS
    ============================================================ */
    addReport(reportObj) {
        this.data.reports.push(reportObj);
        this.save();
    },

    banUser(username, until) {
        this.data.bans[username] = { until };
        this.save();
    },

    warnUser(username) {
        this.data.warnings[username] = (this.data.warnings[username] || 0) + 1;
        this.save();
    }
};

/* ------------------------------------------------------------
   Load data immediately on script start
------------------------------------------------------------ */
Storage.load();

/* ------------------------------------------------------------
   Export globally
------------------------------------------------------------ */
window.Storage = Storage;
