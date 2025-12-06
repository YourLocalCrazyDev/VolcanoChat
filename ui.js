// ui.js – rendering + event listeners

(function () {
  const rootEl = () => document.getElementById("app-root");
  const settingsOverlay = () => document.getElementById("settings-overlay");
  const settingsContainer = () => document.getElementById("settings-container");
  const profileOverlay = () => document.getElementById("profile-overlay");
  const profileContainer = () => document.getElementById("profile-container");
  const notificationsOverlay = () =>
    document.getElementById("notifications-overlay");
  const notificationsContainer = () =>
    document.getElementById("notifications-container");
  const createOverlay = () => document.getElementById("create-overlay");
  const createContainer = () => document.getElementById("create-container");

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString();
  }

  // --- Main render ---

  function renderMain() {
    const S = window.AppState;
    const L = window.LogicAPI;

    let containerClass =
      "min-h-screen flex flex-col items-center " + (S.shake ? "shake " : "");
    if (S.themeMode === "A") {
      containerClass += "bg-orange-50 text-slate-900";
    } else if (S.themeMode === "B") {
      containerClass += "bg-slate-950 text-orange-50";
    } else {
      containerClass +=
        "bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 text-orange-50";
    }

    // Prepare community data
    const commsArray = Object.values(S.communities);
    const filteredCommunities = commsArray.filter((c) =>
      c.name.toLowerCase().includes(S.communitySearch.toLowerCase())
    );
    const trendingCommunities = [...commsArray].sort((a, b) => {
      const countA = (S.communityComments[a.slug] || []).length;
      const countB = (S.communityComments[b.slug] || []).length;
      return countB - countA;
    });

    const currentComm = S.communities[S.currentCommunity];
    const currentCommComments = S.communityComments[S.currentCommunity] || [];
    const commentsSorted = L.sortedComments();

    const username = S.username;

    // Build HTML
    rootEl().innerHTML = `
      <div class="${containerClass}">
        <div class="max-w-5xl w-full mx-auto flex gap-6 p-4">

          <!-- LEFT: COMMUNITIES LIST -->
          <div class="w-64 rounded-lg shadow-lg p-3 text-sm"
               style="background: rgba(255,255,255,0.9); color: #4a1f00;">
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-bold text-lg text-orange-800">Volcanoes</h2>
              <button
                class="text-xs bg-orange-300 hover:bg-orange-400 px-2 py-1 rounded"
                data-action="open-create-community"
              >
                + New
              </button>
            </div>

            <input
              class="border rounded px-2 py-1 w-full mb-2 text-sm"
              placeholder="Search communities..."
              value="${escapeHtml(S.communitySearch)}"
              data-bind="communitySearch"
            />

            <h3 class="text-xs font-semibold mt-2 mb-1 text-amber-700">Trending</h3>
            <div class="max-h-56 overflow-y-auto">
              ${trendingCommunities
                .map((c) => {
                  const active = S.currentCommunity === c.slug;
                  const count = (S.communityComments[c.slug] || []).length;
                  return `
                    <div
                      class="flex items-center justify-between px-2 py-1 rounded cursor-pointer mb-1 ${
                        active ? "bg-orange-100" : "hover:bg-orange-50"
                      }"
                      data-action="select-community"
                      data-slug="${c.slug}"
                    >
                      <span>
                        ${c.icon} ${escapeHtml(c.name)}
                        ${
                          c.verified
                            ? '<span class="text-blue-500 text-xs ml-1">✔</span>'
                            : ""
                        }
                      </span>
                      <span class="text-[10px] text-gray-500">${count}</span>
                    </div>
                  `;
                })
                .join("")}
            </div>

            <h3 class="text-xs font-semibold mt-3 mb-1 text-amber-700">All</h3>
            <div class="max-h-56 overflow-y-auto">
              ${filteredCommunities
                .map((c) => {
                  const active = S.currentCommunity === c.slug;
                  return `
                    <div
                      class="flex items-center justify-between px-2 py-1 rounded cursor-pointer mb-1 ${
                        active ? "bg-orange-100" : "hover:bg-orange-50"
                      }"
                      data-action="select-community"
                      data-slug="${c.slug}"
                    >
                      <span>
                        ${c.icon} ${escapeHtml(c.name)}
                        ${
                          c.verified
                            ? '<span class="text-blue-500 text-xs ml-1">✔</span>'
                            : ""
                        }
                      </span>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="flex-1 relative">

            <!-- GREETING & TOP BUTTONS -->
            ${
              username
                ? `
              <div class="relative mb-4 p-3 rounded-lg shadow"
                   style="background: rgba(255,250,240,0.95);">
                <div class="flex items-center gap-3">
                  <span class="text-4xl">${S.avatar}</span>
                  <div>
                    <p
                      class="text-3xl font-bold text-orange-900"
                      style="font-family: 'Comic Sans MS';"
                    >
                      ${escapeHtml(S.greetingText || "")}
                    </p>
                    ${
                      username === L.AppState?.ADMIN || username === "johnny big balls"
                        ? '<span class="text-yellow-500 font-bold text-sm">[ADMIN]</span>'
                        : ""
                    }
                  </div>
                </div>

                <div class="absolute right-3 top-2 flex flex-col gap-2">
                  <button
                    data-action="open-notifications"
                    class="text-3xl"
                  >
                    🔔
                  </button>
                  <button
                    data-action="open-settings"
                    class="text-4xl"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            `
                : ""
            }

            <!-- LOGIN MENU -->
            ${
              !username && S.menu === "none"
                ? `
              <div class="mb-4 rounded-lg shadow p-4"
                   style="background: rgba(255,250,240,0.95); color: #4a1f00;">
                <h2 class="text-2xl mb-2 text-orange-900">Welcome to VolcanoChat 🌋</h2>
                <p class="mb-4">
                  Log in or sign up to join lava communities, post, roast, and moderate chaos.
                </p>
                <div class="flex gap-3">
                  <button
                    data-action="open-login"
                    class="bg-green-300 hover:bg-green-400 px-4 py-2 rounded"
                  >
                    Log In
                  </button>
                  <button
                    data-action="open-signup"
                    class="bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            `
                : ""
            }

            <!-- LOGIN FORM -->
            ${
              !username && S.menu === "login"
                ? `
              <div class="bg-white rounded shadow p-4 mb-4 text-black">
                <h2 class="text-xl mb-2">Log In</h2>
                <input
                  placeholder="Username"
                  class="border rounded px-3 py-2 w-full mb-2"
                  value="${escapeHtml(S.userInput)}"
                  data-bind="loginUser"
                />
                <input
                  type="password"
                  placeholder="Password"
                  class="border rounded px-3 py-2 w-full mb-2"
                  value="${escapeHtml(S.passwordInput)}"
                  data-bind="loginPass"
                />
                <button
                  data-action="login"
                  class="bg-green-300 hover:bg-green-400 px-4 py-2 rounded w-full mb-2"
                >
                  Log In
                </button>
                <button
                  data-action="back-main"
                  class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded w-full"
                >
                  Back
                </button>
              </div>
            `
                : ""
            }

            <!-- SIGNUP FORM -->
            ${
              !username && S.menu === "signup"
                ? `
              <div class="bg-white rounded shadow p-4 mb-4 text-black">
                <h2 class="text-xl mb-2">Sign Up</h2>
                <input
                  placeholder="Create Username"
                  class="border rounded px-3 py-2 w-full mb-2"
                  value="${escapeHtml(S.signupUser)}"
                  data-bind="signupUser"
                />
                <input
                  type="password"
                  placeholder="Create Password"
                  class="border rounded px-3 py-2 w-full mb-2"
                  value="${escapeHtml(S.signupPass)}"
                  data-bind="signupPass"
                />

                <p class="mb-1">Choose Avatar:</p>
                <div class="flex flex-wrap gap-2 text-2xl max-h-32 overflow-y-auto mb-2">
                  ${LogicAPI.avatarList
                    .map((a) => {
                      const active = S.selectedAvatar === a;
                      return `
                        <button
                          class="px-2 rounded ${
                            active ? "bg-yellow-300" : "bg-white"
                          }"
                          data-action="select-signup-avatar"
                          data-avatar="${a}"
                        >
                          ${a}
                        </button>
                      `;
                    })
                    .join("")}
                </div>

                <button
                  data-action="signup"
                  class="bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded w-full mb-2"
                >
                  Sign Up
                </button>
                <button
                  data-action="back-main"
                  class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded w-full"
                >
                  Back
                </button>
              </div>
            `
                : ""
            }

            <!-- ROAST MENU -->
            ${
              username
                ? `
              <div class="bg-white text-black p-4 rounded shadow mb-4">
                <h2 class="text-xl mb-2 text-orange-800">Roast Menu</h2>
                <button
                  data-action="roast"
                  class="bg-orange-300 hover:bg-orange-400 px-4 py-2 rounded w-full mb-2"
                >
                  Roast Me
                </button>
                <button
                  data-action="volcanic-roast"
                  class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
                >
                  VOLCANIC ROAST 🌋
                </button>
                ${
                  S.roastText
                    ? `<p class="mt-3 text-lg">${escapeHtml(S.roastText)}</p>`
                    : ""
                }
              </div>
            `
                : ""
            }

            <!-- COMMUNITY HEADER -->
            ${
              currentComm && currentComm.icon
                ? `
              <div class="bg-white text-black p-4 rounded shadow mb-3 ${LogicAPI.getCommunityAccentClass(
                currentComm
              )}">
                <div class="flex justify-between items-center">
                  <div>
                    <h2 class="text-2xl font-bold text-orange-900 flex items-center gap-1">
                      ${currentComm.icon} ${escapeHtml(currentComm.name)}
                      ${
                        currentComm.verified
                          ? '<span class="text-blue-500 text-sm">✔ Verified</span>'
                          : ""
                      }
                    </h2>
                    <p class="text-sm text-gray-600">
                      ${escapeHtml(currentComm.description)}
                    </p>
                  </div>
                  ${
                    username
                      ? `
                  <div class="flex flex-col items-end gap-1">
                    ${
                      currentComm.members.includes(username)
                        ? `
                      <button
                        data-action="leave-community"
                        class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                      >
                        Leave
                      </button>`
                        : `
                      <button
                        data-action="join-community"
                        class="bg-green-200 hover:bg-green-300 px-3 py-1 rounded text-sm"
                      >
                        Join
                      </button>`
                    }
                    ${
                      username === LogicAPI.AppState?.ADMIN ||
                      username === "johnny big balls"
                        ? `
                      <button
                        data-action="toggle-verify"
                        class="bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded text-xs"
                      >
                        ${currentComm.verified ? "Unverify" : "Verify"}
                      </button>
                    `
                        : ""
                    }
                  </div>`
                      : ""
                  }
                </div>
                <div class="mt-2 flex items-center gap-3 text-sm">
                  <span>
                    Members: ${currentComm.members.length} | Posts: ${
                    currentCommComments.length
                  }
                  </span>
                  <span class="ml-auto">
                    Sort:
                    <button
                      data-action="sort-hot"
                      class="${
                        S.communitySort === "hot"
                          ? "font-bold underline"
                          : "text-gray-500"
                      }"
                    >
                      Hot
                    </button>
                    |
                    <button
                      data-action="sort-new"
                      class="${
                        S.communitySort === "new"
                          ? "font-bold underline"
                          : "text-gray-500"
                      }"
                    >
                      New
                    </button>
                  </span>
                </div>
              </div>
            `
                : ""
            }

            <!-- COMMENTS SECTION -->
            ${
              username
                ? `
              <div class="bg-white text-black p-4 rounded shadow mb-4">
                <h2 class="text-xl mb-2 text-orange-800">Comments</h2>
                ${commentsSorted
                  .map((c) => {
                    const banned = LogicAPI.isUserCurrentlyBanned(c.user);
                    const key = `${username}|${c.id}`;
                    const myVote = AppState.votes[key] || 0;
                    return `
                      <div
                        class="mb-3 cursor-pointer"
                        data-action="open-profile"
                        data-user="${c.user}"
                      >
                        <div class="flex items-center justify-between">
                          <span class="${banned ? "text-red-500 font-bold" : ""}">
                            ${c.avatar} <b>${escapeHtml(c.user)}</b>
                            ${
                              c.mood
                                ? `<span class="text-blue-500"> (${escapeHtml(
                                    c.mood
                                  )})</span>`
                                : ""
                            }
                          </span>
                          <span class="text-xs text-gray-500">
                            ${formatTime(c.time)}
                          </span>
                        </div>
                        <p class="${banned ? "text-red-500" : ""}">
                          ${escapeHtml(c.text)}
                        </p>
                        <div class="flex items-center gap-2 text-xs mt-1">
                          <button
                            data-action="vote-up"
                            data-id="${c.id}"
                            class="${myVote === 1 ? "font-bold text-orange-600" : ""}"
                          >
                            ▲
                          </button>
                          <span>${c.score || 0}</span>
                          <button
                            data-action="vote-down"
                            data-id="${c.id}"
                            class="${myVote === -1 ? "font-bold text-blue-600" : ""}"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    `;
                  })
                  .join("")}

                <input
                  placeholder="Write a comment..."
                  value="${escapeHtml(S.commentInput)}"
                  data-bind="commentInput"
                  class="border rounded px-3 py-2 w-full mt-3"
                />
                <button
                  data-action="post-comment"
                  class="bg-blue-300 hover:bg-blue-400 px-4 py-2 rounded w-full mt-2"
                >
                  Post
                </button>
              </div>
            `
                : ""
            }

          </div>
        </div>
      </div>
    `;
  }

  // --- Overlays ---

  function renderCreateOverlay() {
    const S = window.AppState;
    if (!S.showCreateModal) {
      createOverlay().classList.add("hidden");
      return;
    }
    createOverlay().classList.remove("hidden");

    createContainer().innerHTML = `
      <div class="bg-slate-900 bg-opacity-90 rounded-xl p-6 w-[480px] max-h-[80vh] overflow-y-auto relative text-white">
        <button
          class="absolute top-2 right-3 text-3xl"
          data-action="close-create"
        >
          ❌
        </button>
        <h2 class="text-2xl mb-3">Create a Volcano</h2>

        <label class="text-sm">Community name</label>
        <input
          class="w-full border rounded px-3 py-2 mb-3 text-black"
          value="${escapeHtml(S.newCommName)}"
          data-bind="newCommName"
          placeholder="John's Jamboree"
        />

        <label class="text-sm">Description</label>
        <textarea
          class="w-full border rounded px-3 py-2 mb-3 text-black"
          rows="3"
          data-bind="newCommDesc"
          placeholder="What is this community about?"
        >${escapeHtml(S.newCommDesc)}</textarea>

        <label class="text-sm block mb-1">Choose icon</label>
        <div class="flex flex-wrap gap-2 text-2xl bg-slate-800 rounded p-2 max-h-40 overflow-y-auto mb-4">
          ${LogicAPI.communityIconList
            .map((ic) => {
              const active = S.newCommIcon === ic;
              return `
                <button
                  class="px-2 py-1 rounded ${
                    active ? "bg-orange-400" : "bg-slate-700"
                  }"
                  data-action="select-comm-icon"
                  data-icon="${ic}"
                >
                  ${ic}
                </button>
              `;
            })
            .join("")}
        </div>

        <button
          data-action="create-community-confirm"
          class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded w-full"
        >
          Create Volcano
        </button>
      </div>
    `;
  }

  function renderNotificationsOverlay() {
    const S = window.AppState;
    if (!S.notificationsOpen) {
      notificationsOverlay().classList.add("hidden");
      return;
    }
    notificationsOverlay().classList.remove("hidden");

    const comments = LogicAPI.allCommentsFlat().slice(0, 8);
    const pendingReports = S.reports.filter((r) => !r.resolved);

    notificationsContainer().innerHTML = `
      <div class="bg-black bg-opacity-70 p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto relative text-white">
        <button
          class="absolute top-2 right-3 text-3xl"
          data-action="close-notifications"
        >
          ❌
        </button>
        <h2 class="text-2xl mb-3">Notifications</h2>

        <h3 class="text-xl mb-2">Latest Comments</h3>
        ${comments
          .map((c) => {
            const banned = LogicAPI.isUserCurrentlyBanned(c.user);
            const commName =
              S.communities[c.community]?.name || "??";
            return `
              <p class="mb-1 text-sm">
                <span class="${banned ? "text-red-400" : ""}">
                  ${c.avatar} <b>${escapeHtml(c.user)}</b>
                </span>
                : ${escapeHtml(c.text)}
                <span class="text-xs text-gray-400">
                  [${escapeHtml(commName)}]
                </span>
              </p>
            `;
          })
          .join("") || "<p class='text-sm text-gray-300'>No recent comments.</p>"}

        ${
          S.username === S.ADMIN || S.username === "johnny big balls"
            ? `
          <h3 class="text-xl mt-4 mb-2">Reports</h3>
          ${
            pendingReports.length === 0
              ? "<p>No pending reports.</p>"
              : pendingReports
                  .map((r) => {
                    const banned = LogicAPI.isUserCurrentlyBanned(r.target);
                    return `
                      <div class="border border-gray-500 rounded p-2 mb-2 text-sm">
                        <p>
                          <b>Target:</b>
                          <span class="${banned ? "text-red-400" : ""}">
                            ${escapeHtml(r.target)}
                          </span>
                        </p>
                        <p><b>Reporter:</b> ${escapeHtml(r.reporter)}</p>
                        <p><b>Reason:</b> ${escapeHtml(r.reason)}</p>
                        <p class="text-xs">${new Date(r.time).toLocaleString()}</p>
                        <div class="flex gap-2 mt-2">
                          <button
                            data-action="report-ban"
                            data-id="${r.id}"
                            data-target="${r.target}"
                            class="bg-red-500 px-2 py-1 rounded text-xs"
                          >
                            Ban
                          </button>
                          <button
                            data-action="report-warn"
                            data-id="${r.id}"
                            data-target="${r.target}"
                            class="bg-yellow-400 px-2 py-1 rounded text-xs text-black"
                          >
                            Warning
                          </button>
                          <button
                            data-action="report-ignore"
                            data-id="${r.id}"
                            class="bg-gray-400 px-2 py-1 rounded text-xs"
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    `;
                  })
                  .join("")
          }
        `
            : ""
        }
      </div>
    `;
  }

  function renderSettingsOverlay() {
    const S = window.AppState;
    if (!S.settingsOpen) {
      settingsOverlay().classList.add("hidden");
      return;
    }
    settingsOverlay().classList.remove("hidden");

    const isAdmin = S.username === S.ADMIN || S.username === "johnny big balls";

    // Sidebar
    const sidebarHtml = `
      <div class="settingsSidebar text-white">
        <div
          class="settingsTabButton ${
            S.settingsTab === "profile" ? "active" : ""
          }"
          data-action="settings-tab"
          data-tab="profile"
        >
          PROFILE
        </div>
        <div
          class="settingsTabButton ${
            S.settingsTab === "display" ? "active" : ""
          }"
          data-action="settings-tab"
          data-tab="display"
        >
          THEME
        </div>
        ${
          isAdmin
            ? `
        <div
          class="settingsTabButton ${
            S.settingsTab === "admin" ? "active" : ""
          }"
          data-action="settings-tab"
          data-tab="admin"
        >
          ADMIN
        </div>`
            : ""
        }
        <div
          class="settingsTabButton ${
            S.settingsTab === "about" ? "active" : ""
          }"
          data-action="settings-tab"
          data-tab="about"
        >
          ABOUT
        </div>
        <div class="settingsTabButton" data-action="logout">
          LOG OUT
        </div>
      </div>
    `;

    let panelContent = "";
    if (S.settingsTab === "profile") {
      panelContent = `
        <h2 class="text-3xl mb-4">Profile Settings</h2>
        <p class="mb-1">Choose Avatar:</p>
        <div class="flex flex-wrap gap-2 text-3xl justify-center mb-6 max-h-40 overflow-y-auto">
          ${LogicAPI.avatarList
            .map((a) => {
              const active = S.avatar === a;
              return `
                <button
                  class="px-2 py-1 rounded ${
                    active ? "bg-yellow-300" : "bg-white text-black"
                  }"
                  data-action="change-avatar"
                  data-avatar="${a}"
                >
                  ${a}
                </button>
              `;
            })
            .join("")}
        </div>
        <p class="mb-1">Your Mood:</p>
        <input
          value="${escapeHtml(S.mood)}"
          data-bind="mood"
          placeholder="Enter your mood"
          class="text-black border rounded px-3 py-2 w-64"
        />
      `;
    } else if (S.settingsTab === "display") {
      panelContent = `
        <h2 class="text-3xl mb-4">Theme Settings</h2>
        <p class="mb-2 text-sm">
          Choose your lava style. This replaces dark mode.
        </p>
        <div class="flex gap-3">
          <button
            data-action="theme"
            data-theme="A"
            class="px-4 py-2 rounded ${
              S.themeMode === "A"
                ? "bg-orange-400"
                : "bg-orange-200 text-black"
            }"
          >
            Theme A: Light Lava
          </button>
          <button
            data-action="theme"
            data-theme="B"
            class="px-4 py-2 rounded ${
              S.themeMode === "B"
                ? "bg-orange-500"
                : "bg-slate-700 text-orange-100"
            }"
          >
            Theme B: Dark Lava
          </button>
          <button
            data-action="theme"
            data-theme="C"
            class="px-4 py-2 rounded ${
              S.themeMode === "C"
                ? "bg-red-500"
                : "bg-red-300 text-black"
            }"
          >
            Theme C: Hybrid
          </button>
        </div>
      `;
    } else if (S.settingsTab === "admin" && isAdmin) {
      panelContent = `
        <h2 class="text-3xl mb-4 text-yellow-300">Admin Panel</h2>
        <p class="mb-2 text-sm">
          You control the lava. Clear comments and reset chaos.
        </p>
        <button
          data-action="clear-comments"
          class="bg-red-500 px-6 py-2 rounded text-lg"
        >
          Clear All Comments (All Communities)
        </button>
      `;
    } else if (S.settingsTab === "about") {
      panelContent = `
        <h2 class="text-3xl mb-4">About VolcanoChat</h2>
        <p class="max-w-md mx-auto text-center">
          VolcanoChat is a tiny Reddit-style lava pit. Join volcanoes,
          post, roast, report, ban, verify, and watch the magma rise.
        </p>
      `;
    }

    settingsContainer().innerHTML = `
      ${sidebarHtml}
      <div class="settingsPanel text-white">
        <span
          class="closeButton"
          data-action="close-settings"
        >
          ❌
        </span>
        ${panelContent}
      </div>
    `;
  }

  function renderProfileOverlay() {
    const S = window.AppState;
    const L = window.LogicAPI;
    if (!S.viewingProfile) {
      profileOverlay().classList.add("hidden");
      return;
    }
    profileOverlay().classList.remove("hidden");

    const accounts = StorageAPI.loadAccounts();
    const user = S.viewingProfile;
    const acct = accounts[user];
    if (!acct) {
      profileContainer().innerHTML = `
        <div class="bg-black bg-opacity-40 p-6 rounded-xl w-96 text-center text-white">
          <p>User not found.</p>
        </div>
      `;
      return;
    }

    const isBanned = L.isUserCurrentlyBanned(user);
    const comments = L.allCommentsFlat().filter((c) => c.user === user);

    profileContainer().innerHTML = `
      <div class="relative profileOverlay text-white flex items-center justify-center">
        <button
          class="absolute top-4 right-4 text-4xl"
          data-action="close-profile"
        >
          ❌
        </button>
        <div class="bg-black bg-opacity-40 p-6 rounded-xl w-96 text-center max-h-[80vh] overflow-y-auto">
          <div class="text-6xl mb-3">
            ${acct.avatar}
          </div>
          <h2 class="text-3xl font-bold ${
            isBanned ? "text-red-400" : ""
          }">
            ${escapeHtml(user)}
            ${
              user === S.ADMIN || user === "johnny big balls"
                ? '<span class="text-yellow-300 ml-2 text-xl">[ADMIN]</span>'
                : ""
            }
          </h2>
          <p class="mt-1 mb-3 text-sm">
            Warnings: ${S.warnings[user] || 0}
          </p>
          <p class="mb-4">
            Mood: ${escapeHtml(acct.mood || "None")}
          </p>

          ${
            S.username &&
            S.username !== user
              ? `
            <button
              data-action="report-user"
              data-user="${user}"
              class="bg-red-500 px-4 py-2 rounded mb-4"
            >
              Report User
            </button>
          `
              : ""
          }

          <h3 class="text-xl mb-2">Comments:</h3>
          <div class="bg-black bg-opacity-30 rounded p-3 max-h-64 overflow-y-auto text-left text-sm">
            ${
              comments
                .map((c) => {
                  const commName = S.communities[c.community]?.name || "??";
                  return `
                    <p class="mb-2">
                      ${c.avatar} <b>${escapeHtml(c.user)}</b>:
                      ${escapeHtml(c.text)}
                      <span class="text-blue-300">
                        (${escapeHtml(commName)})
                      </span>
                    </p>
                  `;
                })
                .join("") || "<p>No comments yet.</p>"
            }
          </div>
        </div>
      </div>
    `;
  }

  // --- Global render function (called by logic) ---

  function renderApp() {
    renderMain();
    renderCreateOverlay();
    renderNotificationsOverlay();
    renderSettingsOverlay();
    renderProfileOverlay();
  }

  window.renderApp = renderApp;

  // --- Event listeners / bindings ---

  function bindEvents() {
    // Main area: click
    rootEl().addEventListener("click", (e) => {
      const actEl = e.target.closest("[data-action]");
      if (!actEl) return;
      const action = actEl.getAttribute("data-action");
      const S = window.AppState;
      const L = window.LogicAPI;

      switch (action) {
        case "open-create-community":
          L.createCommunity();
          break;
        case "select-community":
          S.currentCommunity = actEl.getAttribute("data-slug");
          renderApp();
          break;
        case "open-login":
          L.setMenu("login");
          break;
        case "open-signup":
          L.setMenu("signup");
          break;
        case "back-main":
          L.setMenu("none");
          break;
        case "login":
          L.handleLogin();
          break;
        case "signup":
          L.handleSignup();
          break;
        case "select-signup-avatar":
          S.selectedAvatar = actEl.getAttribute("data-avatar");
          renderApp();
          break;
        case "roast":
          L.handleRoast();
          break;
        case "volcanic-roast":
          L.volcanicRoastAction();
          break;
        case "join-community":
          L.joinCommunity(S.currentCommunity);
          break;
        case "leave-community":
          L.leaveCommunity(S.currentCommunity);
          break;
        case "toggle-verify":
          L.toggleCommunityVerified(S.currentCommunity);
          break;
        case "sort-hot":
          S.communitySort = "hot";
          renderApp();
          break;
        case "sort-new":
          S.communitySort = "new";
          renderApp();
          break;
        case "vote-up":
          L.voteOnComment(actEl.getAttribute("data-id"), 1);
          break;
        case "vote-down":
          L.voteOnComment(actEl.getAttribute("data-id"), -1);
          break;
        case "post-comment":
          L.postComment();
          break;
        case "open-profile":
          L.openProfile(actEl.getAttribute("data-user"));
          break;
        case "open-settings":
          L.setSettingsOpen(true);
          break;
        case "open-notifications":
          L.setNotificationsOpen(true);
          break;
        default:
          break;
      }
    });

    // Main area: input changes
    rootEl().addEventListener("input", (e) => {
      const bind = e.target.getAttribute("data-bind");
      if (!bind) return;
      const S = window.AppState;

      const val = e.target.value;
      switch (bind) {
        case "communitySearch":
          S.communitySearch = val;
          break;
        case "loginUser":
          S.userInput = val;
          break;
        case "loginPass":
          S.passwordInput = val;
          break;
        case "signupUser":
          S.signupUser = val;
          break;
        case "signupPass":
          S.signupPass = val;
          break;
        case "commentInput":
          S.commentInput = val;
          break;
        default:
          break;
      }
    });

    // Create overlay
    createOverlay().addEventListener("click", (e) => {
      const actEl = e.target.closest("[data-action]");
      if (!actEl) return;
      const action = actEl.getAttribute("data-action");
      const S = window.AppState;
      const L = window.LogicAPI;
      switch (action) {
        case "close-create":
          L.setShowCreateModal(false);
          break;
        case "select-comm-icon":
          S.newCommIcon = actEl.getAttribute("data-icon");
          renderApp();
          break;
        case "create-community-confirm":
          L.handleCreateCommunityConfirm();
          break;
        default:
          break;
      }
    });

    createOverlay().addEventListener("input", (e) => {
      const bind = e.target.getAttribute("data-bind");
      if (!bind) return;
      const S = window.AppState;
      const val = e.target.value;
      switch (bind) {
        case "newCommName":
          S.newCommName = val;
          break;
        case "newCommDesc":
          S.newCommDesc = val;
          break;
        default:
          break;
      }
    });

    // Notifications overlay
    notificationsOverlay().addEventListener("click", (e) => {
      const actEl = e.target.closest("[data-action]");
      if (!actEl) return;
      const action = actEl.getAttribute("data-action");
      const L = window.LogicAPI;

      switch (action) {
        case "close-notifications":
          L.setNotificationsOpen(false);
          break;
        case "report-ban":
          L.handleBanUser(
            actEl.getAttribute("data-id"),
            actEl.getAttribute("data-target")
          );
          break;
        case "report-warn":
          L.handleWarnUser(
            actEl.getAttribute("data-id"),
            actEl.getAttribute("data-target")
          );
          break;
        case "report-ignore":
          L.handleIgnoreReport(actEl.getAttribute("data-id"));
          break;
        default:
          break;
      }
    });

    // Settings overlay
    settingsOverlay().addEventListener("click", (e) => {
      const actEl = e.target.closest("[data-action]");
      if (!actEl) return;
      const action = actEl.getAttribute("data-action");
      const L = window.LogicAPI;
      const S = window.AppState;

      switch (action) {
        case "close-settings":
          L.setSettingsOpen(false);
          break;
        case "settings-tab":
          L.setSettingsTab(actEl.getAttribute("data-tab"));
          break;
        case "logout":
          L.handleLogout();
          break;
        case "change-avatar":
          L.changeAvatar(actEl.getAttribute("data-avatar"));
          break;
        case "theme":
          L.setTheme(actEl.getAttribute("data-theme"));
          break;
        case "clear-comments":
          const cleared = {};
          for (const slug of Object.keys(S.communityComments)) {
            cleared[slug] = [];
          }
          StorageAPI.saveCommunityComments(cleared);
          S.communityComments = cleared;
          renderApp();
          break;
        default:
          break;
      }
    });

    settingsOverlay().addEventListener("input", (e) => {
      const bind = e.target.getAttribute("data-bind");
      if (!bind) return;
      const S = window.AppState;
      const val = e.target.value;

      if (bind === "mood") {
        S.mood = val;
        if (S.username) {
          const accounts = StorageAPI.loadAccounts();
          accounts[S.username] = {
            ...(accounts[S.username] || {}),
            mood: val,
            avatar: S.avatar
          };
          StorageAPI.saveAccounts(accounts);
        }
      }
    });

    // Profile overlay
    profileOverlay().addEventListener("click", (e) => {
      const actEl = e.target.closest("[data-action]");
      if (!actEl) return;
      const action = actEl.getAttribute("data-action");
      const L = window.LogicAPI;

      switch (action) {
        case "close-profile":
          L.closeProfile();
          break;
        case "report-user":
          L.submitReport(actEl.getAttribute("data-user"));
          break;
        default:
          break;
      }
    });
  }

  window.UIAPI = { bindEvents };
})();
