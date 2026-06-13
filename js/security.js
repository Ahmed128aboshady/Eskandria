/**
 * Eskandria Restaurant - Security & Anti-Inspect Script
 * Provides basic anti-inspection techniques and SHA-256 verification of credentials.
 */

// Hashes for Mada / Sasusaku12@MY
const CREDENTIAL_HASHES = {
  user: "57d2616d988f865c20f1bde3be0d33f704361fb81cec6d64c1d62b559dad6c1b",
  pass: "6b8762dff7f54e99ee2116de69ffc91f26d2c7b3cf371cc82a4dbe6a243e81fb"
};

/**
 * SHA-256 helper using native crypto API
 */
async function computeSHA256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Validates login inputs against hashed values
 */
async function verifyAdminLogin(username, password) {
  const hashedUser = await computeSHA256(username);
  const hashedPass = await computeSHA256(password);
  
  if (hashedUser === CREDENTIAL_HASHES.user && hashedPass === CREDENTIAL_HASHES.pass) {
    // Generate a simple session token (timestamp encrypted or just hashed status)
    const token = await computeSHA256("EskandriaAdminSession_" + new Date().toDateString());
    sessionStorage.setItem("admin_token", token);
    return true;
  }
  return false;
}

/**
 * Check if the admin is logged in
 */
async function isAdminLoggedIn() {
  const token = sessionStorage.getItem("admin_token");
  if (!token) return false;
  const expectedToken = await computeSHA256("EskandriaAdminSession_" + new Date().toDateString());
  return token === expectedToken;
}

/**
 * Anti-Inspect element protection
 */
(function() {
  // Disable Right-Click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  }, false);

  // Disable developer shortcuts
  document.addEventListener('keydown', function(e) {
    // F12 key
    if (e.keyCode === 123) {
      e.preventDefault();
      triggerInspectWarning();
      return false;
    }
    
    // Ctrl+Shift+I / Cmd+Opt+I (Inspect element)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      triggerInspectWarning();
      return false;
    }
    
    // Ctrl+Shift+J / Cmd+Opt+J (Console panel)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      triggerInspectWarning();
      return false;
    }

    // Ctrl+Shift+C (Element inspector selector)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      triggerInspectWarning();
      return false;
    }
    
    // Ctrl+U / Cmd+Opt+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
      e.preventDefault();
      triggerInspectWarning();
      return false;
    }
  }, false);

  // Clear console loop & debugger blocker
  setInterval(function() {
    // A trick to detect devtools: if open, this debugger call triggers
    // We only execute this check if the user is NOT logged in as admin
    if (!sessionStorage.getItem("admin_token")) {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        // Devtools opened!
        console.clear();
        console.log("%cSECURITY WARNING: Unauthorized inspection of elements is restricted.", "color: red; font-size: 20px; font-weight: bold;");
      }
    }
  }, 1000);

  function triggerInspectWarning() {
    // Create a warning notice screen or alert
    alert("System Protection: Code inspection and DevTools are restricted on this website.");
  }
})();
