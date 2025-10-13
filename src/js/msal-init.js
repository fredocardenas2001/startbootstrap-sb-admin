// ✅ Environment detection (handles dev & prod cleanly)
const hostname = window.location.hostname;
console.log("Detected hostname:", hostname);

const isLocalhost =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1";

// 🔹 Main setup
async function customer_info() {
  console.log("Determining Customer...");
  window.config = await loadConfig();

  window.customerRedirect = window.config.REDIRECT_URI;
  window.customerName = window.config.CUSTOMER_NAME;
  window.clientId = window.config.CLIENT_ID;
  window.tenantId = window.config.TENANT_ID;
  window.tenantIdURL = `https://login.microsoftonline.com/${window.tenantId}`;
  window.clientLogo = window.config.CLIENT_LOGO;

  console.log("tenantIdURL =", window.tenantIdURL);
}

// 🔹 Unified async flow
(async () => {
  await customer_info();
  // ✅ Update customer name in navbar
  const nameEl = document.getElementById("customerNameDisplay");
  if (nameEl) {
    nameEl.textContent = window.customerName || "Customer";
    document.title = `${window.customerName || "ModelManager"} | ModelManager`;
  }
  const msalConfig = {
    auth: {
      clientId: window.clientId,
      authority: window.tenantIdURL,
      redirectUri: isLocalhost
        ? "http://localhost:3000"
        : window.customerRedirect,
      postLogoutRedirectUri: isLocalhost
        ? "http://localhost:3000"
        : window.customerRedirect,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true,
    },
  };

  // ✅ Build instance first
  window.msalInstance = new msal.PublicClientApplication(msalConfig);

  try {
    const result = await window.msalInstance.handleRedirectPromise();

    if (result && result.account) {
      window.msalInstance.setActiveAccount(result.account);
      window.msalAccount = result.account;
      console.log("🎟️ Logged in as:", result.account.username);
      console.log("🧾 ID Token:", result.idToken);
      console.log("🔐 Access Token:", result.accessToken);
    } else {
      const accounts = window.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        window.msalInstance.setActiveAccount(accounts[0]);
        window.msalAccount = accounts[0];
        console.log("✅ Signed in silently as:", accounts[0].username);
      } else {
        console.log("🔁 Redirecting for login...");
        await window.msalInstance.loginRedirect({
          scopes: ["openid", "profile", "email", "User.Read"],
        });
      }
    }
  } catch (e) {
    console.error("❌ MSAL redirect handling failed:", e);
  }
})();


async function loadConfig() {
  try {
    const res = await fetch('assets/config/directory-config.json');
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[msal] Error loading config:", err);
    return {};
  }
}

function updateUserDisplay(account) {
  if (!account) return;

  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");

  if (nameEl) nameEl.textContent = account.name || "(no name)";
  if (emailEl) emailEl.textContent = account.username || "(no email)";

  loadUserAvatar();
}

// Wait for DOM and MSAL to be ready
document.addEventListener("DOMContentLoaded", async () => {
  while (!window.msalAccount) {
    await new Promise((r) => setTimeout(r, 50));
  }
  updateUserDisplay(window.msalAccount);
  

});

async function loadUserAvatar() {
  const account = window.msalAccount;
  if (!account) return;

  const avatarKey = `avatar_${account.homeAccountId}`;
  const cachedAvatar = localStorage.getItem(avatarKey);
  const imgEl = document.querySelector("#navbarDropdown img");

  if (cachedAvatar) {
    if (imgEl) imgEl.src = cachedAvatar;
    return;
  }

  try {
    const tokenResp = await window.msalInstance.acquireTokenSilent({
      scopes: ["User.Read"],
      account,
    });

    const response = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: { Authorization: `Bearer ${tokenResp.accessToken}` },
    });

    if (!response.ok) throw new Error("Could not load photo");

    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      localStorage.setItem(avatarKey, base64data);
      if (imgEl) imgEl.src = base64data;
    };
    reader.readAsDataURL(blob);
  } catch (e) {
    console.warn("👤 Failed to load avatar, using default:", e);
  }
}

function logoutUser() {
  const account = window.msalInstance.getActiveAccount();
  if (account) {
    localStorage.removeItem(`avatar_${account.homeAccountId}`);
    window.msalInstance.logoutRedirect({
      account,
      postLogoutRedirectUri: window.tenantIdURL,
    });
  } else {
    console.warn("No active account to log out.");
  }
}


