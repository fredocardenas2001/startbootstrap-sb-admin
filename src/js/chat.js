import DirectoryService from '../js/DirectoryService.js';
import { createFeedbackBar } from '../js/feedbackbar.js';

window.currentSessionId = null;
let config;

let chatBox;  // global, accessible everywhere

document.addEventListener("DOMContentLoaded", () => {
  chatBox = document.getElementById("chatBox");
  if (!chatBox) {
    console.error("❌ chatBox not found");
    return;
  }
  chatBox.innerHTML = "";
});


function initializeOnce() {
  if (window.__taskpane_initialized) {
    console.warn("⚠️ initialize() was already called. Skipping.");
    return;
  }
  window.__taskpane_initialized = true;
  initializeApp();
}

function loadOfficeAndInit() {
  // If already loaded, just wait for readiness
//  if (typeof Office !== "undefined" && Office.onReady) {
  if (true) {
    //Office.onReady(info => {
      //console.log("✅ Office.js already loaded and ready in:", info.host);
      initializeOnce();
    //});

    return;
  }

  // Otherwise, inject the script
  const script = document.createElement("script");
  script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
  script.async = true;
  script.onload = () => {
    if (typeof Office !== "undefined" && Office.onReady) {
      Office.onReady(info => {
        console.log("✅ Office.js loaded and ready in:", info.host);
        initializeOnce();
      });
    } else {
      console.error("❌ Office.js script loaded but Office object not available.");
    }
  };
  script.onerror = () => {
    console.error("❌ Failed to load Office.js from CDN.");
    // Optional: fallback to local copy if you have one
  };

  document.head.appendChild(script);
}

// Call this when your page loads
document.addEventListener("DOMContentLoaded", loadOfficeAndInit);

window.converter = new showdown.Converter();


async function initializeApp() {
  console.log("Initializing App...");
  window.config = await loadConfig();
    
  window.apiKey = window.config.SCIPHI_API_KEY;
  window.sciPhiUrl = window.config.SCIPHI_API_URL;
  window.sourcePlatform = window.config.SOURCE_PLATFORM;
  window.sharepointBasePath = window.config.SHAREPOINT_BASE_PATH;
  const chatBox = document.getElementById("chatBox");
  const sessionList = document.getElementById("sessionList");
  
  console.log("sciPhiUrl:",sciPhiUrl)
  
  injectDocPreviewModal();  
  await loadAndBuildR2RIndex();
  //console.log("✅ r2rIndex loaded. Sample keys:");
  //console.log(Object.keys(window.r2rIndex).slice(0, 10));
  await loadSessions();
  updateChatContextButton();
}

export function initPreviousChats() {
  const prevBtn = document.getElementById("previousChatsBtn");
  if (!prevBtn) {
    console.error("❌ Previous Chats button not found");
    return;
  }
  prevBtn.addEventListener("click", () => {
    console.log("📜 Previous Chats clicked");
    // 👉 Replace this comment with your existing previous chats logic
    // e.g. open a modal, call loadSessions(), whatever you had before
  });

  console.log("✅ Listener bound to Previous Chats:", prevBtn);
}

// 🔹 Wire up "Chat Context"
export function initChatListeners() {
  const chatContextBtn = document.getElementById("chatContext");
  const dirPanel       = document.getElementById("directoryPanel");
  const dirContainer   = document.getElementById("directory-container");
  let directoryInstance = null;

  if (!chatContextBtn || !dirPanel || !dirContainer) {
    console.error("❌ Chat Context wiring failed: missing DOM elements");
    return;
  }

chatContextBtn.addEventListener("click", async () => {
  const isExpanded = dirPanel.classList.contains("expanded");

  if (isExpanded) {
    // collapse
    dirPanel.classList.remove("expanded");
    dirPanel.classList.add("hidden");
  } else {
    // expand
    dirPanel.classList.remove("hidden");
    dirPanel.classList.add("expanded");

    if (!directoryInstance) {
      directoryInstance = new DirectoryService({
        container: dirContainer,
        autoFetch: true,
        mode: "full"
      });
      await directoryInstance.initialize();
    }
  }
});



  console.log("✅ Listener bound to Chat Context:", chatContextBtn);
}

// 🔹 Master init that wires both
export function initAllListeners() {
  initPreviousChats();
  initChatListeners();
}
async function loadConfig() {
  try {
    const res = await fetch('assets/config/directory-config.json');
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    const config = await res.json();
    return config;
  } catch (err) {
    console.error("Error loading config:", err);
    return {}; // fallback to empty
  }
}

function getSharePointDirectLinkFromIndex(documentId) {
  const doc = window.r2rIndex?.[documentId];
  if (!doc) return null;

  const base = "https://contractsmarts-my.sharepoint.com";
  const username = "alfredo_contractsmarts_ai";
  const sharepointRoot = window.config.sharepointBasePath || "Customer Data/Demo";

  // Normalize and encode the path
  const rawPath = `${sharepointRoot.replace(/\/$/, "")}/${doc.relative_path.replace(/^\/+/, "")}`.replace(/\\/g, "/");
  const encodedPath = rawPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const ext = doc.name.toLowerCase();
  const typeCode = ext.endsWith(".pdf") ? ":b:" : getTypeCode(doc.name);

  const finalUrl = `${base}/${typeCode}/r/personal/${username}/Documents/${encodedPath}`;
  
  console.log("built URL:", finalUrl);
  return finalUrl;
}


function getOfficeUriFromSharePointLink(link, fileName = "") {
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

function getTypeCode(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  if (["xls", "xlsx", "xlsm", "xlsb"].includes(ext)) return ":x:";
  if (["doc", "docx"].includes(ext)) return ":w:";
  if (["ppt", "pptx"].includes(ext)) return ":p:";
  return ":u:";
}


function convertMarkdownToHtml(markdownText) {
  return converter.makeHtml(markdownText);
}

function openCitationModal(documentId) {
  console.log("🟢 Opening Citation Modal for:", documentId);

  const modal = document.getElementById("docPreviewModal");
  if (!modal) {
    alert("❌ Modal not found in DOM");
    return;
  }

modal.removeAttribute("style"); // 🔥 removes all inline styles, including display: none
modal.classList.add("show");    // ✅ uses your CSS to show modal



  const docMeta = window.r2rIndex?.[documentId];
  if (!docMeta) {
    console.warn("❌ No metadata found for documentId:", documentId);
    return;
  }

  const summary = docMeta?.r2r_summary || docMeta?.summary || "No summary available";
  const platform = window.sourcePlatform?.toLowerCase();

	const doc_title =
	  docMeta?.metadata?.onedrive_name ||
	  docMeta?.title ||
	  docMeta?.name ||   // ✅ use this for filename
	  "Document Preview";


  let uri = null;
  if (platform === "onedrive") {
    const sharepointUrl = getSharePointDirectLinkFromIndex(documentId);
    uri = getOfficeUriFromSharePointLink(sharepointUrl, doc_title);
  } else if (platform === "dropbox") {
    uri = docMeta?.web_url || null;
  } else {
    console.warn("❌ Unsupported SOURCE_PLATFORM:", platform);
    return;
  }

const citationText = window.citationData?.[documentId] || "No citation text available.";

console.log("🔎 Updating modal:", { doc_title, uri, summary, citationText });
//console.log("🗂️ docMeta dump:", JSON.stringify(docMeta, null, 2));


  const titleEl = document.getElementById("docModalTitle");
  titleEl.innerHTML = `<a href="${uri}" target="_blank" title="${summary}">${doc_title}</a>`;

  const renderedHtml = convertMarkdownToHtml(citationText);
  //console.log("📄 Rendered citationText:", renderedHtml);
  document.getElementById("docModalContent").innerHTML = renderedHtml;
}
window.openCitationModal = openCitationModal;

function traverseAndBuildIndex(node, path = "") {
  if (node.type === "file" && node.r2r_id) {
    const key = node.r2r_id.toLowerCase();
    window.r2rIndex[key] = {
      name: node.name,
      web_url: node.web_url,
      r2r_summary: node.r2r_summary,
      id: node.id,
      relative_path: `${path}/${node.name}`
    };
  }
  if (Array.isArray(node.children)) {
    node.children.forEach(child => {
      const childPath = node.name ? `${path}/${node.name}` : path;
      traverseAndBuildIndex(child, childPath);
    });
  }
}

async function loadAndBuildR2RIndex() {
  const username = window.config.API_USERNAME;
  const password = window.config.API_PASSWORD;
  const baseUrl = window.config.API_JSON_URL;
  const moniker = window.config.ACCOUNT_MONIKER;
  const baseFile = window.config.API_JSON_BASE;
  const basicAuth = btoa(`${username}:${password}`);

  // 👇 Join the pieces: URL + moniker + '.' + filename
  const jsonUrl = `${baseUrl}${moniker}.${baseFile}`;

  console.log("🌐 JSON URL:", jsonUrl); // Optional debug

  try {
    const response = await fetch(jsonUrl, {
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonTree = await response.json();
    console.log("📂 JSON fetched successfully");

    window.r2rIndex = {};

    if (Array.isArray(jsonTree)) {
      jsonTree.forEach(root => traverseAndBuildIndex(root));
    } else {
      traverseAndBuildIndex(jsonTree);
    }

    const keys = Object.keys(window.r2rIndex);
    console.log(`✅ r2rIndex built with ${keys.length} documents`);
    //console.log("🔑 Sample keys from r2rIndex:", keys.slice(0, 5));

  } catch (err) {
    console.error("❌ Failed to load or parse JSON:", err);
  }
}
window.loadAndBuildR2RIndex = loadAndBuildR2RIndex;


const formattingMessages = [
    "Zen formatting being applied...",
    "Buffing your results to a shine...",
    "Applying intellectual carnuba wax...",
    "Sharpening the insights...",
    "Tidying up your results...",
    "Threading the strands...",
    "Aligning your stars...",
    "Ironing out the logic wrinkles...",
    "Aligning results with the universe...",
    "Final brushstrokes in progress...",
    "Warming up the wisdom...",
    "Turning scribbles into symphony...",
    "Distilling clarity from the chaos...",
	"Applying intellectual carnauba wax...",
	"Buffing the brilliance to showroom condition...",
	"Detailing your insights with microfiber precision...",
	"Adding a layer of cognitive ceramic coating...",
	"Polishing punctuation until it sparkles...",
	"Weaving loose thoughts into tight prose...",
	"Sanding rough edges off sentences...",
	"Pressing wrinkles out of paragraphs...",
	"Combing tangles out of your logic...",
	"Fermenting ideas for extra flavor...",
	"Tempering arguments for strength and shine...",
	"Blending metaphors until smooth...",
	"Tuning commas to concert pitch...",
	"Stitching transitions with invisible thread...",
	"Mosaicking fragments into a picture...",
	"Herding wayward clauses back to pasture...",
	"Magnetizing insights to the surface...",
	"Marinating meaning for deeper depth...",
	"Aligning margins and muses...",
	"Focusing the narrative lens...",
	"Knocking extra adjectives off the shelf...",
	"Defragmenting thoughts for faster recall...",
	"Coaxing clarity out of the static...",
	"Locking your takeaways into place..."
];


const waitingGifs = [
    "assets/img/panels1.gif",
	"assets/img/panels2.gif",
	"assets/img/panels3.gif"
];

function extractAllCitations(jsonData) {
    return jsonData.results.flatMap(entry => 
        entry.message?.metadata?.citations || []
    );
}


function showLoadingGif() {
	console.log("running gif generator...");
    const gifUrl = waitingGifs[Math.floor(Math.random() * waitingGifs.length)];
    
    const gifElement = document.createElement("img");
    gifElement.src = gifUrl;
    gifElement.alt = "Loading...";
    gifElement.className = "loading-gif";

    const wrapper = document.createElement("div");
    wrapper.className = "chat-message assistant loading";
    wrapper.appendChild(gifElement);

    document.getElementById("chatBox").appendChild(wrapper);
    return wrapper;
}

function removeLoadingGif(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}




function injectDocPreviewModal() {
  console.log("🛠️ injectDocPreviewModal called");

const modalHtml = `
  <div id="docPreviewModal" class="doc-preview-modal" style="display:none;">
    <div class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="docModalTitle">Document Preview</h3>
          <span class="close">&times;</span>
        </div>
        <hr>
        <h4 id="docModalSubheading">Citation Details</h4>
        <div id="docModalContent"></div>
      </div>
    </div>
  </div>
`;


  const chatRoot = document.querySelector("#chat-entry");
  if (chatRoot) {
    chatRoot.insertAdjacentHTML("beforeend", modalHtml);
  } else {
    console.warn("⚠️ #chat-entry not found, falling back to <body>");
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  const modal = document.getElementById("docPreviewModal");
  const backdrop = modal.querySelector(".modal-backdrop");
  const closeBtn = modal.querySelector(".close");

  // ✅ Click the X
  if (closeBtn) {
    closeBtn.addEventListener("click", closeDocPreviewModal);
  }

  // ✅ Click backdrop (but not content)
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) {
        closeDocPreviewModal();
      }
    });
  }

  // ✅ Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDocPreviewModal();
    }
  });
}

function openDocPreviewModal() {
  const modal = document.getElementById("docPreviewModal");
  if (modal) {
    modal.classList.add("show");
    modal.style.removeProperty("display");
  }
}

function closeDocPreviewModal() {
  const modal = document.getElementById("docPreviewModal");
  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "none";
  }
}


function loadSessions() {
    const config = window.config || {};
	const sciPhiUrl = config.SCIPHI_API_URL;
    const apiKey = config.SCIPHI_API_KEY;
	console.log("using url:", `${window.sciPhiUrl}conversations`);
	fetch(`${window.sciPhiUrl}conversations`, {

        method: "GET",
        headers: { "x-api-key": window.apiKey }
    })
    .then(response => response.json())
    .then(data => {
        sessionList.innerHTML = "";
		window.sessionNameMap = {};

	sessionList.innerHTML = "";                 // 1) clear
	window.sessionNameMap = {};                 // 2) reset map

	const seen = new Set();                     // 3) dedupe
	const unique = data.results.filter(s => {
	  if (!s?.id) return false;
	  if (seen.has(s.id)) return false;
	  seen.add(s.id);
	  return true;
	});

	unique.forEach(session => {
	  window.sessionNameMap[session.id] = session.name;

	  const sessionItem = document.createElement("div");
	  sessionItem.className = "session-item";
	  sessionItem.dataset.sessionId = session.id;
	  sessionItem.onclick = () => loadSessionMessages(session.id);

	  const name = document.createElement("span");
	  name.className = "session-name";
	  name.textContent = session.name ?? "Untitled Chat";

	  const ellipsis = document.createElement("button");
	  ellipsis.className = "ellipsis-menu";
	  ellipsis.textContent = "⋮";
	  ellipsis.onclick = (e) => { e.stopPropagation(); toggleMenu(e); };

	  const menu = document.createElement("div");
	  menu.className = "menu-dropdown";
	  menu.style.display = "none";

	  const rename = document.createElement("button");
	  rename.textContent = "Rename Chat";
	  rename.onclick = (e) => { e.stopPropagation(); renaFmeChat(session.id); };

	  const del = document.createElement("button");
	  del.textContent = "Delete Chat";
	  del.onclick = (e) => { e.stopPropagation(); deleteChat(session.id); };

	  menu.append(rename, del);
	  sessionItem.append(name, ellipsis, menu);
	  sessionList.appendChild(sessionItem);
	});
        console.log("✅ All Sessions Loaded with IDs:", [...document.querySelectorAll(".session-item")].map(e => e.getAttribute("data-session-id")));
    })
    .catch(error => console.error("❌ Error loading sessions:", error));
}

function loadSessionMessages(sessionId) {
	sessionListContainer.classList.remove('visible');
	let loadingMsgEl = showLoadingGif();
	console.log(`🟢 loadSessionMessages triggered for session ID: ${sessionId}`);
	window.currentSessionId = sessionId; // Store session ID

	// 🔍 Debug: Log all available session elements and their IDs
	document.querySelectorAll(".session-item").forEach(item => 
		console.log(`Checking session-item: ${item.textContent}, ID: ${item.getAttribute("data-session-id")}`)
	);
	// Find the correct session item
	const selectedSession = Array.from(document.querySelectorAll(".session-item")).find(
		item => item.getAttribute("data-session-id") === sessionId
	);

	if (selectedSession) {
		console.log("✅ Session Highlighted:", sessionId);
	} else {
		console.warn("⚠️ No session item matched this ID:", sessionId);
	}
	
	apiKey = window.config.SCIPHI_API_KEY;
	sciPhiUrl = window.config.SCIPHI_API_URL;

	fetch(`${window.sciPhiUrl}conversations/${sessionId}`, {

		method: "GET",
		headers: { "x-api-key": window.apiKey }
	})
.then(async (response) => {
  // 1) RAW wire JSON string
  const raw = await response.clone().text();
  console.log('[RAW HTTP JSON - conversations]', raw);

  // 2) Dump only "snippet": "..." values exactly as they appear on the wire
  for (const m of raw.matchAll(/"snippet"\s*:\s*"((?:\\.|[^"\\])*)"/g)) {
    console.log('[SNIPPET (wire)]', `"${m[1]}"`);
  }

  // 3) Continue as before
  return response.json();
})
	.then(data => {
	if (!data.results || !Array.isArray(data.results)) {
		console.error("❌ ERROR: `results` is missing or not an array.");
		return;
	}

	const allCitations = extractAllCitations(data); // 🔍 Extract all citation data once

	const messages = data.results.map(item => ({
		role: item.message.role,
		content: item.message.content,
		metadata: item.message?.metadata || item.metadata || {},
	})).filter(msg => msg.content); // Filter out null/empty content
	
	const sessionName = window.sessionNameMap?.[sessionId] || "Untitled Chat";
	const chatButton = document.getElementById("chatstat");
	updateCurrentChatButton(sessionName, sessionId);

	if (!data.results || !Array.isArray(data.results)) {
		console.error("❌ ERROR: `results` is missing or not an array.");
		return;
	}

	if (!messages.length) {
		console.warn(`⚠️ No messages found in session ${sessionId}.`);
		return;
	}

let chatBox;  // global

document.addEventListener("DOMContentLoaded", () => {
  chatBox = document.getElementById("chatBox");
  if (!chatBox) {
    console.error("❌ chatBox not found");
    return;
  }
  chatBox.innerHTML = "";  // safe
});


(async () => {
  for (const message of messages) {
    const metadata = {
      ...message.metadata,
      citations: allCitations
    };
    // If processAndDisplayMessage is async, this enforces order.
    await Promise.resolve(processAndDisplayMessage(
      message.role === "user" ? "You" : "Model Manager",
      message.content,
      metadata,
      message.role
    ));
  }
})();


	const MIN_DISPLAY_MS = 2000;
	const now = Date.now();
	const elapsed = now - (window.overlayShownAt || now);
	const remainingDelay = Math.max(0, MIN_DISPLAY_MS - elapsed);

	setTimeout(() => {
		const formattingOverlay = document.getElementById("formattingOverlay");
		if (formattingOverlay) formattingOverlay.remove();
	}, remainingDelay);

	window.overlayShownAt = Date.now();
	})
	.catch(error => console.error("❌ Error loading session messages:", error));
	
	if (loadingMsgEl && loadingMsgEl.remove) {
		loadingMsgEl.remove();
	}

}
		
//Launch toolbar buttons here
document.addEventListener("DOMContentLoaded", () => {
let isSessionListOpen = false;

function toggleSessions() {
	const statusPanel = document.getElementById('chatStatusContainer');
	const sessionsPanel = document.getElementById('sessionListContainer');

	// ✅ Close the other panel
	statusPanel.classList.remove('visible');

	// ✅ Toggle this one
	const willShow = !sessionsPanel.classList.contains('visible');
	sessionsPanel.classList.toggle('visible', willShow);

	if (willShow) {
	loadSessions(); // load only when opening
	}

}
window.toggleSessions = toggleSessions;

	const chatStatusContainer = document.getElementById('chatStatusContainer');
	const chatStatusButton    = document.getElementById('chatstat');

	document.addEventListener('click', (event) => {
	  if (!chatStatusContainer || !chatStatusButton) return; // guard
	  if (!chatStatusContainer.contains(event.target) &&
		  !chatStatusButton.contains(event.target)) {
		chatStatusContainer.classList.remove('visible');
	  }
	});



document.addEventListener('click', (event) => {
  const list = document.getElementById('sessionListContainer');
  if (!list) return;

  isSessionListOpen = list.classList.contains('visible');
  if (!isSessionListOpen) return;

  const buttons = document.querySelectorAll('.collapsible');
  const clickOnButton = Array.from(buttons).some(btn => btn.contains(event.target));
  const clickInsideList = list.contains(event.target);

  if (!clickInsideList && !clickOnButton) {
    list.classList.remove('visible');
  }
});


function showChatStatus() {
  console.log('showChatStatus fired, sessionId=', window.currentSessionId);
  if (!window.currentSessionId) return;

  const panel = document.getElementById("chatStatusContainer");
  const sessionsPanel = document.getElementById("sessionListContainer");

  // Close the other panel
  sessionsPanel.classList.remove("visible");

  ensureChatStatusPanelBuilt(panel);

  // Toggle this one (only once)
  console.log("before:", panel.className);
  panel.classList.toggle("visible");

  // Inspect result without changing state
  setTimeout(() => {
    console.log(
      "after (0ms):",
      panel.className,
      "display=", getComputedStyle(panel).display,
      "opacity=", getComputedStyle(panel).opacity
    );
  }, 0);
}

	// Hide on outside click
	document.addEventListener("click", (event) => {
	  const panel = document.getElementById("chatStatusContainer");
	  const button = document.getElementById("chatstat");

	  if (!panel.contains(event.target) && !button.contains(event.target)) {
		panel.classList.remove("visible");
	  }
	});

	// Hide on Escape
	document.addEventListener("keydown", (event) => {
	  if (event.key === "Escape") {
		const panel = document.getElementById("chatStatusContainer");
		panel.classList.remove("visible");
	  }
	});
window.showChatStatus = showChatStatus;

	  // Close if clicking outside
	document.addEventListener("click", (event) => {
	  if (!window.currentSessionId) return;                    // only care when a chat is active

	  const panel  = document.getElementById("chatStatusContainer");
	  const button = document.getElementById("chatstat");
	  if (!panel || !button) return;

	  if (!panel.classList.contains("visible")) return;        // do nothing if already hidden

	  const clickedOutside = !panel.contains(event.target) && !button.contains(event.target);
	  if (clickedOutside) {
		panel.classList.remove("visible");                     // close panel
		// don't touch button classes here; color handled elsewhere
	  }
	});

});

function ensureChatStatusPanelBuilt(panel) {
  if (!panel || panel.dataset.built) return;

  // --- Build placeholder sections
  panel.innerHTML = `
    <div class="cs-head">
		<div class="cs-icon">Export</div>
		<div class="cs-icon">🡺</div>
			<div class="cs-icon">
			  <button
				id="exportWord"
				type="button"
				class="icon-btn"
				aria-label="Export conversation to Word"
				title="Export conversation to Word">
				<img src="assets/img/word-file.svg" class="svg" alt="" aria-hidden="true">
			  </button>
			</div>
		</div>		
	</div>
	<div class="cs-accordion">
      ${makeSection("Sharing Options", `
        <p>Chat Sharing...</p>
      `)}

      ${makeSection("Session Info", `
        <div>Session ID:</div>
		<div><code>${window.currentSessionId || "(none)"}</code></div>
        
      `)}
    </div>
  `;

  // --- Wire accordion toggles
	panel.querySelectorAll(".cs-accordion .cs-section").forEach((sec, i) => {
	  const header  = sec.querySelector(".cs-header");
	  const content = sec.querySelector(".cs-content");
	  if (!header || !content) return; // safety

	  header.addEventListener("click", () => {
		const open = sec.classList.toggle("open");
		header.setAttribute("aria-expanded", open ? "true" : "false");
		content.style.maxHeight = open ? content.scrollHeight + "px" : "0px";
	  });

  });

  panel.dataset.built = "1";
}

function wireExportButtonsOnce() {
  const w = document.getElementById('exportWord');
  if (w && !w.dataset.bound) {
    w.addEventListener('click', exportConversationToWord);
    w.dataset.bound = '1';
  }
  const p = document.getElementById('exportPDF');
  if (p && !p.dataset.bound) {
    p.addEventListener('click', exportConversationToPDF);
    p.dataset.bound = '1';
  }
}

function makeSection(title, innerHTML) {
  const id = "cs_" + Math.random().toString(36).slice(2, 8);
  return `
    <section class="cs-section" id="${id}-section">
      <button class="cs-header" id="${id}-header" type="button"
              aria-expanded="false" aria-controls="${id}-content">
        <span class="chevron">▸</span>
        <span class="title">${title}</span>
      </button>
      <div class="cs-content" id="${id}-content" role="region"
           aria-labelledby="${id}-header">
        ${innerHTML}
      </div>
    </section>
  `;
}


function addMessageToChat(sender, text, metadata, role) {
	processAndDisplayMessage(sender, text, metadata, role);
}

function ShowServicePackages() {
  const container = document.getElementById("servicePackageContainer");
  container.classList.toggle("visible");
  container.classList.toggle("hidden");
}
window.ShowServicePackages = ShowServicePackages;

async function sendMessage(customMessage = null, sessionId = null) {
  const messageInput = document.getElementById("messageInput");
  const message = customMessage || messageInput.value.trim();
  if (!message) return;

  let sid = sessionId ?? window.currentSessionId;
  if (!sid) {
    console.log("🟡 No active session. Creating a new chat before sending...");
    sid = await createNewChat(); // returns the new id
  }

    addMessageToChat("You", message, {}, "user"); // ✅ Show user's message immediately
    const loadingElement = showLoadingGif(); // 🔄 Show loading animation

    // 🔄 Context-Aware Enhancement
    let filters = null;
  const stored = localStorage.getItem("chatContext");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const fileIds = parsed.selected_items?.map(item => item.r2r_id).filter(Boolean);

      console.log("🗂️ Selected items:", parsed.selected_items);
      console.log("✅ Extracted fileIds:", fileIds);

      if (fileIds && fileIds.length > 0) {
        filters = { document_id: { "$in": fileIds } };
      } else {
        console.warn("⚠️ chatContext found, but no file IDs were present.");
      }
    } catch (err) {
      console.error("❌ Failed to parse chatContext from localStorage:", err);
    }
  } else {
    console.log("ℹ️ No chatContext found in localStorage.");
  }

  window.sendMessage = sendMessage;
	console.log("📦 localStorage.chatContext:", localStorage.getItem("chatContext"));

	function isWebSearchOn() {
	  if (typeof window.webSearchEnabled === "boolean") return window.webSearchEnabled;
	  const btn = document.getElementById("webSearchToggle");
	  return btn?.getAttribute("aria-pressed") === "true";
	}

	const webOn = isWebSearchOn();

	const localTools = [
	  "get_file_content",
	  "search_file_descriptions",
	  "search_file_knowledge",
	];

	// Build request; omit rag_tools entirely when web is ON
	const requestBody = {
	  message: { role: "user", content: message },
	  conversation_id: sid,
	  search_mode: "advanced",
	  rag_generation_config: { stream: true },
	  ...(filters && { search_settings: { filters } }),
	  ...(!webOn && { rag_tools: localTools }),
	};

	console.log(
	  `Mode: ${webOn ? "WEB (server defaults)" : "LOCAL (explicit tools)"}`
	);
	console.log("🔎 JSON being sent:\n", JSON.stringify(requestBody, null, 2));

	
fetch(`${window.sciPhiUrl}retrieval/agent`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "x-api-key": window.apiKey
    },
    body: JSON.stringify(requestBody)
})
.then(async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let fullText = "";
    let buffer = "";

    const chatMessageDiv = document.createElement("div");
    chatMessageDiv.classList.add("chat-message", "assistant");
    chatMessageDiv.innerHTML = "<strong>Model Assistant:</strong><br><span id='streamingOutput'></span>";
    chatBox.appendChild(chatMessageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const outputSpan = chatMessageDiv.querySelector("#streamingOutput");

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process chunks line-by-line
        let lines = buffer.split("\n");
        buffer = lines.pop(); // keep the last partial line for next loop

        for (const line of lines) {
            if (!line.trim() || !line.startsWith("data:")) continue;

            const jsonStr = line.replace(/^data:\s*/, "");
            if (jsonStr === "[DONE]") break;

            try {
                const eventData = JSON.parse(jsonStr);
				console.log("📨 Partial chunk received:", eventData);
                const delta = eventData?.delta?.content?.[0]?.payload?.value;
                if (delta) {
                    fullText += delta;
					outputSpan.innerHTML = window.converter.makeHtml(fullText);
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            } catch (e) {
                console.warn("⚠️ Failed to parse SSE chunk:", line, e);
            }
        }
    }

	// ✅ After the stream is fully complete
	removeLoadingGif(loadingElement);
	

setTimeout(() => {
	const id = sid;
    if (!id) {
        console.warn("⚠️ sid is null — skipping reload.");
        return;
    }
	const overlay = document.createElement("div");
	overlay.id = "formattingOverlay";
	const message = formattingMessages[Math.floor(Math.random() * formattingMessages.length)];
	overlay.textContent = message;
	document.body.appendChild(overlay);
    const overlayShownAt = Date.now();
    document.getElementById("chatBox").innerHTML = ""; // Clears chat mesages
    document.getElementById("messageInput").value = ""; // Clears input field
    loadSessionMessages(id);
}, 500);



})
.catch(error => {
    console.error("❌ Error receiving stream:", error);
    removeLoadingGif(loadingElement);
    addMessageToChat("System", "Error receiving streamed response.", {}, "system");
});
    messageInput.value = ""; // Clear input
}
window.sendMessage = sendMessage;

function handleEnter(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // stop newline
    sendMessage();          // send on Enter
  }
  // Shift+Enter will now insert a newline naturally
}
window.handleEnter = handleEnter;





function closeCitationModal() {
    document.getElementById("citationModal").style.display = "none";
}

async function processAndDisplayMessage(sender, text, metadata, role) {
  const messageDiv = document.createElement("div");
  let processedText = text;

  // 1) Normalize JSON-style "\n" → real newlines (only if present)
  if (processedText.includes("\\n")) {
    processedText = processedText.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
  }
  // (optional) normalize nested bullets under numbered items
  processedText = processedText.replace(/\n[ \t]{3,}- /g, "\n  - ");

  // 2) Markdown → HTML
  // If your converter has a sanitize option, make sure it does NOT strip HTML we add later.
  const htmlFromMd = window.converter.makeHtml(processedText);

  // 3) Replace citation tokens with icons (works on the HTML string too)
  const withIcons = (role === "assistant" && metadata?.citations?.length)
    ? await replaceCitationsWithIcons(htmlFromMd, metadata.citations)
    : htmlFromMd;

  // 4) Render
  const messageBubble = document.createElement("div");
  messageBubble.classList.add("chat-message", role);
  messageBubble.innerHTML = `<strong>${sender}:</strong><br>${withIcons}`;

  messageDiv.appendChild(messageBubble);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (role === "assistant") {
    const feedbackBar = createFeedbackBar(currentSessionId);
    messageDiv.appendChild(feedbackBar);
  }
}


function toHtmlFromMarkdown(raw) {
  // Normalize JSON-style "\n" to real newlines
  let md = String(raw ?? "");
  if (md.includes("\\n")) md = md.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
  md = md.replace(/\n[ \t]{3,}- /g, "\n  - "); // tidy nested bullets

  // Try your converter first
  try {
    if (window.converter && typeof window.converter.makeHtml === "function") {
      const html = window.converter.makeHtml(md);
      // Heuristic: if we see block tags, assume success
      if (/<(p|ul|ol|li|h[1-6])\b/i.test(html)) return html;
    }
  } catch (_) { /* fall through to fallback */ }

  // Fallback: very small Markdown renderer for paragraphs + lists
  const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const lines = md.split("\n");
  let html = "", inUl = false, inOl = false;

  const closeLists = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (let line of lines) {
    if (/^\s*-\s+/.test(line)) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += "<li>" + esc(line.replace(/^\s*-\s+/, "")) + "</li>";
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += "<ol>"; inOl = true; }
      html += "<li>" + esc(line.replace(/^\s*\d+\.\s+/, "")) + "</li>";
      continue;
    }
    if (/^\s*$/.test(line)) { closeLists(); continue; }
    closeLists();
    html += "<p>" + esc(line) + "</p>";
  }
  closeLists();
  return html;
}


window.citationData = {};

// Self-contained replacer: web 🌐 + local 🗏 (no external helpers needed)
async function replaceCitationsWithIcons(text, citations) {




  console.log("🔎 Processing Citations in Text:", text);

  if (!citations || citations.length === 0) return text;

  // --- local helpers (scoped to this function)
  const esc = (s) => String(s ?? "")
    .replace(/&/g,"&amp;")
    .replace(/"/g,"&quot;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");

  const norm = (s) => String(s || "").trim().toLowerCase();

  function buildCitationIndex(list) {
    const map = new Map();
    for (const c of list || []) {
      const p = c?.payload || {};
      const keys = new Set();

      if (c?.id) keys.add(norm(c.id)); // short token, e.g. "44d42cf"

      // also allow short prefixes of longer ids that sometimes appear in text
      const longs = [p.id, p.document_id, p.source_id].filter(Boolean);
      for (const lid of longs) {
        const n = norm(lid);
        if (!n) continue;
        keys.add(n.slice(0, 7));
        keys.add(n.slice(0, 8));
      }
      for (const k of keys) if (k && !map.has(k)) map.set(k, c);
    }
    return map;
  }

  // ensure stores exist
  if (!window.citationData) window.citationData = {};
  if (!window.webCitationStore) window.webCitationStore = Object.create(null);

  // regex for [abc], [source: abc, def], [Source ID: abc, def]
  const RX = /\[\s*(?:(?:source(?:\s*id)?):\s*)?([a-z0-9]+(?:\s*,\s*[a-z0-9]+)*)\s*\]/gi;
  const matches = [...text.matchAll(RX)];
  if (matches.length === 0) return text;

  const byId = buildCitationIndex(citations);

  const replacements = await Promise.all(
    matches.map(async (match) => {
      const rawIds = match[1]
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      const icons = rawIds.map((citationId) => {
        const c = byId.get(citationId);
		if (!c || !c.payload) {
		  console.warn(`⚠️ No citation matched "${citationId}"`);
		  return brokenIcon("local", `Citation token not found`, citationId);
		}


        const p = c.payload;

		// INTERNET (Tavily): store payload -> tiny id in DOM; open 🌐 modal by id
		if (p.type === "tavily_search") {
		  const url       = p.link || p.url || "";
		  const title     = p.title || url || "Web result";
		  const snippetMd = p.snippet || p.content || "";

		  if (!url) {
			return brokenIcon("web", "Missing URL for web citation", c.id || "");
		  }

		  // Generate a tiny id and stash the payload (markdown kept as-is)
		  const cid = "wc_" + Math.random().toString(36).slice(2, 10);

		  // (Optional) precompute HTML once to save work later
		  const snippetHtml = (typeof window.convertMarkdownToHtml === "function")
			? window.convertMarkdownToHtml(snippetMd)
			: esc(snippetMd).replace(/\n/g, "<br>");

		  window.webCitationStore[cid] = {
			link: url,
			title,
			snippet: snippetMd,
			snippetHtml,  // modal can prefer this if present
		  };

		  // Return a single-line icon (no CRs in output)
		  return `<span class="citation-icon citation-web" data-cid="${cid}" title="${esc(title)}" onclick="openWebCitationModalById('${cid}')">🌐</span>`;
		}


        // LOCAL doc (🗏) -> keep your existing modal path
        const documentId = p.document_id || p.id;
        const docMeta = window.r2rIndex?.[documentId];
		if (!documentId || !docMeta) {
		  console.warn(`⚠️ Document ID not found in r2rIndex: ${documentId}`);
		  return brokenIcon("local", `Document not found in index`, documentId);
		}
        window.citationData[documentId] = p.summary || "No description available.";
        const title = docMeta.name || "Unknown File";
		//console.log("[citation debug] documentId:", documentId, "p:", p);
        return `<span class="citation-icon citation-local" onclick="openCitationModal('${esc(documentId)}')" title="${esc(title)}&#10;Click for more details.">🗏</span>`;
      });

      const iconHtml = icons.filter(Boolean).join(" ").replace(/\s*\n\s*/g, " ").trim();
      return iconHtml || match[0];
    })
  );

  // replace sequentially
  let updatedText = text;
  matches.forEach((m, i) => { updatedText = updatedText.replace(m[0], replacements[i]); });
  console.log("✅ Final Replaced Text with Citations:", updatedText);
  return updatedText;
}

function brokenIcon(kind, reason, token) {
  const base = kind === "web" ? "🌐" : "🗏"; // default to file for local/unknown
  const tip  = reason + (token ? ` (ref: ${token})` : "");
  // single-line to avoid CRs in output
  return `<span class="citation-icon citation-broken" title="${escapeAttr(tip)}">${base}</span>`;
}

function escapeAttr(s) {
  return String(s ?? "")
    .replace(/[\t\r\n]+/g, " ") // flatten whitespace in attributes
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}



function escapeHtml(s) {
  return String(s ?? "")
    .replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}


function createNewChat(sessionName = null) {
  // If no custom name provided, build standard name with current date/time
  if (!sessionName) {
    const now = new Date();
    const formatted = now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0") + ":" +
      String(now.getSeconds()).padStart(2, "0");
    sessionName = `Chat: ${formatted}`;
  }

  window.currentSessionId = null;

  return fetch(`${window.sciPhiUrl}conversations`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": window.apiKey 
    },
    body: JSON.stringify({ name: sessionName })
  })
    .then(res => res.json())
    .then(data => {
      const id = data?.results?.id;
      if (!id) throw new Error("Failed to create a new session.");

	window.sessionNameMap ||= {};
	window.sessionNameMap[id] = sessionName;
	updateCurrentChatButton(sessionName, id);
      updateCurrentChatButton(sessionName, id);
	  
      addMessageToChat("System", `New session "${sessionName}" created. You can start chatting now.`);
      return id;
    })
    .catch(error => {
      console.error("Error creating new session:", error);
      throw error;
    });
}



let chatToDelete = null;
function deleteChat(sessionId) {
    chatToDelete = sessionId; // Store the chat ID
    document.getElementById("deleteChatModal").style.display = "flex"; // Show the modal
}


function closeDeleteModal() {
    document.getElementById("deleteChatModal").style.display = "none";
}
window.closeDeleteModal = closeDeleteModal;

function confirmDeleteChat() {
    if (!chatToDelete) return;

	fetch(`${window.sciPhiUrl}conversations/${chatToDelete}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": window.apiKey
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to delete chat.");
        }
        return response.json();
    })
    .then(() => {
        showNotification("Chat deleted successfully!", "success");
        closeDeleteModal();
		clearChatWindow();
        loadSessions(); // Refresh session list
    })
    .catch(error => {
        console.error("Error deleting chat:", error);
        showNotification("Error deleting chat. Please try again.", "error");
    });
}
window.confirmDeleteChat = confirmDeleteChat;

	let chatToRename = null;
	function renameChat(sessionId, newName) {
	  console.log("start renaming chat (session ID, New Name)", sessionId, ", ", newName);
	  if (!sessionId) throw new Error("renameChat: sessionId is required");
	  const name = String(newName || "").trim();
	  if (!name) throw new Error("renameChat: newName is required");

	  return fetch(`${window.sciPhiUrl}conversations/${sessionId}`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		  "x-api-key": window.apiKey
		},
		body: JSON.stringify({ name })
	  })
		.then(res => res.json())
		.then(() => {
		  if (window.sessionNameMap) window.sessionNameMap[sessionId] = name;
		  console.log("refreshing button for: ", sessionId, ", ", name);
		  updateCurrentChatButton(name, sessionId);
		  loadSessions();
		  return name;
		})
		.catch(err => { console.error("Rename failed:", err); throw err; });
	}
	window.renameChat = renameChat;

	function startInlineRename(chatButton, sessionId) {
	  const nameSpan = chatButton.querySelector(".chat-name");
	  if (!nameSpan) return;

	  const original = nameSpan.textContent;
	  const input = document.createElement("input");
	  input.type = "text";
	  input.value = original;
	  input.className = "chat-name-edit";
	  nameSpan.replaceWith(input);
	  input.focus();
	  input.select();

	  let saving = false;
	  const cleanup = (newText) => {
		const span = document.createElement("span");
		span.className = "chat-name";
		span.textContent = newText;
		input.replaceWith(span);
	  };

	  const save = async () => {
		if (saving) return;
		saving = true;
		const newName = input.value.trim() || original;

		// Call your existing rename API/function here
		await renameChat(sessionId, newName);

		// Update local map/UI
		if (window.sessionNameMap) window.sessionNameMap[sessionId] = newName;
		updateCurrentChatButton(newName, sessionId);
	  };

	  input.addEventListener("keydown", async (ev) => {
		ev.stopPropagation();
		if (ev.key === "Enter") {
		  await save();
		} else if (ev.key === "Escape") {
		  cleanup(original);
		}
	  });

	  input.addEventListener("blur", async () => {
		await save();
	  });
	}


document.addEventListener("DOMContentLoaded", function () {
	function submitRenameChat() {
		const newName = document.getElementById("newChatName").value.trim();
		if (!newName) {
			showNotification("Chat name cannot be empty.", "error");
			return;
		}

		fetch(`${window.sciPhiUrl}conversations/${chatToRename}`, {

			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": window.apiKey
			},
			body: JSON.stringify({ name: newName })
		})
		.then(response => response.json())
		.then(data => {
			// Check if API returned an error
			if (data.error) {
				throw new Error(data.error);
			}

			// 🟢 SUCCESS: Show success message, close modal, reload sessions
			showNotification("Chat renamed successfully!", "success");
			closeRenameModal();
			loadSessions();
			updateCurrentChatButton(newName, chatToRename);

		})
		.catch(error => {
			console.error("Error renaming chat:", error);
			showNotification("Error renaming chat. Please try again.", "error");
		});
	}
	window.submitRenameChat = submitRenameChat;
  
  document.addEventListener("DOMContentLoaded", () => {
    updateChatContextButton();
  });

});


function toggleMenu(event) {
	event.stopPropagation(); // Prevents immediate closure when clicking

	// Close all other menus before opening the current one
	document.querySelectorAll(".menu-dropdown").forEach(menu => {
		if (menu !== event.target.nextElementSibling) menu.style.display = "none";
	});

	// Toggle current menu
	const menu = event.target.nextElementSibling;
	menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function showNotification(message, type = "info") {
    const notificationBar = document.createElement("div");
    notificationBar.classList.add("notification", type);
    notificationBar.textContent = message;
    document.body.appendChild(notificationBar);

    setTimeout(() => {
        notificationBar.remove();
    }, 3000); // Hide notification after 3 seconds
}

function clearChatWindow() {
    document.getElementById("chatBox").innerHTML = ""; // Clears chat messages
    document.getElementById("messageInput").value = ""; // Clears input field
	resetCurrentChatButton(); //removes decoration on active chat button
	window.currentSessionId = null; //removes the sesison id
    localStorage.removeItem("chatContext"); //deleted the chat context. 
	location.href = location.href; //refresh the page
}
window.clearChatWindow = clearChatWindow;

function resetCurrentChatButton() {
  const chatButton = document.getElementById("chatstat");
  if (!chatButton) return;

  chatButton.innerHTML = `<span id="chatNameLabel" class="chat-name-label" 
    title="Start typing a message below or open a previous chat">
    No Chat Selected
  </span>`;

  chatButton.classList.remove("active-chat");
  chatButton.classList.add("inactive");

  // Clear current chat reference
  window.currentSessionId = null;
  
}
window.resetCurrentChatButton = resetCurrentChatButton;


function onChatStatClick() {
  if (!window.currentSessionId) return;                 // only works when a chat is active
  const status = document.getElementById('chatStatusContainer');
  const sessions = document.getElementById('sessionListContainer');
  sessions.classList.remove('visible');                  // close the other panel
  status.classList.toggle('visible');                    // toggle this one
}
window.onChatStatClick = onChatStatClick;

function onPreviousChatsClick() {
  const status = document.getElementById('chatStatusContainer');
  const sessions = document.getElementById('sessionListContainer');
  status.classList.remove('visible');                    // close the other panel
  const willShow = !sessions.classList.contains('visible');
  sessions.classList.toggle('visible', willShow);        // toggle this one
  if (willShow) loadSessions();                          // only load when opening
}
window.onPreviousChatsClick = onPreviousChatsClick;

function updateCurrentChatButton(sessionName, sessionId) {
  const chatButton = document.getElementById("chatstat");
  if (!chatButton) {
    console.warn("⚠️ No chatstat button found");
    return;
  }

  console.log(`🔄 updateCurrentChatButton() → Setting to active for '${sessionName}' (${sessionId})`);

  chatButton.classList.remove("inactive");
  chatButton.classList.add("active-chat");

  // Assign main click handler
  chatButton.onclick = showChatStatus;

  // Update button HTML
  chatButton.innerHTML = `
    <span class="activeChatName">
      <span 
		class="chat-name">${sessionName}</span>
      <span 
		class="pencil-icon" 
		title="Rename chat"
		data-session-id="${sessionId}"
	  >✏️</span>
    </span>
  `;

  // Attach pencil click separately
  const pencil = chatButton.querySelector(".pencil-icon");
  if (pencil) {
    pencil.onclick = (e) => {
      e.stopPropagation();
	  const id = pencil.dataset.sessionId;
      console.log("✏️ Pencil icon clicked → Rename chat");
    startInlineRename(chatButton, id);
    };
  }

  console.log("Button classes after update:", chatButton.className);
}

// Close menu when clicking outside
document.addEventListener("click", () => {
	document.querySelectorAll(".menu-dropdown").forEach(menu => {
		menu.style.display = "none";
	});
});

document.addEventListener("DOMContentLoaded", function () {
	console.log("✅ DOM is fully loaded");
	// Hide session list on load
	document.getElementById('chatstat').onclick = onChatStatClick;
	document.getElementById('previousChatsBtn').onclick = onPreviousChatsClick;

});

document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");

  // Open specific modals
  const helpButton = document.getElementById("helpButton");

  const helpModal = document.getElementById("helpModal");

  if (helpButton && helpModal) {
    helpButton.addEventListener("click", (e) => {
      e.preventDefault();
      helpModal.style.display = "flex";
    });
  }


  // 🔁 Close logic for all modals
  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".close");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    // Click outside modal to close
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
	document.addEventListener("keydown", function (event) {
	  if (event.key === "Escape" || event.key === "Esc") {
		document.querySelectorAll(".modal").forEach((modal) => {
		  if (modal.style.display === "flex" || modal.style.display === "block") {
			modal.style.display = "none";
		  }
		});
	  }
	});
});


document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Chat Interface Loaded.");

    const storedData = localStorage.getItem("chatContext");
    const toggle = document.getElementById("searchContextToggle");
    const label = document.getElementById("searchContextLabel");
    const linkContainer = document.getElementById("showContextLinkContainer");
    const debugData = document.getElementById("debugData");
    const buttonContainer = document.createElement("div"); // New container for button

    let hasCustomContext = false;
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        hasCustomContext = parsedData.selected_items && parsedData.selected_items.length > 0;
    }

function startInlineRename(chatButton, sessionId) {
  const nameSpan = chatButton.querySelector(".chat-name");
  if (!nameSpan) return;

  const original = nameSpan.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = original;
  input.className = "chat-name-edit";
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  let saving = false;
  const cleanup = (newText) => {
    const span = document.createElement("span");
    span.className = "chat-name";
    span.textContent = newText;
    input.replaceWith(span);
  };

  const save = async () => {
    if (saving) return;
    saving = true;
    const newName = input.value.trim() || original;

    // Call your existing rename API/function here
    await renameChat(sessionId, newName);

    // Update local map/UI
    if (window.sessionNameMap) window.sessionNameMap[sessionId] = newName;
    updateCurrentChatButton(newName, sessionId);
  };

  input.addEventListener("keydown", async (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") {
      await save();
    } else if (ev.key === "Escape") {
      cleanup(original);
    }
  });

  input.addEventListener("blur", async () => {
    await save();
  });
}

});



if (!("webSearchEnabled" in window)) window.webSearchEnabled = false;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("webSearchToggle");
  if (!btn) return;

  const setState = (on) => {
    window.webSearchEnabled = !!on;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.title = on ? "Web search: on" : "Web search: off";
  };

  setState(window.webSearchEnabled);

  // ensure no inline onclick also fires
  btn.onclick = null;

  btn.addEventListener("click", (e) => {
    e.preventDefault();   // avoid form submit
    e.stopPropagation();  // avoid bubbling double-toggles
    const next = btn.getAttribute("aria-pressed") !== "true";
    setState(next);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btnDocx = document.getElementById('exportWord');
  const btnPdf  = document.getElementById('exportPDF');

  if (btnDocx) btnDocx.addEventListener('click', exportConversationToWord);
  if (btnPdf)  btnPdf.addEventListener('click',  exportConversationToPDF);
  
    wireExportButtonsOnce();

});




function isWebSearchOn() {
  return !!window.webSearchEnabled;
}

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

// ===== Export config (tweak colors/fonts as you like) =====
const EXPORT_THEME = {
  headerBg: '#0b5fff',
  headerText: '#ffffff',
  bodyFont: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  supColor: '#444',
  border: '#e5e7eb',
};

// Lazy-load html-docx-js when needed
function ensureHtmlDocxJs() {
  return new Promise((resolve, reject) => {
    if (window.htmlDocx) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load html-docx-js'));
    document.head.appendChild(s);
  });
}

// Get current chat name (fallbacks: DOM -> variable -> default)
function getCurrentChatName() {
  const btn = document.getElementById('chatstat');
  const nameFromDom = btn ? btn.textContent?.trim() : '';
  if (nameFromDom) return nameFromDom.replace(/\s*✎.*$/, ''); // if you show a pencil
  if (window.currentChatName) return String(window.currentChatName);
  return 'Conversation';
}

// Resolve final link for a local doc (SharePoint/Office URI), mirroring your modal logic
function getFinalLinkForLocalDoc(documentId) {
  try {
    if (typeof getSharePointDirectLinkFromIndex === 'function') {
      const sp = getSharePointDirectLinkFromIndex(documentId);
      if (sp) {
        if (typeof getOfficeUriFromSharePointLink === 'function') {
          const office = getOfficeUriFromSharePointLink(sp);
          return office || sp;
        }
        return sp;
      }
    }
  } catch (e) {}
  // Fallback: no resolver available
  return `document://${documentId}`;
}

// Build a citation map and transform the DOM clone by replacing icons with superscripts
function prepareExportFromDom() {
  // 1) Clone the chat container currently rendered
  const box = document.getElementById('chatBox');
  if (!box) throw new Error('#chatBox not found');
  const clone = box.cloneNode(true);

  // 2) Collect citations used in the DOM (icons/buttons that open your modals)
  // We support both web 🌐 and local 🗏 icons by sniffing onclick handlers
  const webNodes   = clone.querySelectorAll('[onclick*="openWebCitationModalById"]');
  const localNodes = clone.querySelectorAll('[onclick*="openCitationModal"]');

  // Maps for dedupe: key -> { number, title, url, type }
  const refMap = new Map();
  let counter = 1;

  // Helper: register a reference and return its number
  function refNumberFor(key, title, url, type) {
    const normKey = (url || key || '').trim();
    if (refMap.has(normKey)) return refMap.get(normKey).number;
    const number = counter++;
    refMap.set(normKey, { number, title: title || url || key, url, type });
    return number;
  }

  // 3) Replace WEB icons with superscripts, pulling final link from window.webCitationStore
  webNodes.forEach(node => {
    // Extract the cid argument from the onclick string
    const onclick = node.getAttribute('onclick') || '';
    const m = onclick.match(/openWebCitationModalById\(['"]([^'"]+)['"]\)/);
    const cid = m ? m[1] : null;
    let num = null;

    if (cid && window.webCitationStore && window.webCitationStore[cid]) {
      const entry = window.webCitationStore[cid];
      const link = entry.link || '';
      const title = entry.title || link || `Web citation ${cid}`;
      const key = link || cid;
      num = refNumberFor(key, title, link, 'web');
    } else {
      // Unknown → still assign a unique number so the text doesn’t lose the marker
      num = refNumberFor(`web:${cid || Math.random()}`, `Web citation`, '', 'web');
    }

    const sup = document.createElement('sup');
    sup.textContent = String(num);
    sup.style.color = EXPORT_THEME.supColor;
    node.replaceWith(sup);
  });


// 4) Replace LOCAL icons with superscripts, using r2rIndex.metadata.onedrive_name
localNodes.forEach(node => {
  const m = (node.getAttribute('onclick') || '').match(/openCitationModal\(['"]([^'"]+)['"]\)/);
  const documentId = m ? m[1] : null;

  // ✅ filename comes from r2rIndex[documentId].metadata.onedrive_name
const entry       = (window.r2rIndex && documentId) ? (window.r2rIndex[documentId] ?? Object.values(window.r2rIndex).find(v => v?.id === documentId || v?.metadata?.onedrive_id === documentId)) : null;
const displayName = entry?.name || entry?.metadata?.onedrive_name || (documentId ? `Document ${documentId}` : 'Document');



  // keep your existing final-link resolver
  const url = documentId ? (getFinalLinkForLocalDoc(documentId) || '') : '';

  // ✅ dedupe locals by their R2R documentId
  const key = documentId || url;

  const num = refNumberFor(key, displayName, url, 'local');

  const sup = document.createElement('sup');
  sup.textContent = String(num);
  sup.style.color = EXPORT_THEME.supColor;
  node.replaceWith(sup);
});






  // 5) Build the References HTML
  const refsSorted = Array.from(refMap.values()).sort((a,b) => a.number - b.number);
  let referencesHtml = '';
  if (refsSorted.length) {
	const items = refsSorted.map(r => {
	  const title = String(r.title || '');
	  const href  = String(r.url || '');
	  return href
		? `<li>[${r.number}] <a href="${escapeAttr(href)}">${escapeHtml(title)}</a></li>`
		: `<li>[${r.number}] ${escapeHtml(title)}</li>`;
		}).join('\n');

		referencesHtml = `
		  <hr style="border:0;border-top:1px solid ${EXPORT_THEME.border};margin:24px 0;">
		  <h2 style="margin:0 0 8px 0;font-size:1.2rem;">References</h2>
		  <ol style="margin:0 0 0 1.1rem;padding:0;line-height:1.4;">${items}</ol>
		`;
  }

  return { clone, referencesHtml };
}

function getR2REntryById(documentId) {
  const idx = window.r2rIndex || null;
  if (!idx || !documentId) return null;

  // Case A: r2rIndex is keyed by the R2R UUID
  if (idx[documentId]) return idx[documentId];

  // Case B: r2rIndex is keyed differently → scan values
  for (const k in idx) {
    const v = idx[k];
    if (!v) continue;
    if (v.id === documentId) return v;                               // match R2R id
    if (v.metadata?.onedrive_id === documentId) return v;            // match OneDrive id (just in case)
  }
  return null;
}

function getOnedriveName(documentId) {
  const entry = getR2REntryById(documentId);
  return entry?.metadata?.onedrive_name || null;
}



// Wrap the export HTML: header + cloned conversation + references
function buildExportHtml(conversationHtml, referencesHtml) {
  const chatName  = escapeHtml(getCurrentChatName());
  const timestamp = new Date().toLocaleString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${chatName}</title>
  <style>
    :root{
      --header-bg: ${EXPORT_THEME.headerBg};
      --header-fg: ${EXPORT_THEME.headerText};
      --border:     ${EXPORT_THEME.border};
    }
    body { font-family: ${EXPORT_THEME.bodyFont}; margin: 28px; }
    .exp-header{
      background: var(--header-bg);
      color: var(--header-fg);
      padding: 16px 18px;
      border-radius: 8px;
      margin-bottom: 18px;
    }
    .exp-header h1{ margin:0 0 4px 0; font-size: 1.15rem; }
    .exp-header .ts{ opacity: .9; font-size: .9rem; }
    .chat-export{ line-height: 1.45; }
    /* Make sure long lines wrap */
    .chat-export, .chat-export * {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    sup { color: ${EXPORT_THEME.supColor}; }
    /* Optional: style roles if your DOM has classes like .assistant/.user */
    .assistant { border-left: 3px solid var(--border); padding-left: 10px; margin: 10px 0; }
    .user { margin: 10px 0; }
    @media print {
      a { color: black; text-decoration: underline; }
      .exp-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="exp-header">
    <h1>${chatName}</h1>
    <div class="ts">${escapeHtml(timestamp)}</div>
  </div>
  <div class="chat-export">
    ${conversationHtml}
    ${referencesHtml || ''}
  </div>
</body>
</html>`;
}

// Export → Word (.docx) using html-docx-js
async function exportConversationToWord() {
  const { clone, referencesHtml } = prepareExportFromDom();
  clone.querySelectorAll('.no-export, .controls, button').forEach(el => el.remove());

  const html = buildExportHtml(clone.innerHTML, referencesHtml);
  await ensureHtmlDocxJs();
  const blob = window.htmlDocx.asBlob(html);

  const name = `${getCurrentChatName().replace(/[\\/:*?"<>|]/g,'_')}.docx`;
  const res = await saveBlobWithPicker(
    blob,
    name,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );

  if (!res.ok && res.via !== 'picker-cancel') {
    alert('Unable to save the .docx. See console for details.');
  }
}

window.exportConversationToWord = exportConversationToWord;


// Export → PDF via OS print dialog (vendor-agnostic)
function exportConversationToPDF() {
  const { clone, referencesHtml } = prepareExportFromDom();
  clone.querySelectorAll('.no-export, .controls, button').forEach(el => el.remove());

  const html = buildExportHtml(clone.innerHTML, referencesHtml);
  const w = window.open('', '_blank');
  if (!w) {
    alert('Pop-up blocked. Please allow pop-ups to export.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  // Give the new window a tick to render, then trigger print
  w.onload = () => w.print();
}
window.exportConversationToPDF = exportConversationToPDF;

function ensureWebModal() {
  let modal = document.getElementById("webPreviewModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "webPreviewModal";
  modal.className = "doc-preview-modal";
  modal.style.display = "none";
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h4 id="webModalTitle">Web Citation</h4>
          <span class="close" onclick="closeWebPreviewModal()">&times;</span>
        </div>
        <hr>
        <div id="webModalContent"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Attach backdrop click-to-close
  const backdrop = modal.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) {
        closeWebPreviewModal();
      }
    });
  }

  return modal;
}


function openWebCitationModal(elOrLink, title, snippet) {
  let link;
  // Support both signatures:
  // 1) openWebCitationModal(this)  ← reads dataset
  // 2) openWebCitationModal(link, title, snippet)
  if (typeof elOrLink === "string") {
    link = elOrLink;
	// inside openWebCitationModal(...)
	} else {
	  link    = elOrLink?.dataset?.link || "";
	  title   = (title   ?? elOrLink?.dataset?.title)   || "Web result";
	  snippet = (snippet ?? elOrLink?.dataset?.snippet) || "";
	}

  if (!link) {
    alert("❌ Missing web citation link");
    return;
  }

  const modal = ensureWebModal();

  // Title: hyperlink (same placement/behavior as your doc modal)
  const titleEl = document.getElementById("webModalTitle");
  titleEl.innerHTML = `<h4 style="margin:0;">
    <a href="${esc(link)}" target="_blank" rel="noopener noreferrer">
      ${esc(title || "Web result")}
    </a>
  </h4>`;

	// Body: render snippet as PLAIN TEXT (no Markdown parsing)
	const contentEl = document.getElementById("webModalContent");
	contentEl.textContent = String(snippet ?? ""); // preserves newlines because it's a <pre>

modal.classList.add("show");
modal.style.removeProperty("display");
}

function closeWebPreviewModal() {
  const modal = document.getElementById("webPreviewModal");
  if (modal) modal.style.display = "none";
}
function openWebCitationModalById(cid) {
  const entry = window.webCitationStore?.[cid];
  if (!entry) {
    console.warn("❌ Missing web citation for id:", cid);
    return;
  }
  
  // Reuse your existing web modal function
  openWebCitationModal(entry.link, entry.title, entry.snippet);
}
window.openWebCitationModalById = openWebCitationModalById;

async function saveBlobWithPicker(blob, suggestedName, mime = 'application/octet-stream') {
  // Try native Save dialog (File System Access API)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: 'File', accept: { [mime]: [suggestedName.replace(/^.*(\.[^.]+)$/, '$1') || ''] } }],
        excludeAcceptAllOption: false
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { ok: true, via: 'picker' };
    } catch (err) {
      // User canceled → do NOT fall back (they explicitly said no)
      if (err && err.name === 'AbortError') {
        console.warn('Save canceled by user.');
        return { ok: false, via: 'picker-cancel' };
      }
      console.warn('Picker failed, falling back to default download…', err);
      // fall through to anchor fallback
    }
  }

  // Fallback: default browser download to the Downloads folder
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true, via: 'download' };
  } catch (error) {
    console.error('Fallback download failed:', error);
    return { ok: false, via: 'download-error', error };
  }
}

function updateChatContextButton() {
  const btn = document.getElementById("chatContext");
  if (!btn) return;

  const stored = localStorage.getItem("chatContext");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const hasIds = parsed.selected_items?.some(item => !!item.r2r_id);
      if (hasIds) {
        btn.classList.add("context-active");   // highlight
        btn.classList.remove("context-inactive");
        return;
      }
    } catch (err) {
      console.error("❌ Invalid chatContext in localStorage:", err);
    }
  }

  // fallback (no context or invalid)
  btn.classList.remove("context-active");
  btn.classList.add("context-inactive");
}
window.updateChatContextButton = updateChatContextButton;


document.addEventListener('click', function (e) {
  const btn = e.target.closest('#exportWord, #exportPDF');
  if (!btn) return;
  e.preventDefault();

  const call = btn.id === 'exportWord'
    ? window.exportConversationToWord
    : window.exportConversationToPDF;

  if (typeof call !== 'function') {
    console.error(`${btn.id} handler is not defined`);
    return;
  }

  // guard against double-clicks
  btn.disabled = true;
  Promise.resolve(call()).finally(() => { btn.disabled = false; });
});




// expose globally like your existing modal functions
window.openWebCitationModal = openWebCitationModal;
window.closeWebPreviewModal = closeWebPreviewModal;



