// tabulate.js (fixed clean version)

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

	// insert after the table
	table.parentNode.insertBefore(submitContainer, table.nextSibling);

});
