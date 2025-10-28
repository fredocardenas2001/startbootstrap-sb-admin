console.log("🧩 tabulate-entry.js loaded");

import Tabulate from './Tabulate.js';

// Find the mount point
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('tabulateMountPoint');
  if (!container) return;

    
  // Initialize Tabulate module
  const tabulate = new Tabulate({ container });
  tabulate.initialize();
});