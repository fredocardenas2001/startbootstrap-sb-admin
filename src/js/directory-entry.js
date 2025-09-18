import DirectoryService from './DirectoryService.js';

document.addEventListener("DOMContentLoaded", () => {
	const container = document.getElementById("directoryMountPoint"); // ✅ Use this consistently
	if (!container) return;

	const dir = new DirectoryService({
		mode: "native",            // or "full", "readonly", "", "excelonly", "native" etc.
		container: container,
		autoFetch: true
	});
	dir.initialize(); 
});
