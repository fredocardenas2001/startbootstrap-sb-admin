// DirectoryService.js
//import "../csc/directory.css";

/*
About modes:

full -- show the full editable directory
readonly -- show the directory with all checkboxes disabled. 
reOpenChecked -- open the directory tree far enough to show all checked files in read only mode
excelonly -- show only excel files folder expanded

*/

export default class DirectoryService {
  constructor({ mode = "full", container, autoFetch = true }) {
    this.mode = mode || "readonly";
	this.container = container;
    this.autoFetch = autoFetch;
    this.data = [];
  }

async initialize() {
  if (!this.container) throw new Error("DirectoryService: container is missing");
  
  await this.loadConfig();

  if (this.autoFetch) {
    this.data = await this.fetchData();
    this.buildR2RIndexFromTree(this.data);
  }

  // 🟢 Attach listener before rendering
  this.waitForRenderAndRestoreSelections();

  this.render();
  this.renderTree(); // This dispatches the event

  // Other setup
  this.setupSearchToggle();
  this.setupSearchHandler();
  this.setupEventListeners();
  this.setupExpandCollapse();
  this.setupSetChatContext();
  this.setupToggleCheckAll();
}


updateParentCheckboxes(checkbox) {
  let currentUl = checkbox.closest("ul");

  while (currentUl && currentUl.parentElement) {
    const parentLi = currentUl.closest("li");
    if (!parentLi) break;

    const parentCheckbox = parentLi.querySelector("input[type='checkbox']");
    if (!parentCheckbox) break;

    const childCheckboxes = currentUl.querySelectorAll("input[type='checkbox']:not(:disabled)");
    const checkedCount = Array.from(childCheckboxes).filter(cb => cb.checked).length;

    if (checkedCount === 0) {
      parentCheckbox.checked = false;
      parentCheckbox.indeterminate = false;
    } else if (checkedCount === childCheckboxes.length) {
      parentCheckbox.checked = true;
      parentCheckbox.indeterminate = false;
    } else {
      parentCheckbox.checked = false;
      parentCheckbox.indeterminate = true;
    }

    currentUl = parentLi.closest("ul"); // move up to the next parent group
  }

  this.updateToggleIcon();
}

createTreeNode(item, parent, level = 0) {
	
/* preserves folders
	  const isFolder = Array.isArray(item.children);
	  // ⬇️ In excelonly mode: skip non-Excel files, keep all folders
	  if (this.mode === "excelonly" && !isFolder) {
		if (!this.isExcelFile(item.name || item.title || "")) return; // skip this file
	  }
*/

const isFolder = Array.isArray(item.children);

if (this.mode === "excelonly") {
  if (isFolder) {
    // Skip this folder if *none* of its descendants are Excel files
    const hasExcelDescendant = (children) => {
      return children.some(child =>
        Array.isArray(child.children)
          ? hasExcelDescendant(child.children)
          : this.isExcelFile(child.name || child.title || "")
      );
    };
    if (!hasExcelDescendant(item.children)) return;
  } else {
    // Skip this file if it's not Excel
    if (!this.isExcelFile(item.name || item.title || "")) return;
  }
}


/*
defaut (no folders)
*/	
  const li = document.createElement("li");

  const div = document.createElement("div");
  div.className = item.type;
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.position = "relative";

  // Create checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("data-r2r-id", item.r2r_id || "");

  checkbox.style.marginRight = "0px";

	if (item.type === "file" && item.r2r_id && item.r2r_id !== "N/A") {
	  checkbox.setAttribute("data-r2r-id", item.r2r_id);
	}


  // Create file/folder icon with hyperlink + tooltip wrapper
  const iconWrapper = document.createElement("a");
  iconWrapper.target = "_blank";
  iconWrapper.className = "tooltip-container";
  iconWrapper.style.marginRight = "0px";

  const icon = document.createElement("span");
  icon.className = "file-icon";
  icon.textContent = item.type === "folder" ? "📁" : this.getFileIcon(item.name);

  const iconTooltip = document.createElement("span");
  iconTooltip.className = "tooltip";

/*  
  if (item.type === "folder") {
	iconTooltip.textContent = "Open Folder";
	} else {
	iconTooltip.textContent = "File Details";
  }
*/

  iconWrapper.appendChild(icon);
  //iconWrapper.appendChild(iconTooltip);

  // Filename
  const name = document.createElement("span");
  name.textContent = item.name;
  name.classList.add("file-name");
  const nameContainer = document.createElement("span");
  nameContainer.appendChild(name);

if (item.type === "folder") {
  const folderLink = document.createElement("a");
  folderLink.className = "folder-link";
  folderLink.target = "_blank";
  folderLink.style.marginLeft = "4px";
  folderLink.textContent = "🔗";

  const platform = (this.config.SOURCE_PLATFORM || "").toLowerCase();
  const rawPath = item.relative_path;

  if (rawPath) {
    if (platform === "onedrive") {
      const base = "https://contractsmarts-my.sharepoint.com";
      const username = this.config.SHAREPOINT_USERNAME || "error";
      const sharepointRoot = this.config.SHAREPOINT_BASE_PATH || "Customer Data/Demo";

      const fullPath = `${sharepointRoot}/${rawPath.replace(/^\/+/, "")}`.replace(/\\/g, "/");
      const encodedPath = fullPath.split("/").map(encodeURIComponent).join("/");

      folderLink.href = `${base}/:/r/personal/${username}/Documents/${encodedPath}`;
    } else if (platform === "dropbox") {
      folderLink.href = `https://www.dropbox.com/home/${rawPath.replace(/^\/+/, "")}`;
    }

    nameContainer.appendChild(folderLink);
  }
}

  const r2rId = item.r2r_id;

  nameContainer.style.flexGrow = "1";

  // Status icon + tooltip
  const statusIconWrapper = document.createElement("span");
  statusIconWrapper.classList.add("tooltip-container");
  statusIconWrapper.style.marginLeft = "0px";

  const statusIcon = document.createElement("span");
  statusIcon.className = "r2r-status-icon";
  //const tooltip = document.createElement("span");
  //tooltip.classList.add("tooltip");
  //tooltip.textContent = "Open File";

  statusIconWrapper.appendChild(statusIcon);
  //statusIconWrapper.appendChild(tooltip);
  //console.log("[DirectoryService][debug]r2rId:", r2rId)
  const sharepointUrl = this.getSharePointDirectLinkFromIndex(r2rId);


  let isValidFile = false;


  if (item.type === "file") {
	let uri = "#";

//console.log("🔎 Checking file:", item.name, "r2rId:", r2rId, "found in index:", !!window.r2rIndex?.[r2rId]);

if (!r2rId) console.log("❌ No r2rId");
else if (r2rId === "N/A") console.log("❌ r2rId is N/A");
else if (!window.r2rIndex?.[r2rId]) console.log(`❌ r2rIndex missing key: ${r2rId}`);


	if (r2rId && r2rId !== "N/A" && window.r2rIndex?.[r2rId]) {
	 isValidFile = true;
	  const docMeta = window.r2rIndex[r2rId];
	  const platform = (this.config.SOURCE_PLATFORM || "").toLowerCase();

	  const extension = item.name.split(".").pop().toLowerCase();
	  const isOffice = ["doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx"].includes(extension);
	  const isPdf = extension === "pdf";

	  if (platform === "onedrive" && isOffice) {
		//console.log("🟢 Platform is: ", platform);

		const sharepointUrl = this.getSharePointDirectLinkFromIndex(r2rId);
		uri = this.getOfficeUriFromSharePointLink(sharepointUrl, item.name);
	  } else if (platform === "onedrive" && isPdf) {
		uri = docMeta.web_url || "#"; // open in browser
	  } else if (platform === "dropbox") {
		uri = docMeta.web_url || "#";
	  }
	}
	
	icon.addEventListener("click", (e) => {
  e.preventDefault(); // prevent link navigation
  e.stopPropagation();

  const modal = this.container.querySelector("#fileInfoModal");
  const filenameEl = modal.querySelector(".modal-filename");
  const bodyText = modal.querySelector(".modal-body-text");

  filenameEl.textContent = item.name;
  const r2rSummary = item.r2r_summary || "File size or type not supported. Please check the logs or contact support for more help.";
  const resolvedR2rId = (r2rId && r2rId !== "N/A") ? r2rId : "none";

  bodyText.innerHTML = `
    <p class="modal-in">${r2rSummary}</p>
  `;

  modal.style.display = "flex";
  console.log("🟢 Opening Citation Modal for:", r2rId);
});

	
	iconWrapper.href = uri;

	const nameLink = document.createElement("a");
	nameLink.href = uri;
	nameLink.target = "_blank";
	nameLink.textContent = item.name;
	nameLink.classList.add("file-name");
	name.innerHTML = "";
	name.appendChild(nameLink);

statusIcon.textContent = isValidFile ? "✅" : "⛔";


  } else if (item.type === "folder") {
    // Folder link: grab any valid file's path inside and strip the filename
    const platform = (this.config.SOURCE_PLATFORM || "").toLowerCase();
    let folderUrl = "#";

    const anyValidChild = (item.children || []).find(child => child.r2r_id && window.r2rIndex?.[child.r2r_id]);

    if (anyValidChild) {
      const docMeta = window.r2rIndex[anyValidChild.r2r_id];
      if (platform === "onedrive") {
        const raw = this.getSharePointDirectLinkFromIndex(anyValidChild.r2r_id);
        folderUrl = raw?.substring(0, raw.lastIndexOf("/")) || "#";
      } else if (platform === "dropbox") {
        const base = (docMeta?.web_url || "").split("/");
        base.pop(); // remove filename
        folderUrl = base.join("/") || "#";
      }
    }

    iconWrapper.href = folderUrl;
  }

  // Final DOM assembly (always in the same order!)
	div.appendChild(checkbox);
	div.appendChild(iconWrapper);
	if (item.type !== "folder") {
	  div.appendChild(statusIconWrapper);
	}
	div.appendChild(nameContainer);
	li.appendChild(div);
	parent.appendChild(li);

  // Handle children (recursive)
  let ul = null;
  if (item.type === "folder" && item.children) {
    ul = document.createElement("ul");
    ul.className = `directory-tree ${level > 0 ? "hidden" : ""}`;
    li.appendChild(ul);

    div.addEventListener("click", (event) => {
      const isCheckboxClick = event.target.closest("input[type=checkbox]");
      if (isCheckboxClick) return;

      event.stopPropagation();
      ul.classList.toggle("hidden");
      icon.textContent = ul.classList.contains("hidden") ? "📁" : "📂";
    });

    item.children.forEach(child => this.createTreeNode(child, ul, level + 1));
  }

  // Checkbox behavior
  const self = this;
  checkbox.addEventListener("change", function (event) {
    event.stopPropagation();

    if (item.type === "folder") {
      const descendantCheckboxes = li.querySelectorAll("input[type=checkbox]:not(:disabled)");
      descendantCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
      });
    }

    self.updateParentCheckboxes(this);
    self.updateToggleIcon?.();
  });
}

// 💡 Helper method added to your class
getFolderLinkFromChildren(folderItem, platform) {
  if (!folderItem.children || folderItem.children.length === 0) return null;

  for (const child of folderItem.children) {
    const r2rId = child.r2r_id;
    const docMeta = r2rId && window.r2rIndex?.[r2rId];
    if (!docMeta) continue;

    if (platform === "onedrive" && docMeta.web_url) {
      return docMeta.web_url.replace(/\/[^\/?#]+(\?.*)?$/, "/");
    }

    if (platform === "dropbox" && docMeta.web_url) {
      return docMeta.web_url.replace(/\/[^\/?#]+(\?.*)?$/, "/");
    }
  }

  return null;
}

waitForRenderAndRestoreSelections() {
  console.log("🎧 Listening for directoryRendered...");

  this.container.addEventListener("directoryRendered", () => {
    console.log("📦 directoryRendered event received");

    this.setupRestoreSelections(); // restore checkboxes
    this.updateToggleIcon();       // restore top-level ☐/🞔/☑

    // ⬇️ Disable checkboxes for readonly-like modes
    if (this.mode === "readonly" || this.mode === "reOpenChecked") {
      const checkboxes = this.container.querySelectorAll(".directory-tree input[type='checkbox']");
      checkboxes.forEach(cb => cb.disabled = true);
    }

    // ⬇️ NEW: open folders to reveal checked items
    if (this.mode === "reOpenChecked") {
      this.expandToRevealChecked();
      this.updateToggleIcon();
    }

    this.setupEventListeners();
  });
}

expandToRevealChecked() {
  const checked = this.container.querySelectorAll(".directory-tree input[type='checkbox']:checked");
  checked.forEach(cb => {
    // Start at the LI that contains this checkbox
    let li = cb.closest("li");

    // Walk up through ancestor folders
    while (li) {
      // The UL that contains this LI
      const ul = li.parentElement;
      if (ul && ul.classList && ul.classList.contains("hidden")) {
        ul.classList.remove("hidden");
      }

      // The folder LI that owns this UL (one level up)
      const folderLi = ul?.closest("li");
      if (folderLi) {
        const folderIcon = folderLi.querySelector(".folder .file-icon");
        if (folderIcon) folderIcon.textContent = "📂"; // show “open” folder
      }

      // Move upward
      li = folderLi;
    }
  });

  const first = this.container.querySelector(".directory-tree input[type='checkbox']:checked");
  first?.closest("li")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

expandAllFolders() {
  // Unhide every nested <ul> in the tree
  this.container.querySelectorAll(".directory-tree ul.hidden")
    .forEach(ul => ul.classList.remove("hidden"));

  // Flip every folder icon to the open state
  this.container.querySelectorAll(".directory-tree li")
    .forEach(li => {
      const hasChildren = li.querySelector(":scope > ul");
      if (hasChildren) {
        const icon = li.querySelector(".folder .file-icon");
        if (icon) icon.textContent = "📂";
      }
    });

  // Optional: update any master toggle state if you use one
  this.updateToggleIcon?.();
}


updateToggleIcon() {
  const toggleBtn = this.container.querySelector("#toggleCheckAll");
  if (!toggleBtn) return;

  const checkboxes = this.container.querySelectorAll(
    ".directory-tree input[type='checkbox']:not(:disabled)"
  );

  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;

  toggleBtn.textContent =
    checked === 0 ? "☐" :
    checked === total ? "☑" : "🞔";
}

async fetchData() {
    try {
      const username = this.config.API_USERNAME;
      const password = this.config.API_PASSWORD;
      const baseUrl = this.config.API_JSON_URL;
      const moniker = this.config.ACCOUNT_MONIKER;
	  const platform = this.config.SOURCE_PLATFORM;
	  const sharepointRoot = this.config.SHAREPOINT_BASE_PATH;
      const basicAuth = btoa(`${username}:${password}`);
      const jsonUrl = `${baseUrl}${moniker}.onedrive_tree.json`;

      const res = await fetch(jsonUrl, {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("DirectoryService: fetchData error", err);
      return [];
    }
  }

render() {
this.container.innerHTML = `
  <div class="directory-wrapper">
	<div class="dir-box">
	  <div class="sticky-header">
	   <div class="chatContextBtns">
		${["full", "native"].includes(this.mode) ? `
		  <button id="setChatContext" class="chat-context-btn">Set Chat Context</button>
		  <button id="clearChatContext" class ="chat-context-btn">Clear Chat Context</button>
		` : ""}
		 </div>
		<div class="tree-controls">
		  <button id="toggleCheckAll" title="Select All">☐</button>
		  <span class="divider">|</span>
		  <button id="expandAll" title="Expand All">&#x002B;</button>
		  <button id="collapseAll" title="Collapse All">&#x2212;</button>
		  <button id="showCheckedBtn" title= "show checked items">✅</button>
		  <span class="divider">|</span>
		${["native", "excelonly"].includes(this.mode) ? `
			  <button id="refreshTree" title="Refresh">↻</button>
			  <span class="divider">|</span>
		` : ""}
		  <button id="toolbarSearchBtn" title="Search File List">🔍</button>
		  <span class="divider">|</span>
		  <button class="chat-context" id="openIconsModal" title="Help">?</button>
		</div>

		<div id="searchContainer">
		  <div id="searchPanel">
			<input type="text" id="searchInput" placeholder="Search files or folders..." />
			<ul id="searchResults"></ul>
		  </div>
		</div>

	  </div>
	  <ul id="tree" class="directory-tree"></ul>
	  <div class="resize-handle"></div>
	</div>

	<div id="chatSavedModal" class="modal">
	  <div class="modal-content">
		<span class="close">&times;</span>
		<h3>Context saved</h3>
		<p><span class="inlineclose">⇦</span> <br> Back to make changes</p>
		<p>&nbsp;</p>
		<p><a href="index.html"><img src="assets/img/documentChat-32.png"></a><br>Proceed to Chat</p>
	  </div>
	</div>

	<div id="fileInfoModal" class="modal">
	  <div class="modal-content">
		<span class="close">&times;</span>
		<h3 class="modal-filename"></h3>
		<pre class="modal-body-text"></pre>
	  </div>
	</div>

	<div id="iconsModal" class="modal">
	  <div class="modal-content">
		<span class="close">&times;</span>
		<h2>Directory</h2>
		<p>This panel displays a tree view of your files and folders. It helps you visualize which documents are currently loaded into Model Manager, and also allows you to limit the scope of your questions to specific subsets of those documents.<p>
		<p><Here you can:</p>
		 <p>Click folder names to display or hide folder contents</p>
		 <p>Use checkboxes to select items for chat context</p>
		 <p>Select the file icon to see more information about the file</p>
		  <p>Use the buttons above to control the entire tree</p>
		<p>"Set Chat Context" saves your selected files for use in conversations.</p>
		<h3>Icon Guide</h3>
		<ul>
		  <li>📁 Folder (collapsed)</li>
		  <li>📂 Folder (expanded)</li>
		  <li>📘 Word Doc</li>
		  <li>📗 Excel File</li>
		  <li>📙 PowerPoint</li>
		  <li>📕 PDF</li>
		  <li>🗎 Other files</li>
		  <li>✅ File Successfully Indexed</li>
		  <li>⚠️ File Not Yet Indexed</li>
		  <li>⛔ File Not Loaded</li>
		</ul>
	  </div>
	</div>
	
  </div>
`;
}

renderTree() {
  console.log("🌲 renderTree called");

  const tree = this.container.querySelector("#tree");
  if (!tree || !Array.isArray(this.data)) return;

  // Clear only the #tree content
  tree.innerHTML = "";

  // Render tree nodes
  this.data.forEach(item => this.createTreeNode(item, tree));

  // Hide all nested folders
  tree.querySelectorAll("ul").forEach(ul => ul.classList.add("hidden"));

  // Reset folder icons
  tree.querySelectorAll(".folder .file-icon").forEach(icon => icon.textContent = "📁");

  // Dispatch render event
  const treeReadyEvent = new CustomEvent("directoryRendered");
  this.container.dispatchEvent(treeReadyEvent);
if (this.mode === "excelonly") {
  this.expandAllFolders();
}

  console.log("📤 directoryRendered dispatched");
}


  getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      /*
	  case "pdf": return "📕";
      case "doc": case "docx": return "📘";
      case "xls": case "xlsx": case "xlsm": return "📗";
      case "ppt": case "pptx": case "ppsx": case "pptm": return "📙";
      case "txt": return "📄";
	  */
      //default: return "📋"; //ℹ️ no css //ℹ takes css
	  default: return "ℹ️";
	  
    }
  }

setupRestoreSelections() {
  // 🔍 STEP 4: Debug block — add this first
  const storedData = localStorage.getItem("chatContext");
  if (!storedData) return;

  const parsedData = JSON.parse(storedData);
  const selectedIds = new Set(parsedData.selected_items.map(item => item.r2r_id?.toLowerCase()));

  const checkboxIds = [...this.container.querySelectorAll(".directory-tree input[type=checkbox]")]
    .map(cb => cb.getAttribute("data-r2r-id")?.toLowerCase())
    .filter(Boolean);

  console.log("🔍 Stored selected r2r_ids:", [...selectedIds]);
  console.log("📦 Checkbox r2r_ids:", checkboxIds);

  // ✅ Original checkbox restore logic
  const checkboxes = this.container.querySelectorAll(".directory-tree input[type=checkbox]");
  checkboxes.forEach(checkbox => {
    const r2rId = checkbox.getAttribute("data-r2r-id")?.toLowerCase();
    if (r2rId && selectedIds.has(r2rId)) {
      checkbox.checked = true;
      this.updateParentCheckboxes(checkbox);
    }
  });

  this.updateToggleIcon?.();
}

async loadConfig() {
  try {
    const res = await fetch('assets/config/directory-config.json');
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    this.config = await res.json();
  } catch (err) {
    console.error("Error loading config:", err);
    this.config = {}; // fallback to empty
  }
}


 
  setupSetChatContext() {
  const button = this.container.querySelector("#setChatContext");
  if (!button) return;

  button.addEventListener("click", () => {
    const checkboxes = this.container.querySelectorAll(".directory-tree input[type=checkbox]");
    const selectedItems = [];

checkboxes.forEach(checkbox => {
  if (checkbox.checked) {
    const fileNameElement = checkbox.closest("div")?.querySelector(".file-name");
    if (fileNameElement) {
      selectedItems.push({
        name: fileNameElement.textContent,
        r2r_id: checkbox.getAttribute("data-r2r-id") || null
      });
    }
  }
});

    const chatContext = {
      timestamp: new Date().toISOString(),
      selected_items: selectedItems,
    };

    localStorage.setItem("chatContext", JSON.stringify(chatContext));
    const modal = this.container.querySelector("#chatSavedModal");
    if (modal) modal.style.display = "flex";  });
}

setupExpandCollapse() {
  const expandAllBtn = this.container.querySelector("#expandAll");
  const collapseAllBtn = this.container.querySelector("#collapseAll");

  if (expandAllBtn) {
    expandAllBtn.addEventListener("click", () => {
      this.container.querySelectorAll("ul.directory-tree").forEach(ul => {
        ul.classList.remove("hidden");
      });
      this.container.querySelectorAll(".folder .file-icon").forEach(icon => {
        icon.textContent = "📂";
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener("click", () => {
      // Collapse only nested folders
      const allUls = this.container.querySelectorAll("ul.directory-tree");
      allUls.forEach(ul => {
        const isTopLevel = ul.parentElement.tagName === "DIV"; // top-level <ul> is inside the div, not an <li>
        if (!isTopLevel) {
          ul.classList.add("hidden");
        }
      });

      this.container.querySelectorAll(".folder .file-icon").forEach(icon => {
        icon.textContent = "📁";
      });
    });
  }
}

setupToggleCheckAll() {
  const toggleBtn = this.container.querySelector("#toggleCheckAll");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const checkboxes = this.container.querySelectorAll(
      ".directory-tree input[type=checkbox]:not(:disabled)"
    );

    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const newState = !allChecked;

    checkboxes.forEach(cb => {
      cb.checked = newState;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    });

    this.updateToggleIcon();
  });

  // Ensure icon is correct on load
  this.updateToggleIcon();
}


setupEventListeners() {
  const helpBtn = this.container.querySelector("#helpButton");
  const helpModal = this.container.querySelector("#helpModal");
  const iconsBtn = this.container.querySelector("#openIconsModal");
  const iconsModal = this.container.querySelector("#iconsModal");
  const modals = this.container.querySelectorAll(".modal");
  const refreshBtn = this.container.querySelector("#refreshTree");
  console.log("🔄 Refresh button found:", refreshBtn);

  const clearChatBtn = document.getElementById("clearChatContext");
  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      console.log("🗑 Clearing chat context…");
      // 1) Clear stored chat context
      localStorage.removeItem("chatContext");
      // 2) refresh the page
	location.href = location.href; 
    });
  }

  refreshBtn?.addEventListener("click", () => {
	  console.log("🔁 Refresh triggered");
	  location.href = location.href; 
  });

  helpBtn?.addEventListener("click", () => helpModal.style.display = "flex");
  iconsBtn?.addEventListener("click", () => iconsModal.style.display = "flex");
 
  modals.forEach(modal => {
    modal.querySelector(".close")?.addEventListener("click", () => modal.style.display = "none");
	modal.querySelector(".inlineclose")?.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

  // Close modals on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach(modal => modal.style.display = "none");
    }
  });
const toolbarSearchBtn =
  this.container.querySelector("#toolbarSearchBtn") ||
  document.getElementById("toolbarSearchBtn");

if (toolbarSearchBtn && !toolbarSearchBtn.dataset.bound) {
  toolbarSearchBtn.dataset.bound = "1";
  toolbarSearchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const searchContainer = document.getElementById("searchContainer");
    if (!searchContainer) return;
    searchContainer.classList.toggle("active");
  });
}

const showCheckedBtn =
  this.container.querySelector("#showCheckedBtn") ||
  document.getElementById("showCheckedBtn");

if (showCheckedBtn && !showCheckedBtn.dataset.bound) {
  showCheckedBtn.dataset.bound = "1";
  showCheckedBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof this.expandToRevealChecked === "function") {
      this.expandToRevealChecked();
      this.updateToggleIcon?.();
    } else {
      console.warn("expandToRevealChecked() is not defined on DirectoryService.");
    }
  });
}


}

setupSearchToggle() {
  const toggleSearch = this.container.querySelector("#toolbarSearchBtn");
  const searchPanel = this.container.querySelector("#searchPanel");
  if (!toggleSearch || !searchPanel) return;

  if (!searchPanel.style.display) {
    searchPanel.style.display = "none";
  }

  toggleSearch.addEventListener("click", () => {
    searchPanel.style.display =
      searchPanel.style.display === "none" ? "block" : "none";
  });
}

  setupSearchHandler() {
    const searchInput = this.container.querySelector("#searchInput");
    const resultsList = this.container.querySelector("#searchResults");
    if (!searchInput || !resultsList) return;

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      resultsList.innerHTML = "";

      const items = this.container.querySelectorAll(".directory-tree .file-name");
      let matchCount = 0;

      items.forEach(item => {
        if (item.textContent.toLowerCase().includes(query)) {
          matchCount++;
          const li = document.createElement("li");
          const originalCheckbox = item.closest("li")?.querySelector("input[type=checkbox]");
          const clonedCheckbox = originalCheckbox?.cloneNode();
          const label = document.createElement("span");
          label.textContent = item.textContent;

          clonedCheckbox?.addEventListener("change", () => {
            if (originalCheckbox) {
              originalCheckbox.checked = clonedCheckbox.checked;
              originalCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
          });

          li.appendChild(clonedCheckbox);
          li.appendChild(label);
          li.addEventListener("click", () => item.scrollIntoView({ behavior: "smooth", block: "center" }));

          resultsList.appendChild(li);
        }
      });

      if (matchCount === 0) {
        const li = document.createElement("li");
        li.textContent = "No matches found.";
        li.classList.add("no-match");
        resultsList.appendChild(li);
      }
    });
  }
 
 generateFileModalContent(documentId) {
	 console.log("🟢 Generating Modal for:", documentId);
	 
	 
 }
 
buildR2RIndexFromTree(data) {
  if (!Array.isArray(data)) return;

  const index = {};

  function traverse(node, path = "") {
    const currentPath = path ? `${path}/${node.name}` : node.name;

    if (node.type === "file" && node.r2r_id && node.r2r_id !== "N/A") {
      index[node.r2r_id.toLowerCase()] = {
        name: node.name,
        web_url: node.web_url || "",
        r2r_summary: node.r2r_summary || "",
        r2r_ingestion_status: node.r2r_ingestion_status || "",
        id: node.id || "",
        ctag: node.ctag || "",
        etag: node.etag || "",
        onedrive_loc: node.onedrive_loc || "",
        relative_path: currentPath // ✅ Add this line
      };
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child, currentPath));
    }
  }

  data.forEach(rootNode => traverse(rootNode));
  window.r2rIndex = index;
  console.log("✅ r2rIndex built with", Object.keys(index).length, "items");
}


getSharePointDirectLinkFromIndex(documentId) {
  const doc = window.r2rIndex?.[documentId];
  if (!doc) return null;

  const base = "https://contractsmarts-my.sharepoint.com";
  const username = this.config.SHAREPOINT_USERNAME || "alfredo_contractsmarts_ai";
  const sharepointRoot = this.config.SHAREPOINT_BASE_PATH || "error";

  const rawPath = `${sharepointRoot.replace(/\/$/, "")}/${doc.relative_path.replace(/^\/+/, "")}`.replace(/\\/g, "/");
  const encodedPath = rawPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const ext = doc.name.toLowerCase();
  const typeCode = ext.endsWith(".pdf") ? ":b:" : this.getTypeCode(doc.name); // Notice the use of `this.` here too
  
  
  const finalUrl = `${base}/${typeCode}/r/personal/${username}/Documents/${encodedPath}`;
  
  console.log("[directory service] finalUrl = ", finalUrl);
  //return `${base}/${typeCode}/r/personal/${username}/Documents/${encodedPath}`;
  return finalUrl;
}



getOfficeUriFromSharePointLink(link, fileName = "") {
  const ext = (fileName || '').split('.').pop().toLowerCase();

  if (["doc", "docx"].includes(ext)) {
    return `ms-word:ofe|u|${link}`;
  } else if (["xls", "xlsx", "xlsm", "xlsb"].includes(ext)) {
    return `ms-excel:ofe|u|${link}`;
  } else if (["ppt", "pptx"].includes(ext)) {
    return `ms-powerpoint:ofe|u|${link}`;
  } else {
    return link; // Open in browser for others like PDF
  }
}

getTypeCode(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  if (["xls", "xlsx", "xlsm", "xlsb"].includes(ext)) return ":x:";
  if (["doc", "docx"].includes(ext)) return ":w:";
  if (["ppt", "pptx"].includes(ext)) return ":p:";
  return ":u:";
}

isExcelFile(name = "") {
  return /\.xlsx?$/i.test(name); // .xls or .xlsx (case-insensitive)
}

}