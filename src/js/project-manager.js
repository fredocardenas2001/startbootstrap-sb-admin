console.log("project-manager.js loaded");

(function () {
  const openBtn = document.getElementById("newProjectLink");
  const modal = document.getElementById("projectModal");
  const box = modal.querySelector(".modal-box");
  box.addEventListener("click", (e) => e.stopPropagation());
  const closeBtn = document.getElementById("closeProjectModal");
  const backdrop = modal ? modal.querySelector(".modal-backdrop") : null;
  if (box) box.addEventListener("click", (e) => e.stopPropagation());


  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.remove("hidden");
  }

  function closeModal(e) {
    if (e) e.preventDefault();
    modal.classList.add("hidden");
  }

  if (openBtn && modal) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  const cancelBtn = document.getElementById("cancelProjectModal");
  const continueBtn = document.getElementById("continueProjectModal");

  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (continueBtn) continueBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Placeholder: gather selections (optional)
    const checked = modal.querySelectorAll('.modal-body input[type="checkbox"]:checked');
    console.log("Selected count:", checked.length);

    closeModal();
  }); 

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
})();



(function () {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  const box = modal.querySelector(".modal-box");
  if (!box) return;

  // Ensure everything starts collapsed
  modal.querySelectorAll(".tree-node").forEach((node) => {
    node.classList.remove("is-open");
  });

  // Toggle expand/collapse when clicking the arrow
  box.addEventListener("click", (e) => {
    const toggle = e.target.closest(".tree-toggle");
    if (!toggle) return;

    const node = toggle.closest(".tree-node");
    if (!node) return;

    node.classList.toggle("is-open");
  });
})();


