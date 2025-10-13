console.log("🟢 validate.js is running!");
import "./validate.css";

document.addEventListener("DOMContentLoaded", async () => {
  while (!window.msalAccount) {
    await new Promise((r) => setTimeout(r, 50));
  }

  const account = window.msalAccount;
  console.log("✅ User active:", account.username);
});

console.log("🟢 validate.js is running!");
import "./validate.css";