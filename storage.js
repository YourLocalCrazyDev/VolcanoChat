// logic.js – app state + core logic (no DOM here)

(function () {
  const ADMIN = "johnny big balls";

  // --- static data ---

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

  const communityIconList = [
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

  // --- global app state ---

  const AppState = {
    ADMIN,
    username: "",
    userInput: "",
    passwordInput: "",
    signupUser: "",
    signupPass: "",
    avatar: "😐",
    selectedAvatar: "😐",
    greetingText: "",
    mood: "",
    roastText: "",
    menu: "none", // "none" | "login" | "signup"
    shake: false,

    themeMode: "A",

    settingsOpen: false,
    settingsTab: "profile",
    notificationsOpen: false,
    viewingProfile: null,

    communities: {},
    communityComments: {},
    currentCommunity: "",
    communitySearch: "",
    communitySort: "hot",

    showCreateModal: false,
    newCommName: "",
    newCommDesc: "",
    newCommIcon: "🔥",

    commentInput: "",

    reports: [],
    warnings: {},
    bannedUsers: {},
    votes: {}
  };

  // Helper -> is user banned
  function isUserCurrentlyBanned(name) {
    const info = AppState.bannedUsers[name];
    if (!info) return false;
    if (!info.until) return true;
    return info.until > Date.now();
  }

  // Flatten all comments for notifications/profile
  function allCommentsFlat() {
    return Object.values(AppState.communityComments)
      .flat()
      .sort((a, b) => b.time - a.time);
  }

  // Accent class for community header border
  function getCommunityAccentClass(comm) {
    if (!comm || !comm.icon) return "border-orange-400";
    const code = comm.icon.codePointAt(0) || 0;
    const pick = code % 5;
    switch (pick) {
      case 0: return "border-t-4 border-orange-400";
      case 1: return "border-t-4 border-red-400";
      case 2: return "border-t-4 border-amber-400";
      case 3: return "border-t-4 border-yellow-400";
      case 4: return "border-t-4 border-rose-400";
      default: return "border-t-4 border-orange-400";
    }
  }

  // --- persistence wrappers that also update AppState + re-render ---

  function persistCommunities(newComms) {
    AppState.communities = newComms;
    StorageAPI.saveCommunities(newComms);
    requestRender();
  }

  function persistCommunityComments(newCC) {
    AppState.communityComments = newCC;
    StorageAPI.saveCommunityComments(newCC);
    requestRender();
  }

  function persistReports(newReports) {
    AppState.reports = newReports;
    StorageAPI.saveReports(newReports);
    requestRender();
  }

  function persistWarnings(newWarnings) {
    AppState.warnings = newWarnings;
    StorageAPI.saveWarnings(newWarnings);
    requestRender();
  }

  function persistBannedUsers(newBans) {
    AppState.bannedUsers = newBans;
    StorageAPI.saveBannedUsers(newBans);
    requestRender();
  }

  function persistVotes(newVotes) {
    AppState.votes = newVotes;
    StorageAPI.saveVotes(newVotes);
    requestRender();
  }

  function persistTheme(mode) {
    AppState.themeMode = mode;
    StorageAPI.saveTheme(mode);
    requestRender();
  }

  // --- init (equivalent to useEffect on mount) ---

  function initAppState() {
    const savedUser = StorageAPI.loadActiveUser();
    let comms = StorageAPI.loadCommunities();
    let cc = StorageAPI.loadCommunityComments();
    const savedReports = StorageAPI.loadReports();
    const savedWarnings = StorageAPI.loadWarnings();
    const savedBans = StorageAPI.loadBannedUsers();
    const savedVotes = StorageAPI.loadVotes();
    const savedTheme = StorageAPI.loadTheme();

    if (Object.keys(comms).length === 0) {
      const slug = "volcanochat";
      comms = {
        [slug]: {
          slug,
          name: "VolcanoChat",
          description: "The main lava pit of chaos.",
          icon: "🌋",
          creator: ADMIN,
          createdAt: Date.now(),
          mods: [ADMIN],
          members: [],
          verified: true
        }
      };
      cc = { [slug]: [] };
      StorageAPI.saveCommunities(comms);
      StorageAPI.saveCommunityComments(cc);
    }

    AppState.communities = comms;
    AppState.communityComments = cc;
    AppState.reports = savedReports;
    AppState.warnings = savedWarnings;
    AppState.bannedUsers = savedBans;
    AppState.votes = savedVotes;
    AppState.themeMode = savedTheme;
    AppState.currentCommunity = Object.keys(comms)[0];

    if (savedUser) {
      const accounts = StorageAPI.loadAccounts();
      const acct = accounts[savedUser];
      if (acct) {
        AppState.username = savedUser;
        AppState.avatar = acct.avatar;
        AppState.mood = acct.mood || "";
        AppState.greetingText = `${randomGreeting()}, ${savedUser}!`;
      }
    }
  }

  // Update account data + propagate to comments
  function saveAccountData(name, data) {
    const accounts = StorageAPI.loadAccounts();
    accounts[name] = { ...accounts[name], ...data };
    StorageAPI.saveAccounts(accounts);

    const newCC = {};
    for (const slug of Object.keys(AppState.communityComments)) {
      newCC[slug] = AppState.communityComments[slug].map((c) =>
        c.user === name ? { ...c, ...data } : c
      );
    }
    persistCommunityComments(newCC);
  }

  // --- Auth ---

  function handleSignup() {
    if (!AppState.signupUser.trim() || !AppState.signupPass.trim()) return;

    const accounts = StorageAPI.loadAccounts();
    if (accounts[AppState.signupUser]) {
      alert("Account already exists.");
      return;
    }

    accounts[AppState.signupUser] = {
      password: AppState.signupPass,
      avatar: AppState.selectedAvatar,
      mood: ""
    };

    StorageAPI.saveAccounts(accounts);
    StorageAPI.saveActiveUser(AppState.signupUser);

    AppState.username = AppState.signupUser;
    AppState.avatar = AppState.selectedAvatar;
    AppState.mood = "";
    AppState.greetingText = `Welcome to VolcanoChat, ${AppState.signupUser}!`;
    AppState.menu = "none";

    requestRender();
  }

  function handleLogin() {
    const accounts = StorageAPI.loadAccounts();
    const acct = accounts[AppState.userInput];

    if (!acct) {
      alert("No such account.");
      return;
    }

    const banInfo = AppState.bannedUsers[AppState.userInput];
    if (banInfo) {
      if (!banInfo.until || banInfo.until > Date.now()) {
        const msg = banInfo.until
          ? `You are banned until ${new Date(banInfo.until).toLocaleString()}.`
          : "You are permanently banned.";
        alert(msg);
        return;
      }
    }

    if (acct.password !== AppState.passwordInput) {
      alert("Wrong password.");
      return;
    }

    StorageAPI.saveActiveUser(AppState.userInput);

    AppState.username = AppState.userInput;
    AppState.avatar = acct.avatar;
    AppState.mood = acct.mood || "";
    AppState.greetingText = `${randomGreeting()}, ${AppState.userInput}!`;
    AppState.roastText = "";
    AppState.menu = "none";

    requestRender();
  }

  function handleLogout() {
    StorageAPI.saveActiveUser("");
    AppState.username = "";
    AppState.greetingText = "";
    AppState.roastText = "";
    AppState.mood = "";
    AppState.settingsOpen = false;
    requestRender();
  }

  // --- Roasts ---

  function handleRoast() {
    if (!AppState.username) return;
    const text =
      roasts[Math.floor(Math.random() * roasts.length)](AppState.username);
    AppState.roastText = text;
    requestRender();
  }

  function volcanicRoastAction() {
    if (!AppState.username) return;
    const text =
      volcanicRoasts[Math.floor(Math.random() * volcanicRoasts.length)](
        AppState.username
      );
    AppState.roastText = text;
    AppState.shake = true;
    requestRender();
    setTimeout(() => {
      AppState.shake = false;
      requestRender();
    }, 600);
  }

  // --- Communities ---

  function createCommunity() {
    if (!AppState.username) {
      alert("You must be logged in to create a community.");
      return;
    }
    AppState.newCommName = "";
    AppState.newCommDesc = "";
    AppState.newCommIcon = "🔥";
    AppState.showCreateModal = true;
    requestRender();
  }

  function handleCreateCommunityConfirm() {
    if (!AppState.username) return;
    if (!AppState.newCommName.trim()) {
      alert("Community needs a name.");
      return;
    }
    const slug = slugify(AppState.newCommName);
    if (!slug) {
      alert("Invalid name.");
      return;
    }
    if (AppState.communities[slug]) {
      alert("Community already exists.");
      return;
    }

    const description =
      AppState.newCommDesc.trim() || "A VolcanoChat community.";
    const icon = AppState.newCommIcon || "🔥";

    const newComms = {
      ...AppState.communities,
      [slug]: {
        slug,
        name: AppState.newCommName.trim(),
        description,
        icon,
        creator: AppState.username,
        createdAt: Date.now(),
        mods: [AppState.username],
        members: [AppState.username],
        verified: false
      }
    };

    const newCC = { ...AppState.communityComments, [slug]: [] };

    StorageAPI.saveCommunities(newComms);
    StorageAPI.saveCommunityComments(newCC);

    AppState.communities = newComms;
    AppState.communityComments = newCC;
    AppState.currentCommunity = slug;
    AppState.showCreateModal = false;

    requestRender();
  }

  function joinCommunity(slug) {
    if (!AppState.username) {
      alert("Log in first.");
      return;
    }
    const comm = AppState.communities[slug];
    if (!comm.members.includes(AppState.username)) {
      const updated = {
        ...AppState.communities,
        [slug]: {
          ...comm,
          members: [...comm.members, AppState.username]
        }
      };
      persistCommunities(updated);
    }
  }

  function leaveCommunity(slug) {
    if (!AppState.username) return;
    const comm = AppState.communities[slug];
    const updatedMembers = comm.members.filter((m) => m !== AppState.username);
    const updated = {
      ...AppState.communities,
      [slug]: { ...comm, members: updatedMembers }
    };
    persistCommunities(updated);
  }

  function toggleCommunityVerified(slug) {
    if (AppState.username !== ADMIN) return;
    const comm = AppState.communities[slug];
    const updated = {
      ...AppState.communities,
      [slug]: { ...comm, verified: !comm.verified }
    };
    persistCommunities(updated);
  }

  // --- Comments ---

  function postComment() {
    if (!AppState.username) {
      alert("Log in first.");
      return;
    }
    if (!AppState.commentInput.trim()) return;

    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const newComment = {
      id,
      user: AppState.username,
      avatar: AppState.avatar,
      mood: AppState.mood,
      text: AppState.commentInput,
      time: Date.now(),
      score: 0,
      community: AppState.currentCommunity
    };

    const currentCommComments =
      AppState.communityComments[AppState.currentCommunity] || [];
    const newCC = {
      ...AppState.communityComments,
      [AppState.currentCommunity]: [...currentCommComments, newComment]
    };
    persistCommunityComments(newCC);
    AppState.commentInput = "";
    requestRender();
  }

  function voteOnComment(commentId, direction) {
    if (!AppState.username) {
      alert("Log in to vote.");
      return;
    }

    const key = `${AppState.username}|${commentId}`;
    const previous = AppState.votes[key] || 0;
    let newVote = direction;
    if (previous === direction) newVote = 0;
    const delta = newVote - previous;

    const newCC = { ...AppState.communityComments };
    newCC[AppState.currentCommunity] = (newCC[AppState.currentCommunity] || []).map(
      (c) =>
        c.id === commentId ? { ...c, score: (c.score || 0) + delta } : c
    );

    persistCommunityComments(newCC);

    const newVotes = { ...AppState.votes, [key]: newVote };
    persistVotes(newVotes);
  }

  function sortedComments() {
    const list = [...(AppState.communityComments[AppState.currentCommunity] || [])];
    if (AppState.communitySort === "new") {
      return list.sort((a, b) => b.time - a.time);
    } else {
      return list.sort((a, b) => {
        const sA = a.score || 0;
        const sB = b.score || 0;
        if (sB !== sA) return sB - sA;
        return b.time - a.time;
      });
    }
  }

  // --- Reports & moderation ---

  function submitReport(target) {
    if (!AppState.username || AppState.username === target) return;
    const reason =
      window.prompt(`Why are you reporting ${target}? (optional)`) ||
      "No reason provided";

    const newReport = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      target,
      reporter: AppState.username,
      reason,
      time: Date.now(),
      resolved: false,
      action: null
    };

    const updated = [...AppState.reports, newReport];
    persistReports(updated);
    alert("Report submitted.");
  }

  function handleBanUser(reportId, target) {
    const minutesStr = window.prompt(
      "Ban duration in minutes (0 for permanent):",
      "60"
    );
    if (minutesStr === null) return;
    const mins = parseInt(minutesStr, 10);
    if (isNaN(mins) || mins < 0) {
      alert("Invalid duration.");
      return;
    }
    const until = mins === 0 ? null : Date.now() + mins * 60 * 1000;
    const newBans = { ...AppState.bannedUsers, [target]: { until } };
    persistBannedUsers(newBans);

    const updatedReports = AppState.reports.map((r) =>
      r.id === reportId ? { ...r, resolved: true, action: "ban" } : r
    );
    persistReports(updatedReports);
  }

  function handleWarnUser(reportId, target) {
    const newWarnings = {
      ...AppState.warnings,
      [target]: (AppState.warnings[target] || 0) + 1
    };
    persistWarnings(newWarnings);

    const updatedReports = AppState.reports.map((r) =>
      r.id === reportId ? { ...r, resolved: true, action: "warn" } : r
    );
    persistReports(updatedReports);
  }

  function handleIgnoreReport(reportId) {
    const updatedReports = AppState.reports.map((r) =>
      r.id === reportId ? { ...r, resolved: true, action: "ignore" } : r
    );
    persistReports(updatedReports);
  }

  // --- Other helpers / UI state changes ---

  function changeAvatar(a) {
    if (!AppState.username) return;
    AppState.avatar = a;
    saveAccountData(AppState.username, { avatar: a });
    requestRender();
  }

  function openProfile(user) {
    AppState.viewingProfile = user;
    requestRender();
  }

  function closeProfile() {
    AppState.viewingProfile = null;
    requestRender();
  }

  function setTheme(mode) {
    persistTheme(mode);
  }

  function setSettingsOpen(open) {
    AppState.settingsOpen = open;
    requestRender();
  }

  function setSettingsTab(tab) {
    AppState.settingsTab = tab;
    requestRender();
  }

  function setNotificationsOpen(open) {
    AppState.notificationsOpen = open;
    requestRender();
  }

  function setShowCreateModal(open) {
    AppState.showCreateModal = open;
    requestRender();
  }

  function setMenu(menu) {
    AppState.menu = menu;
    requestRender();
  }

  // Called by app.js when DOM is ready
  function startAppLogic() {
    initAppState();
  }

  // render hook (defined in ui.js)
  function requestRender() {
    if (typeof window.renderApp === "function") {
      window.renderApp();
    }
  }

  // Expose globally
  window.AppState = AppState;
  window.LogicAPI = {
    avatarList,
    communityIconList,
    greetings,
    roasts,
    volcanicRoasts,
    isUserCurrentlyBanned,
    allCommentsFlat,
    getCommunityAccentClass,
    sortedComments,
    handleSignup,
    handleLogin,
    handleLogout,
    handleRoast,
    volcanicRoastAction,
    createCommunity,
    handleCreateCommunityConfirm,
    joinCommunity,
    leaveCommunity,
    toggleCommunityVerified,
    postComment,
    voteOnComment,
    submitReport,
    handleBanUser,
    handleWarnUser,
    handleIgnoreReport,
    changeAvatar,
    openProfile,
    closeProfile,
    setTheme,
    setSettingsOpen,
    setSettingsTab,
    setNotificationsOpen,
    setShowCreateModal,
    setMenu,
    startAppLogic
  };
})();
