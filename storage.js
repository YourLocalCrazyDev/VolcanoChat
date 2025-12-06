/* ============================================================
   VolcanoChat — Temporary Storage (RAM ONLY, No LocalStorage)
   ============================================================ */

/*
    All data is stored in RAM only.
    Refreshing the page will wipe everything.
*/

window.Storage = {

    accounts: {},          // { username: { password, avatar, mood } }
    activeUser: null,      // currently logged-in username

    communities: {},       // { slug: {...communityData} }
    comments: {},          // { slug: [] }

    votes: {},             // { "user|commentID": 1 or -1 }
    reports: [],           // moderation reports
    warnings: {},          // { username: count }
    bans: {},              // { username: { until: timestamp|null } }

    /* -------------------------
       RESET EVERYTHING
    ------------------------- */
    resetAll() {
        this.accounts = {};
        this.activeUser = null;
        this.communities = {};
        this.comments = {};
        this.votes = {};
        this.reports = [];
        this.warnings = {};
        this.bans = {};
    },

    /* -------------------------
       ACCOUNTS
    ------------------------- */
    createAccount(username, password, avatar) {
        if (this.accounts[username]) return false;
        this.accounts[username] = {
            password,
            avatar,
            mood: ""
        };
        return true;
    },

    login(username, password) {
        const acc = this.accounts[username];
        if (!acc) return "NO_ACCOUNT";
        if (acc.password !== password) return "WRONG_PASSWORD";
        this.activeUser = username;
        return "OK";
    },

    logout() {
        this.activeUser = null;
    },

    updateAccount(username, data) {
        if (!this.accounts[username]) return;
        Object.assign(this.accounts[username], data);

        // update user info on all their past comments
        for (const slug in this.comments) {
            this.comments[slug] = this.comments[slug].map(c =>
                c.user === username ? { ...c, ...data } : c
            );
        }
    },

    /* -------------------------
       COMMUNITIES
    ------------------------- */
    createCommunity(slug, data) {
        if (this.communities[slug]) return false;
        this.communities[slug] = data;
        this.comments[slug] = [];
        return true;
    },

    addComment(slug, commentObj) {
        if (!this.comments[slug]) this.comments[slug] = [];
        this.comments[slug].push(commentObj);
    },

    /* -------------------------
       VOTES
    ------------------------- */
    setVote(key, value) {
        this.votes[key] = value;
    },

    /* -------------------------
       REPORTS + BANS + WARNS
    ------------------------- */
    addReport(reportObj) {
        this.reports.push(reportObj);
    },

    banUser(username, until) {
        this.bans[username] = { until };
    },

    warnUser(username) {
        this.warnings[username] = (this.warnings[username] || 0) + 1;
    }
};
