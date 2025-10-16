document.addEventListener("DOMContentLoaded", () => {
    fetch("assets/config/directory-config.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load config JSON");
      return res.json();
    })
    .then((config) => {
      window.config = config;
      window.moniker = config.ACCOUNT_MONIKER;
      window.tabulate_url = config.TABULATE_SUBMISSION_URL;

      console.log("🔧 Loaded config:");
      console.log("window.moniker =", window.moniker);
      console.log("window.tabulate_url =", window.tabulate_url);
      
      loadManifestAndRender();
    })
    .catch((err) => {
      console.error("❌ Config load failed:", err);
    });

  const table = document.getElementById("tabulate");

  function classifyCells() {
    if (!table || !table.rows || !table.rows[0]) return;
    const rows = table.rows;
    const rowCount = rows.length;
    const colCount = rows[0].cells.length;

    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const cell = rows[r].cells[c];
        const textarea = cell.querySelector("textarea");
        cell.className = "";

        if (r === 0 && c === 0) {
          cell.classList.add("corner-cell");
        } else if (r === 0) {
          cell.classList.add("col-control");
        } else if (r === 1 && c === 0) {
          cell.classList.add("header-corner");
        } else if (r === 1 && c === 1) {
          cell.classList.add("top-left");
          if (textarea) {
            textarea.classList.add("top-left");
            textarea.readOnly = true;
            textarea.placeholder = "";
          }
        } else if (r === 1 && c >= 2) {
          cell.classList.add("top-row");
          if (textarea) textarea.readOnly = false;
        } else if (r >= 2 && c === 0) {
          cell.classList.add("row-control");
        } else if (r >= 2 && c === 1) {
          cell.classList.add("first-col");
          if (textarea) textarea.readOnly = false;
        } else if (r >= 2 && c >= 2) {
          cell.classList.add("middle-cell");
          if (textarea) textarea.readOnly = true;
        }
      }
    }
  }

document.addEventListener("DOMContentLoaded", async () => {
  while (!window.msalAccount) {
    await new Promise((r) => setTimeout(r, 50));
  }

  const account = window.msalAccount;
  console.log("✅ User active:", account.username);
});


  function generateQueries() {
    if (!table || !table.rows || !table.rows[0]) return;
    const rows = table.rows;
    const rowCount = rows.length;
    const colCount = rows[0].cells.length;

    for (let r = 2; r < rowCount; r++) {
      const rowLabelEl = rows[r].cells[1]?.querySelector("textarea");
      const rowLabel = rowLabelEl ? rowLabelEl.value.trim() : "";

      for (let c = 2; c < colCount; c++) {
        const colHeaderEl = rows[1].cells[c]?.querySelector("textarea");
        const colHeader = colHeaderEl ? colHeaderEl.value.trim() : "";

        const textarea = rows[r].cells[c]?.querySelector("textarea");
        if (textarea && rowLabel && colHeader) {
          textarea.value = `${colHeader} in ${rowLabel}`;
        }
      }
    }
  }

  function addRow() {
    const newRow = table.insertRow(-1);
    for (let c = 0; c < table.rows[0].cells.length; c++) {
      const newCell = newRow.insertCell(c);
      if (c === 0) {
        newCell.innerHTML = `<button class="delete-btn" onclick="deleteRow(this)"><img src="assets/img/delete-row2.svg" title="Delete Row" height="24px"️></button>`;
      } else {
        newCell.innerHTML = `<textarea></textarea>`;
      }
    }
    classifyCells();
    generateQueries();
  }

  function addColumn() {
    const rows = table.rows;
    const newColIndex = rows[0].cells.length;

    for (let r = 0; r < rows.length; r++) {
      const newCell = rows[r].insertCell();
      if (r === 0) {
        newCell.innerHTML = `<button class="delete-btn" onclick="deleteColumn(this)"><img src="assets/img/delete-column.svg" title="Delete Column" height="24px"️></button>`;
      } else {
        newCell.innerHTML = `<textarea placeholder=""></textarea>`;
      }
    }

    classifyCells();
    generateQueries();
  }

  function deleteRow(button) {
    const row = button.closest("tr");
    const rowIndex = row.rowIndex;
    if (rowIndex === 0 || rowIndex === 1) return;
    table.deleteRow(rowIndex);
    classifyCells();
    generateQueries();
  }

  function deleteColumn(buttonEl) {
    const index = buttonEl.parentElement.cellIndex;
    const colCount = table.rows[0].cells.length;

    if (index <= 1) return;          // protect control + first editable col
    if (colCount <= 3) return;       // avoid deleting below 3 columns total

    for (let r = 0; r < table.rows.length; r++) {
      table.rows[r].deleteCell(index);
    }

    classifyCells();
    generateQueries();
  }

  function collectQueriesForSubmission() {
    const queries = [];
    const rows = table.rows;
    for (let r = 2; r < rows.length; r++) {
      for (let c = 2; c < rows[r].cells.length; c++) {
        const textarea = rows[r].cells[c].querySelector("textarea");
        const value = textarea?.value?.trim();
        if (value) {
          queries.push({ row: r, col: c, query: value });
        }
      }
    }
    return queries;
  }

async function submitQueries() {
  if (window.tabulateSubmitting) {
    console.warn("⚠️ Duplicate submit attempt blocked.");
    return;
  }
  window.tabulateSubmitting = true;

  try {
    const queries = collectQueriesForSubmission();
    if (!queries.length) {
      console.warn("[tabulate] ⚠️ No queries found, skipping submission.");
      return;
    }

  console.log("🚀 [submitQueries] Starting submission process at", new Date().toLocaleString());

  console.group("📋 Collected Queries");
  queries.forEach((q, i) => console.log(`→ #${i + 1} [r${q.row},c${q.col}] =`, q.query.trim()));
  console.groupEnd();

  // Shared ID for all queries in this batch
  const sharedQueryId = crypto.randomUUID();
  const submittedTs = Math.floor(Date.now() / 1000);
  console.log(`🧩 Shared Query ID: ${sharedQueryId}`);
  console.log(`🕓 Submission Timestamp: ${submittedTs} (${new Date(submittedTs * 1000).toLocaleString()})`);

  // Build static part of config
  const baseConfig = {
    item_type: "tabulate",
    query_id: sharedQueryId,
    query_submitted: submittedTs,
    moniker: window.moniker,
    query_configs: {
      search_mode: "advanced",
      rag_generation_config: {
        model: "azure/gpt-4.1-mini",
        temperature: 0,
        max_tokens_to_sample: 512,
      },
      search_settings: {
        use_hybrid_search: true,
        use_semantic_search: true,
        use_fulltext_search: true,
        include_metadatas: true,
      },
      include_title_if_available: true,
      task_prompt: `## Task:
Answer the given question using only the provided context chunks.

## Output Requirements:
1. Provide a concise answer in 1–2 sentences.
2. At the end of your answer, include a "Citations" section listing all documents you used.
3. Do NOT invent sources or cite anything not present in the context.
4. For each citation, include:
   - The document title (from metadata.onedrive_name)
   - The document ID (from id)
   - The web URL (from metadata.web_url)

## Inputs:
Context: {context}

## Answer:
`,
    },
  };

  // 🔹 For each query cell, create its own payload
  const payloads = queries.map(({ row, col, query }) => ({
    ...baseConfig,
    tabulates: [
      {
        tabulate_id: crypto.randomUUID(),
        row,
        column: col,
        rag_query: query,
      },
    ],
  }));

  console.log(`📦 Preparing ${payloads.length} payload(s) to upload to ${window.tabulate_url}`);
  console.groupCollapsed("📦 Payload Preview (first 1–2)");
  payloads.slice(0, 2).forEach((p, i) => {
    console.log(`Payload #${i + 1}`, JSON.stringify(p, null, 2));
  });
  if (payloads.length > 2) console.log(`...and ${payloads.length - 2} more`);
  console.groupEnd();

  // 🔹 Upload all payloads independently
  const uploadPromises = payloads.map((p, i) => {
    console.time(`⏱ Upload ${i + 1}/${payloads.length}`);
    console.log(`⬆️ Uploading part ${i + 1}/${payloads.length} (tabulate_id=${p.tabulates[0].tabulate_id})`);

    return fetch(window.tabulate_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    })
      .then((resp) => {
        console.timeEnd(`⏱ Upload ${i + 1}/${payloads.length}`);
        if (!resp.ok) throw new Error(`Upload failed (${resp.status})`);
        console.log(`✅ Upload ${i + 1}/${payloads.length} succeeded`);
      })
      .catch((err) => {
        console.error(`❌ Upload ${i + 1} failed:`, err);
      });
  });

  // 🔹 Wait for all uploads to finish
Promise.all(uploadPromises)
  .then(() => {
    console.log("🎯 All partial files uploaded successfully!");

    // 🧹 Clear out previous query text so next run starts clean
    const table = document.getElementById("tabulate");
    for (let r = 2; r < table.rows.length; r++) {
      for (let c = 2; c < table.rows[r].cells.length; c++) {
        const cell = table.rows[r].cells[c];
        if (cell && cell.textContent.trim()) {
          cell.textContent = ""; // clear query
        }
      }
    }

    // optional: regenerate default queries
    generateQueries();

    // store view preference and reload to results page
    sessionStorage.setItem("tabulateView", "results");
    window.location.reload();
  })
  .finally(() => {
    window.tabulateSubmitting = false;
  });


  } catch (err) {
    console.error("❌ submitQueries error:", err);
    window.tabulateSubmitting = false;
  }
}


async function loadManifestAndRender() {
  try {
    const username = window.config.API_USERNAME;
    const password = window.config.API_PASSWORD;
    const baseUrl = window.config.API_JSON_URL;
    const manifestName = window.config.API_JSON_MANIFEST;
    const moniker = window.config.ACCOUNT_MONIKER;

    const basicAuth = btoa(`${username}:${password}`);
    const jsonPath = `${moniker}/${manifestName}`;

    // ✅ Add timestamp to prevent caching
    const jsonUrl = `${baseUrl}${jsonPath}?_=${Date.now()}`;

    console.log("📡 Fetching manifest (refresh-safe):", jsonUrl);

    const resp = await fetch(jsonUrl, {
      headers: { "Authorization": `Basic ${basicAuth}` },
      cache: "no-store" // ✅ double insurance against caching
    });

    if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.status}`);
    const manifest = await resp.json();
    renderManifestTable(Array.isArray(manifest) ? manifest : [manifest]);
  } catch (err) {
    console.error("❌ Manifest load failed:", err);
  }
}


  function renderManifestTable(entries) {
    console.log("📝 Starting to render manifest table with entries:", entries.length);
    const tbody = document.querySelector("#manifestTable tbody");
    if (!tbody) {
      console.error("❌ Could not find #manifestTable tbody");
      return;
    }
    tbody.innerHTML = "";

    entries
      .filter(e => {
        const keep = e && e.filename;
        console.log("🔍 Checking entry:", e, "→ keep?", keep);
        return keep;
      })
      .sort((a, b) => (b.query_submitted || 0) - (a.query_submitted || 0)) // newest first
      .forEach(entry => {
        try {
          console.log("➕ Rendering row for:", entry);
          const tr = document.createElement("tr");

          const submitted = new Date(entry.query_submitted * 1000);
          console.log("   📅 Submitted:", entry.query_submitted, "→", submitted.toLocaleString());
          
          const completed = entry.query_returned && entry.query_returned !== false
            ? new Date(entry.query_returned * 1000)
            : null;
          console.log("   ✅ Completed:", entry.query_returned, "→", completed ? completed.toLocaleString() : "Running");

          const duration = (completed && entry.query_submitted)
            ? (entry.query_returned - entry.query_submitted)
            : null;
          console.log("   ⏱ Duration:", duration);

          const tdSubmitted = document.createElement("td");
          tdSubmitted.textContent = submitted.toLocaleString();
          tr.appendChild(tdSubmitted);

          const tdCompleted = document.createElement("td");
          tdCompleted.textContent = completed
            ? completed.toLocaleString()
            : "Running";
          tr.appendChild(tdCompleted);

          const tdDuration = document.createElement("td");
          if (duration) {
            const mm = String(Math.floor(duration / 60)).padStart(2, "0");
            const ss = String(duration % 60).padStart(2, "0");
            tdDuration.textContent = `${mm}:${ss}`;
          } else {
            tdDuration.textContent = "--";
          }
          tr.appendChild(tdDuration);

          const tdQueries = document.createElement("td");
          tdQueries.textContent = entry.query_num || 0;
          tr.appendChild(tdQueries);

          tr.style.cursor = "pointer";
          tr.style.cursor = "pointer";
          tr.style.cursor = "pointer";
          tr.addEventListener("click", () => {
            console.log("🖱 Row clicked → opening result for:", entry.filename);

            // Fetch and render the tabulate result (rebuilds table from row/col coords)
            openResult(entry);

            // Toggle sections: hide manifest, show detail
            const resultsSection = document.getElementById("results-section");
            const resultDetailEl = document.getElementById("result-detail");
            if (resultsSection) resultsSection.style.display = "none";
            if (resultDetailEl) resultDetailEl.style.display = "block";
          });



        tbody.appendChild(tr);

      } catch (err) {
        console.warn("⚠️ Skipping bad entry:", entry, err);
      }
    });



    console.log("✅ Finished rendering manifest table");
}

  // Open JSON result and render tabulate table
  async function openResult(entry) {
    try {
      const username = window.config.API_USERNAME;
      const password = window.config.API_PASSWORD;
      const baseUrl = window.config.API_JSON_URL;
      const moniker = window.config.ACCOUNT_MONIKER;

      const basicAuth = btoa(`${username}:${password}`);
      const jsonUrl = `${baseUrl}${moniker}/${entry.filename}`;
      console.log("📡 Fetching result:", jsonUrl);

      const resp = await fetch(jsonUrl, {
        headers: { "Authorization": `Basic ${basicAuth}` }
      });
      if (!resp.ok) throw new Error(`Failed to fetch result: ${resp.status}`);
      const result = await resp.json();

      renderResultDetail(result);
    } catch (err) {
      console.error("❌ Failed to load result:", err);
    }
  }

  function renderResultDetail(result) {
    const container = document.getElementById("result-detail");
    container.innerHTML = "<button type='button' onclick='showManifest()'>⬅ Back to Manifest</button>";

    if (!result || !Array.isArray(result.tabulates)) {
      container.innerHTML += "<p>⚠️ No valid tabulates found.</p>";
      return;
    }

    const maxRow = Math.max(...result.tabulates.map(t => t.row));
    const maxCol = Math.max(...result.tabulates.map(t => t.column));

    console.log("📐 Table size → rows:", maxRow, "cols:", maxCol);

    const table = document.createElement("table");
    table.className = "tabulate-container";

    for (let r = 1; r <= maxRow; r++) {        // ✅ start at 1
      const tr = document.createElement("tr");
      for (let c = 1; c <= maxCol; c++) {      // ✅ start at 1
        const td = document.createElement("td");
        const t = result.tabulates.find(x => x.row === r && x.column === c);
        td.innerHTML = t ? (t.rag_result || t.rag_query || "") : "";
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    container.appendChild(table);
  }


  table.addEventListener("input", (e) => {
    const cell = e.target.closest("td");
    if (!cell) return;
    if (cell.classList.contains("top-row") || cell.classList.contains("first-col")) {
      generateQueries();
    }
  });

  // Expose to global scope for inline handlers
  window.addRow = addRow;
  window.addColumn = addColumn;
  window.deleteRow = deleteRow;
  window.deleteColumn = deleteColumn;

  // Initialize
  classifyCells();
  generateQueries();

  // 🔽 Append Submit button after the table
  const submitContainer = document.createElement("div");
  submitContainer.className = "submit-container";
  submitContainer.style.marginTop = "1rem";

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";

  // 🧹 Prevent accidental double-binding
  submitBtn.replaceWith = null;        // just for safety
  submitBtn.removeEventListener("click", submitQueries); // in case it's reused
  submitBtn.onclick = null;            // clear any previous inline handler
  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    try {
      await submitQueries();
    } finally {
      submitBtn.disabled = false;
    }
  });


  const submitImg = document.createElement("img");
  submitImg.src = "assets/img/tabulate-data.svg";
  submitImg.title = "Feed Me Seymour!";
  submitImg.alt = "Submit";
  submitImg.height = 50;

  submitBtn.appendChild(submitImg);
  submitContainer.appendChild(submitBtn);

  table.parentNode.insertBefore(submitContainer, table.nextSibling);


// ✅ Unified cleanup helper
function hideResultDetail() {
  const resultDetailEl = document.getElementById("result-detail");
  if (resultDetailEl) {
    resultDetailEl.style.display = "none";
    const table = resultDetailEl.querySelector(".tabulate-container");
    if (table) table.remove();
  }
}

// ✅ Show manifest (back button)
function showManifest() {
  const resultsSection = document.getElementById("results-section");
  if (resultsSection) resultsSection.style.display = "block";
  hideResultDetail();
}
window.showManifest = showManifest;

// --- Tabulate view toggle ---
const submitSection = document.getElementById("submit-section");
const showSubmitBtn = document.getElementById("showSubmit");
const showResultsBtn = document.getElementById("showResults");
const detailSection = document.getElementById("result-detail");
const resultsSection = document.getElementById("results-section");

if (submitSection && showSubmitBtn && showResultsBtn) {
  showSubmitBtn.addEventListener("click", () => {
    submitSection.style.display = "block";
    resultsSection.style.display = "none";
    showSubmitBtn.classList.add("active");
    showResultsBtn.classList.remove("active");

    // 🔹 Hide any open accordion rows when leaving results
    document.querySelectorAll("#manifestTable .accordion-body").forEach(row => {
      row.remove();
    });

    // ✅ Hide detail view when starting a new table
    hideResultDetail();
  });

  showResultsBtn.addEventListener("click", () => {
    submitSection.style.display = "none";
    resultsSection.style.display = "block";
    showResultsBtn.classList.add("active");
    showSubmitBtn.classList.remove("active");

    // ✅ Hide any leftover tabulate result when switching to manifest view
    hideResultDetail();
  });
}

  function toggleManifest() {
    const container = document.getElementById("manifestContainer");
    if (!container) return;
    container.style.display = (container.style.display === "none") ? "block" : "none";
  }
window.toggleManifest = toggleManifest;

// ✅ Handle modal OK click → switch to results view
const okBtn = document.getElementById("modalOkBtn");
if (okBtn) {
  okBtn.addEventListener("click", () => {
    const modal = document.getElementById("submissionModal");
    if (modal) modal.style.display = "none";

    // 🔄 Switch to results screen automatically
    const showResultsBtn = document.getElementById("showResults");
    if (showResultsBtn) showResultsBtn.click();  // triggers your existing toggle
  });
}

// ✅ Refresh manifest table button
const refreshBtn = document.getElementById("refreshManifest");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    console.log("🔄 Refreshing manifest table...");
    loadManifestAndRender();
  });
}

// ✅ Restore correct tab after reload
const view = sessionStorage.getItem("tabulateView");
if (view === "results") {
  document.getElementById("showResults")?.click();
  sessionStorage.removeItem("tabulateView");
}


});



// 🔹 Simple vanilla sorter for #manifestTable (dates, "Running", mm:ss, numbers, text)
(function enableTableSorting() {
  const table = document.getElementById("manifestTable");
  if (!table) return;

  const headers = table.querySelectorAll("thead th");
  headers.forEach((th, colIndex) => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"))
        .filter(r => !r.classList.contains("accordion-body"));

      const ascending = th.classList.toggle("asc");
      headers.forEach(h => { if (h !== th) h.classList.remove("asc", "desc"); });
      th.classList.toggle("desc", !ascending);

      function valueFor(row) {
        const cell = row.cells[colIndex];
        if (!cell) return "";

        // Prefer numeric sort hint if present
        const ds = cell.getAttribute("data-sort");
        if (ds !== null) {
          const n = Number(ds);
          return Number.isNaN(n) ? ds : n;
        }

        const text = (cell.textContent || "").trim();

        // Completed: treat "Running" as +∞
        if (colIndex === 1 && /running/i.test(text)) return Number.POSITIVE_INFINITY;

        // Duration mm:ss → total seconds, "--" → +∞
        if (colIndex === 2) {
          if (text === "--" || text === "") return Number.POSITIVE_INFINITY;
          const m = text.match(/^(\d{1,2}):(\d{2})$/);
          if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        }

        // Try date
        const d = Date.parse(text);
        if (!Number.isNaN(d)) return d;

        // Try number
        const num = parseFloat(text.replace(/[^\d.-]/g, ""));
        if (!Number.isNaN(num)) return num;

        // Fallback text
        return text.toLowerCase();
      }

      rows.sort((a, b) => {
        const av = valueFor(a);
        const bv = valueFor(b);
        if (av < bv) return ascending ? -1 : 1;
        if (av > bv) return ascending ? 1 : -1;
        return 0;
      });

      rows.forEach(r => tbody.appendChild(r));
    });
  });
})();
