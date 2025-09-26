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

  function submitQueries() {
    const queries = collectQueriesForSubmission();
    if (!queries.length) {
      console.warn("[tabulate]⚠️ No queries found, submission skipped.");
      return; 
  }
  
  
  // Build full submission object
  const payload = {
    item_type: "tabulate",
	query_id: crypto.randomUUID(),
    query_submitted: Math.floor(Date.now() / 1000),
    moniker: window.moniker,
    query_configs: {
      search_mode: "advanced",
      rag_generation_config: {
        model: "azure/gpt-4.1-mini",
        temperature: 0,
        max_tokens_to_sample: 512
      },
      search_settings: {
        use_hybrid_search: true,
        use_semantic_search: true,
        use_fulltext_search: true,
        include_metadatas: true
      },
      include_title_if_available: true,
      task_prompt: "## Task:\nAnswer the given question using the provided context.\n\n## Output Requirements:\n1. Provide a concise answer in 1-2 sentences.\n2. Include citation reference(s).\n\n## Inputs:\nContext: {context}\n\n## Answer:\n"
    },
    tabulates: queries.map(({ row, col, query }) => ({
      tabulate_id: crypto.randomUUID(),
      row,
      column: col,
      rag_query: query
    }))
  };

  // 🔎 Log before sending
  console.log("📤 Final submission payload:\n", JSON.stringify(payload, null, 2));

  // Send to backend
  fetch(window.tabulate_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    //.then(() => {
      //document.querySelector(".submit-feedback").textContent = "Thank you!";
    //})
    .catch((err) => {
      console.error("Failed to submit feedback:", err);
    });
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
      const jsonUrl = `${baseUrl}${jsonPath}`;

      console.log("📡 Fetching manifest:", jsonUrl);

      const resp = await fetch(jsonUrl, {
        headers: { "Authorization": `Basic ${basicAuth}` }
      });
      console.log("🌐 Response status:", resp.status);
      
      if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.status}`);
      const manifest = await resp.json();
      console.log("📄 Raw manifest JSON:", manifest);

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

function showManifest() {
  const resultsSection = document.getElementById("results-section");
  const resultDetailEl = document.getElementById("result-detail");

  if (resultsSection && resultDetailEl) {
    // show the manifest list
    resultsSection.style.display = "block";
    // hide the detail panel
    resultDetailEl.style.display = "none";
  }
}
window.showManifest = showManifest;



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
        td.textContent = t ? (t.rag_result || t.rag_query || "") : "";
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
  window.submitQueries = submitQueries;

  // Initialize
  classifyCells();
  generateQueries();

  // 🔽 Append Submit button after the table
  const submitContainer = document.createElement("div");
  submitContainer.className = "submit-container";
  submitContainer.style.marginTop = "1rem";

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.onclick = submitQueries;

  const submitImg = document.createElement("img");
  submitImg.src = "assets/img/tabulate-data.svg";
  submitImg.title = "Feed Me!";
  submitImg.alt = "Submit";
  submitImg.height = 50;

  submitBtn.appendChild(submitImg);
  submitContainer.appendChild(submitBtn);

  table.parentNode.insertBefore(submitContainer, table.nextSibling);

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
    });

    showResultsBtn.addEventListener("click", () => {
      submitSection.style.display = "none";
      resultsSection.style.display = "block";
      showResultsBtn.classList.add("active");
      showSubmitBtn.classList.remove("active");
    });

  }
  function toggleManifest() {
    const container = document.getElementById("manifestContainer");
    if (!container) return;
    container.style.display = (container.style.display === "none") ? "block" : "none";
  }
window.toggleManifest = toggleManifest;

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
