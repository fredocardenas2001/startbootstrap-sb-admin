import DirectoryService from "./DirectoryService.js";

class Tabulate {
  constructor({ container }) {
    this.container = container;
    this.directoryInstance = null;

    // Internal state for results view
    this._groupedResults = {};
  }

  async initialize() {
    if (!this.container) {
      console.error("❌ Tabulate mount container not found");
      return;
    }

    // 1) Load config first so env vars exist for submit + manifest
    await this.loadConfig();

    // 2) Optional MSAL readiness (non-blocking if not present)
    this.waitForMsal(); // runs asynchronously, logs when ready

    // 3) Build UI + bind interactions
    this.buildUI();
    this.bindUI();

    // 4) Table behaviors
    this.classifyCells();
    this.generateQueries();
    this.bindSubmitButton();

    // 5) Initial manifest load (results tab)
    this.loadManifestAndRender();

    // 6) Restore last-view if applicable
    const view = sessionStorage.getItem("tabulateView");
    if (view === "results") {
      this.container.querySelector("#showResults")?.click();
      sessionStorage.removeItem("tabulateView");
    }

    // Expose a couple of helpers for inline handlers we render
    window.deleteColumn = (btn) => this.deleteColumn(btn);
    window.showManifest = () => this.showManifest();
  }

  // ---------------------------
  // Config / MSAL
  // ---------------------------
  async loadConfig() {
    if (window._tabulateLoaded) return; // mimic original guard
    window._tabulateLoaded = true;

    try {
      const res = await fetch("assets/config/directory-config.json");
      if (!res.ok) throw new Error("Failed to load config JSON");
      const config = await res.json();

      window.config = config;
      window.moniker = config.ACCOUNT_MONIKER;
      window.tabulate_url = config.TABULATE_SUBMISSION_URL;

      console.log("🔧 Loaded config:");
      console.log("window.moniker =", window.moniker);
      console.log("window.tabulate_url =", window.tabulate_url);
    } catch (err) {
      console.error("❌ Config load failed:", err);
    }
  }

  async waitForMsal() {
    // Non-fatal readiness check; logs when an account is visible
    try {
      let ticks = 0;
      while (!window.msalAccount && ticks < 200) {
        // wait up to ~10s in 50ms increments (just for logging)
        // submit/manifest do not hard-depend on this; it's informational
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 50));
        ticks++;
      }
      if (window.msalAccount?.username) {
        console.log("✅ User active:", window.msalAccount.username);
      }
    } catch {
      /* ignore */
    }
  }

  // ---------------------------
  // UI build / bind
  // ---------------------------
  buildUI() {
    this.container.innerHTML = `
      <div class="tabulate-container">
        <div class="tab-navbar">
          <span class="navbar-title">Tabulate</span>
        </div>

        <div class="tabulate-toggle tabulate-container">
          <button id="showSubmit" class="active">Submit New Table</button>
          <button id="showResults">View Previous Results</button>
        </div>

        <div id="submit-section">
          <div class="controls">
            <button id="addRow"><img src="assets/img/add-row.svg" title="Add Row" height="24"></button>
            <button id="addColumn"><img src="assets/img/add-column.svg" title="Add Column" height="24"></button>
            <button id="resetTable"><img src="assets/img/start-over.svg" title="Start Over" height="24"></button>
          </div>

          <table id="tabulate">
            <tr>
              <td></td><td></td><td></td>
              <td>
                <button class="delete-btn" onclick="deleteColumn(this)">
                  <img src="assets/img/delete-column.svg" title="Delete Column" height="20">
                </button>
              </td>
            </tr>
            <tr>
              <td></td><td></td><td></td><td><textarea placeholder="Query"></textarea></td>
            </tr>
            <tr>
              <td><button id="directoryBtn">Directory</button></td>
              <td></td>
              <td><textarea placeholder="project or filter"></textarea></td>
              <td><textarea placeholder=""></textarea></td>
            </tr>
          </table>
        </div>

        <div id="results-section" style="display:none;">
          <div class="results-header">
            <button id="refreshManifest" type="button">
              <img src="assets/img/start-over.svg" title="Refresh" height="20"> Refresh
            </button>
          </div>
          <table id="manifestTable">
            <thead>
              <tr><th>Submitted</th><th>Completed</th><th>Duration</th><th>Queries</th></tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>

        <div id="result-detail" style="display:none;">
          <button type="button" id="backToManifest">⬅ Back to Manifest</button>
        </div>

        <div id="submissionModal" class="modal-overlay" style="display:none;">
          <div class="modal-box">
            <h2>Submission Sent</h2>
            <p id="modalMessage">Your tabulate query has been submitted successfully.</p>
            <button id="modalOkBtn" type="button">OK</button>
          </div>
        </div>
      </div>
    `;
    this.updateColumnDeleteVisibility();
  }

  bindUI() {
    const q = (sel) => this.container.querySelector(sel);

    const addRowBtn = q("#addRow");
    const addColumnBtn = q("#addColumn");
    const resetBtn = q("#resetTable");
    const directoryBtn = q("#directoryBtn");
    const backBtn = q("#backToManifest");
    const table = q("#tabulate");

    if (addRowBtn) addRowBtn.addEventListener("click", () => this.addRow());
    if (addColumnBtn) addColumnBtn.addEventListener("click", () => this.addColumn());
    if (resetBtn) resetBtn.addEventListener("click", () => location.reload());
    if (directoryBtn) directoryBtn.addEventListener("click", () => this.toggleDirectoryPanel());
    if (backBtn) backBtn.addEventListener("click", () => this.showManifest());

    // Auto-update queries when headers or labels change
    if (table) {
      table.addEventListener("input", (e) => {
        const cell = e.target.closest("td");
        if (!cell) return;
        if (cell.classList.contains("first-row") || cell.classList.contains("first-col")) {
          this.generateQueries();
        }
      });
    }

// Modal OK → switch view
const okBtn = q("#modalOkBtn");
if (okBtn) {
  okBtn.addEventListener("click", () => {
    const modal = q("#submissionModal");
    if (modal) modal.style.display = "none"; // ✅ hides the modal
    const showResultsBtn = q("#showResults");
    if (showResultsBtn) showResultsBtn.click();
  });
}


    // Results/Submit tab toggles
    const submitSection = q("#submit-section");
    const showSubmitBtn = q("#showSubmit");
    const showResultsBtn = q("#showResults");
    const resultsSection = q("#results-section");

    if (submitSection && showSubmitBtn && showResultsBtn) {
      showSubmitBtn.addEventListener("click", () => {
        submitSection.style.display = "block";
        resultsSection.style.display = "none";
        showSubmitBtn.classList.add("active");
        showResultsBtn.classList.remove("active");
        this.hideResultDetail();
      });

      showResultsBtn.addEventListener("click", () => {
        submitSection.style.display = "none";
        resultsSection.style.display = "block";
        showResultsBtn.classList.add("active");
        showSubmitBtn.classList.remove("active");
        this.hideResultDetail();
      });
    }

    // Refresh manifest
    q("#refreshManifest")?.addEventListener("click", () => {
      console.log("🔄 Refreshing manifest table...");
      this.loadManifestAndRender();
    });

    // Enable sorting
    this.enableTableSorting();
  }

  // ---------------------------
  // Table editing helpers
  // --------------------------
  
  



  addRow() {
    const table = this.container.querySelector("#tabulate");
    if (!table) return;
    const newRow = table.insertRow(-1);
    const colCount = table.rows[0].cells.length;

    for (let c = 0; c < colCount; c++) {
      const newCell = newRow.insertCell(c);
      if (c === 0) {
        const dirBtn = document.createElement("button");
        dirBtn.textContent = "Directory";
        dirBtn.addEventListener("click", () => {
          console.log(`Directory button pressed (row ${newRow.rowIndex})`);
        });
        newCell.appendChild(dirBtn);
      } else if (c === 1) {
        newCell.innerHTML = `
          <button class="delete-btn" onclick="(function(btn){ const tr=btn.closest('tr'); if(!tr) return; tr.remove(); }) (this)">
            <img src="assets/img/delete-row2.svg" title="Delete Row" height="24px">
          </button>`;
      } else {
        newCell.innerHTML = `<textarea></textarea>`;
      }
    }

    this.classifyCells();
    this.generateQueries();
  }

  addColumn() {
    const table = this.container.querySelector("#tabulate");
    if (!table) return;
    const rows = table.rows;

    for (let r = 0; r < rows.length; r++) {
      const newCell = rows[r].insertCell();
      if (r === 0) {
        newCell.innerHTML = `
          <button class="delete-btn" onclick="deleteColumn(this)">
            <img src="assets/img/delete-column.svg" title="Delete Column" height="20">
          </button>`;
      } else {
        newCell.innerHTML = `<textarea placeholder=""></textarea>`;
      }
    }

    this.classifyCells();
    this.generateQueries();
    this.updateColumnDeleteVisibility();

  }

  deleteColumn(buttonEl) {
    const table = this.container.querySelector("#tabulate");
    if (!table) return;
    const index = buttonEl?.parentElement?.cellIndex ?? -1;
    const colCount = table.rows[0].cells.length;

    if (index <= 1) return;   // protect control + first editable col
    if (colCount <= 3) return; // avoid deleting below 3 columns total

    for (let r = 0; r < table.rows.length; r++) {
      table.rows[r].deleteCell(index);
    }

    this.classifyCells();
    this.generateQueries();
    this.updateColumnDeleteVisibility();

  }

  classifyCells() {
    const table = this.container.querySelector("#tabulate");
    if (!table || !table.rows.length) return;
    const rows = table.rows;
    const rowCount = rows.length;
    const colCount = rows[0].cells.length;

    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const cell = rows[r].cells[c];
        const ta = cell.querySelector("textarea");
        cell.className = "";

        if (r === 0 && c <= 2) cell.classList.add("corner-cell");
        else if (r === 0 && c >= 3) cell.classList.add("del-col");
        else if (r === 1 && c === 0) cell.classList.add("dir-control");
        else if (r === 1 && c === 1) cell.classList.add("del-btn");
        else if (r === 1 && c === 2) cell.classList.add("corner-cell");
        else if (r === 1 && c >= 3) {
          cell.classList.add("first-row");
          if (ta) ta.readOnly = false;
        } else if (r >= 2 && c === 2) {
          cell.classList.add("first-col");
          if (ta) ta.readOnly = false;
        } else if (r >= 2 && c >= 3) {
          cell.classList.add("middle-cell");
          if (ta) ta.readOnly = true;
        }
      }
    }
  }

  generateQueries() {
    const table = this.container.querySelector("#tabulate");
    if (!table || !table.rows.length) return;
    const rows = table.rows;
    const rowCount = rows.length;
    const colCount = rows[0].cells.length;

    for (let r = 2; r < rowCount; r++) {
      const rowLabelEl = rows[r].cells[2]?.querySelector("textarea");
      const rowLabel = rowLabelEl ? rowLabelEl.value.trim() : "";
      for (let c = 3; c < colCount; c++) {
        const colHeaderEl = rows[1].cells[c]?.querySelector("textarea");
        const colHeader = colHeaderEl ? colHeaderEl.value.trim() : "";
        const ta = rows[r].cells[c]?.querySelector("textarea");
        if (ta && rowLabel && colHeader) ta.value = `${colHeader} in ${rowLabel}`;
      }
    }
  }

  // ---------------------------
  // Submission pipeline
  // ---------------------------
  collectQueriesForSubmission() {
    const queries = [];
    const table = this.container.querySelector("#tabulate");
    if (!table) return queries;
    const rows = table.rows;

    for (let r = 2; r < rows.length; r++) {
      for (let c = 3; c < rows[r].cells.length; c++) {
        const ta = rows[r].cells[c].querySelector("textarea");
        const value = ta?.value?.trim();
        if (value) queries.push({ row: r, col: c, query: value });
      }
    }
    return queries;
  }

  async submitQueries() {
    console.count("🛰 submitQueries fired");
    if (window.tabulateSubmitting) return console.warn("⚠️ Duplicate submit blocked");
    window.tabulateSubmitting = true;

    try {
      const queries = this.collectQueriesForSubmission();
      if (!queries.length) {
        console.warn("[tabulate] ⚠️ No queries found, skipping submission.");
        return;
      }

      console.log("🚀 [submitQueries] Starting submission process at", new Date().toLocaleString());

      console.group("📋 Collected Queries");
      queries.forEach((q, i) => console.log(`→ #${i + 1} [r${q.row},c${q.col}] =`, q.query.trim()));
      console.groupEnd();

      const sharedQueryId = crypto.randomUUID();
      const submittedTs = Math.floor(Date.now() / 1000);
      console.log(`🧩 Shared Query ID: ${sharedQueryId}`);
      console.log(`🕓 Submission Timestamp: ${submittedTs} (${new Date(submittedTs * 1000).toLocaleString()})`);

      const baseConfig = {
        item_type: "tabulate",
        query_id: sharedQueryId,
        query_submitted: submittedTs,
        moniker: window.moniker,
        schema_version: "1.1",
        table_meta: (() => {
          const tbl = this.container.querySelector("#tabulate");
          if (!tbl || !tbl.rows || !tbl.rows[0]) {
            return { num_rows: 0, num_cols: 0, header_row: [], row_labels: [], coordinates: [] };
          }
          const rows = tbl.rows;
          const totalRows = rows.length;
          const totalCols = rows[0].cells.length;

          const getCellValue = (cell) => {
            const ta = cell?.querySelector("textarea");
            return (ta ? ta.value : cell?.textContent || "").trim();
          };

          // Structure recap from original
          const num_rows = Math.max(0, totalRows - 2); // data rows
          const num_cols = Math.max(0, totalCols - 2); // data cols
          const header_row = totalRows > 1
            ? Array.from(rows[1].cells).slice(2).map(getCellValue)
            : [];
          const row_labels = totalRows > 2
            ? Array.from(rows).slice(2).map(r => getCellValue(r.cells[1]))
            : [];
          const coordinates = this.collectQueriesForSubmission().map(q => ({
            row: q.row,
            col: q.col,
            query: q.query,
          }));

          console.groupCollapsed("🧭 table_meta preview");
          console.log("num_rows:", num_rows, "num_cols:", num_cols);
          console.log("header_row:", header_row);
          console.log("row_labels:", row_labels);
          console.log("coordinates:", coordinates);
          console.groupEnd();

          return { num_rows, num_cols, header_row, row_labels, coordinates };
        })(),
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

      await Promise.all(
        payloads.map((p, i) =>
          fetch(window.tabulate_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(p),
          })
            .then((resp) => {
              if (!resp.ok) throw new Error(`Upload failed (${resp.status})`);
              console.log(`✅ Upload ${i + 1}/${payloads.length} succeeded`);
            })
            .catch((err) => {
              console.error(`❌ Upload ${i + 1} failed:`, err);
            })
        )
      );

      console.log("🎯 All partial files uploaded successfully!");

      // optional: regenerate defaults
      this.generateQueries();

      // Persist desired view and show modal
      sessionStorage.setItem("tabulateView", "results");
      const modal = this.container.querySelector("#submissionModal");
      if (modal) modal.style.display = "flex";
      // ✅ Clear all table cells after successful submission
        const table = this.container.querySelector("#tabulate");
        if (table) {
          const textareas = table.querySelectorAll("textarea");
          textareas.forEach((ta) => {
            ta.value = "";
          });
        }
        console.log("🧹 Cleared all table values after submit.");

    } catch (err) {
      console.error("❌ submitQueries error:", err);
    } finally {
      window.tabulateSubmitting = false;
    }
    console.log("🧩 [debug] submission finished");
  }

  bindSubmitButton() {
    const table = this.container.querySelector("#tabulate");
    if (!table) return;
    const submitContainer = document.createElement("div");
    submitContainer.className = "submit-container";
    submitContainer.style.marginTop = "1rem";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      btn.disabled = true;
      try {
        await this.submitQueries();
      } finally {
        btn.disabled = false;
      }
    });

    const img = document.createElement("img");
    img.src = "assets/img/tabulate-data.svg";
    img.title = "Feed Me Seymour!";
    img.alt = "Submit";
    img.height = 50;

    btn.appendChild(img);
    submitContainer.appendChild(btn);
    table.parentNode.insertBefore(submitContainer, table.nextSibling);
  }

  // ---------------------------
  // Manifest + Results
  // ---------------------------
  async loadManifestAndRender() {
    try {
      const username = window.config.API_USERNAME;
      const password = window.config.API_PASSWORD;
      const baseUrl = window.config.API_JSON_URL;
      const manifestName = window.config.API_JSON_MANIFEST;
      const moniker = window.config.ACCOUNT_MONIKER;

      const basicAuth = btoa(`${username}:${password}`);
      const jsonPath = `${moniker}/${manifestName}`;
      const jsonUrl = `${baseUrl}${jsonPath}?_=${Date.now()}`; // bust cache

      console.log("📡 Fetching manifest (refresh-safe):", jsonUrl);

      const resp = await fetch(jsonUrl, {
        headers: { Authorization: `Basic ${basicAuth}` },
        cache: "no-store",
      });

      if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.status}`);
      const manifest = await resp.json();
      this.renderManifestTable(Array.isArray(manifest) ? manifest : [manifest]);
    } catch (err) {
      console.error("❌ Manifest load failed:", err);
    }
  }

  renderManifestTable(entries) {
    console.log("📝 Starting to render manifest table with entries:", entries.length);
    const tbody = this.container.querySelector("#manifestTable tbody");
    if (!tbody) {
      console.error("❌ Could not find #manifestTable tbody");
      return;
    }
    tbody.innerHTML = "";

    const validEntries = entries.filter((e) => e && e.filename && e.query_id);
    console.log(`📦 Valid entries: ${validEntries.length}`);

    const grouped = {};
    for (const e of validEntries) {
      const qid = e.query_id;
      if (!grouped[qid]) grouped[qid] = [];
      grouped[qid].push(e);
    }

    const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
      const aLatest = Math.max(...a.map((e) => e.query_returned || e.query_submitted || 0));
      const bLatest = Math.max(...b.map((e) => e.query_returned || e.query_submitted || 0));
      return bLatest - aLatest;
    });

    for (const [qid, group] of sortedGroups) {
      try {
        const latest = group.reduce((prev, curr) => {
          const prevTs = prev.query_returned || prev.query_submitted || 0;
          const currTs = curr.query_returned || curr.query_submitted || 0;
          return currTs > prevTs ? curr : prev;
        });

        const submitted = new Date((latest.query_submitted || 0) * 1000);
        const completed = latest.query_returned ? new Date(latest.query_returned * 1000) : null;
        const duration =
          completed && latest.query_submitted
            ? latest.query_returned - latest.query_submitted
            : null;

        const tr = document.createElement("tr");
        tr.dataset.queryId = qid;

        const tdSubmitted = document.createElement("td");
        tdSubmitted.textContent = submitted.toLocaleString();
        tr.appendChild(tdSubmitted);

        const tdCompleted = document.createElement("td");
        tdCompleted.textContent = completed ? completed.toLocaleString() : "Running";
        tr.appendChild(tdCompleted);

        const tdDuration = document.createElement("td");
        if (duration) {
          const mm = String(Math.floor(duration / 60)).padStart(2, "0");
          const ss = String(Math.floor(duration % 60)).padStart(2, "0");
          tdDuration.textContent = `${mm}:${ss}`;
          tdDuration.setAttribute("data-sort", String(duration));
        } else {
          tdDuration.textContent = "--";
          tdDuration.setAttribute("data-sort", String(Number.POSITIVE_INFINITY));
        }
        tr.appendChild(tdDuration);

        const tdQueries = document.createElement("td");
        tdQueries.textContent = group.length;
        tr.appendChild(tdQueries);

        tr.style.cursor = "pointer";
        tr.addEventListener("click", async () => {
          console.log(`🖱 Row clicked → loading all results for query_id: ${qid}`);

          const results = [];
          for (const entry of group) {
            const username = window.config.API_USERNAME;
            const password = window.config.API_PASSWORD;
            const baseUrl = window.config.API_JSON_URL;
            const moniker = window.config.ACCOUNT_MONIKER;
            const basicAuth = btoa(`${username}:${password}`);
            const jsonUrl = `${baseUrl}${moniker}/${entry.filename}`;

            console.log("📡 Fetching result:", jsonUrl);
            const resp = await fetch(jsonUrl, { headers: { Authorization: `Basic ${basicAuth}` } });
            if (resp.ok) results.push(await resp.json());
          }

          this.renderResultDetail(results);

          // Toggle visibility
          const resultsSection = this.container.querySelector("#results-section");
          const resultDetailEl = this.container.querySelector("#result-detail");
          if (resultsSection) resultsSection.style.display = "none";
          if (resultDetailEl) resultDetailEl.style.display = "block";
        });

        tbody.appendChild(tr);
      } catch (err) {
        console.warn("⚠️ Skipping bad group:", qid, err);
      }
    }

    console.log("✅ Finished rendering manifest table (one row per query_id, latest timestamps)");
  }

  renderResultDetail(resultOrGroup) {
    const container = this.container.querySelector("#result-detail");
    if (!container) return;

    container.innerHTML = "<button type='button' onclick='showManifest()'>⬅ Back to Manifest</button>";

    const results = Array.isArray(resultOrGroup) ? resultOrGroup : [resultOrGroup];
    const allTabulates = results.flatMap((r) => r.tabulates || []);
    if (!allTabulates.length) {
      container.innerHTML += "<p>⚠️ No valid tabulates found.</p>";
      return;
    }

    const { query_id } = results[0];
    container.innerHTML += `<p>Results for Query ID: ${query_id}</p>`;

    const rows = allTabulates.map((t) => t.row);
    const cols = allTabulates.map((t) => t.column);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    console.log(`📐 Table bounds for ${query_id} → rows ${minRow}–${maxRow}, cols ${minCol}–${maxCol}`);

    const table = document.createElement("table");
    table.className = "tabulate-container-results";

    for (let r = minRow; r <= maxRow; r++) {
      const tr = document.createElement("tr");
      for (let c = minCol; c <= maxCol; c++) {
        const td = document.createElement("td");
        const t = allTabulates.find((x) => x.row === r && x.column === c);

        if (t) {
          const queryText = t.rag_query ? `<div class="cell-query"><strong>Q:</strong> ${t.rag_query}</div>` : "";
          const resultText = t.rag_result ? `<div class="cell-result"><strong>A:</strong> ${t.rag_result}</div>` : "";
          td.innerHTML = `${queryText}${resultText}` || "<em>Empty</em>";
          td.classList.add("filled-cell");
        } else {
          td.innerHTML = "<em>Pending...</em>";
          td.classList.add("empty-cell");
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    container.appendChild(table);
  }

  hideResultDetail() {
    const resultDetailEl = this.container.querySelector("#result-detail");
    if (resultDetailEl) {
      resultDetailEl.style.display = "none";
      const table = resultDetailEl.querySelector(".tabulate-container-results");
      if (table) table.remove();
    }
  }

  showManifest() {
    const resultsSection = this.container.querySelector("#results-section");
    if (resultsSection) resultsSection.style.display = "block";
    this.hideResultDetail();
  }

  enableTableSorting() {
    const table = this.container.querySelector("#manifestTable");
    if (!table) return;

    const headers = table.querySelectorAll("thead th");
    headers.forEach((th, colIndex) => {
      th.style.cursor = "pointer";
      th.addEventListener("click", () => {
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr")).filter((r) => !r.classList.contains("accordion-body"));

        const ascending = th.classList.toggle("asc");
        headers.forEach((h) => {
          if (h !== th) h.classList.remove("asc", "desc");
        });
        th.classList.toggle("desc", !ascending);

        function valueFor(row) {
          const cell = row.cells[colIndex];
          if (!cell) return "";

          const ds = cell.getAttribute("data-sort");
          if (ds !== null) {
            const n = Number(ds);
            return Number.isNaN(n) ? ds : n;
          }

          const text = (cell.textContent || "").trim();

          if (colIndex === 1 && /running/i.test(text)) return Number.POSITIVE_INFINITY;

          if (colIndex === 2) {
            if (text === "--" || text === "") return Number.POSITIVE_INFINITY;
            const m = text.match(/^(\d{1,2}):(\d{2})$/);
            if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
          }

          const d = Date.parse(text);
          if (!Number.isNaN(d)) return d;

          const num = parseFloat(text.replace(/[^\d.-]/g, ""));
          if (!Number.isNaN(num)) return num;

          return text.toLowerCase();
        }

        rows.sort((a, b) => {
          const av = valueFor(a);
          const bv = valueFor(b);
          if (av < bv) return ascending ? -1 : 1;
          if (av > bv) return ascending ? 1 : -1;
          return 0;
        });

        rows.forEach((r) => tbody.appendChild(r));
      });
    });
  }

  // ---------------------------
  // Directory panel
  // ---------------------------
  toggleDirectoryPanel() {
    const dirPanel = document.getElementById("directoryPanel");
    const dirContainer = document.getElementById("directory-container");
    if (!dirPanel || !dirContainer) return;

    const isExpanded = dirPanel.classList.contains("expanded");
    dirPanel.classList.toggle("expanded", !isExpanded);
    dirPanel.classList.toggle("hidden", isExpanded);

    if (!this.directoryInstance && typeof DirectoryService !== "undefined") {
      this.directoryInstance = new DirectoryService({
        container: dirContainer,
        autoFetch: true,
        mode: "full",
      });
      this.directoryInstance.initialize();
    }
  }
  updateColumnDeleteVisibility() {
    const table = this.container.querySelector("#tabulate");
    if (!table) return;

    const deleteBtns = table.querySelectorAll(".delete-btn img[title='Delete Column']");
    const colCount = table.rows[0]?.cells.length || 0;

    // Hide delete-column buttons when only one usable column remains
    deleteBtns.forEach((img) => {
      const btn = img.closest(".delete-btn");
      if (btn) btn.style.display = colCount <= 4 ? "none" : "inline-block";
    });
  }

}

export default Tabulate;
