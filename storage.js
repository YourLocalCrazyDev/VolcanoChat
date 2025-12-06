/* ============================================================
   VolcanoChat — Persistent LocalStorage Storage Engine
   ============================================================ */

const STORAGE_KEY = "VolcanoChat_Data";

const Storage = {

    accounts: {},        // { username: { password, display, avatar, description } }
    activeUser: null,    // username who is logged in

    communities: {},
    comments: {},
    votes: {},
    reports: [],
    warnings: {},
    bans: {},

    /* ------------------------------------------------------------
       SAVE
    ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       LOAD
    ------------------------------------------------------------ */
    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            const data = JSON.parse(raw);

            this.accounts = data.accounts || {};
            this.activeUser = data.activeUser || null;
            this.communities = data.communities || {};
            this.comments = data.comments || {};
            this.votes = data.votes || {};
            this.reports = data.reports || [];
            this.warnings = data.warnings || {};
            this.bans = data.bans || {};

        } catch (err) {
            console.error("Storage load failed:", err);
        }
    },

    /* ------------------------------------------------------------
       ACCOUNT CREATION
    ------------------------------------------------------------ */
    createAccount(username, password, avatar, display) {
        if (this.accounts[username]) return false;

        this.accounts[username] = {
            password,
            avatar,
            display,
            description: ""   // replaces mood
        };

        this.save();
        return true;
    },

    /* ------------------------------------------------------------
       LOGIN / LOGOUT
    ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       UPDATE ACCOUNT
    ------------------------------------------------------------ */
    updateAccount(username, data) {
        if (!this.accounts[username]) return;

        Object.assign(this.accounts[username], data);

        // Update comments automatically
        for (const slug in this.comments) {
            this.comments[slug] = this.comments[slug].map(c =>
                c.user === username ? { ...c, display: this.accounts[username].display, avatar: this.accounts[username].avatar } : c
            );
        }

        this.save();
    }
};

Storage.load();
window.Storage = Storage;
