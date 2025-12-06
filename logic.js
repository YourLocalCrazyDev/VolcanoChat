/* ============================================================
   VolcanoChat — Core Logic System (Display Name Update)
   ============================================================ */

const ADMIN = "admin"; // replace if you want

/* ------------------------------------------------------------
   AUTH
------------------------------------------------------------ */
const Auth = {

    signup(display, username, password, avatar) {
        display = display.trim();
        username = username.trim();
        password = password.trim();

        if (!display || !username || !password) return "INVALID";

        if (!Storage.createAccount(username, password, avatar, display))
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

    setDescription(desc) {
        if (!Storage.activeUser) return;
        Storage.updateAccount(Storage.activeUser, { description: desc });
    },

    changeAvatar(avatar) {
        if (!Storage.activeUser) return;
        Storage.updateAccount(Storage.activeUser, { avatar });
    }
};

/* ------------------------------------------------------------
   COMMENTS
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
            display: acc.display,
            avatar: acc.avatar,
            text,
            time: Date.now(),
            score: 0,
            community: slug
        };

        Storage.addComment(slug, obj);
    },

    // unchanged... (sorting, voting etc.)
};

/* ------------------------------------------------------------
   EXPORT
------------------------------------------------------------ */
window.VolcanoLogic = {
    ADMIN,
    Auth,
    Comments,
    Community,
    Roast,
    Mod,
    Storage,
    avatarList,
    communityIcons,
    randomGreeting,
    slugify,
    isBanned
};
