// app.js – entry point

window.addEventListener("DOMContentLoaded", () => {
  // Initialize logic state from storage
  LogicAPI.startAppLogic();

  // Bind events
  UIAPI.bindEvents();

  // First render
  renderApp();
});
