console.log("project-manager.js loaded");
import DirectoryService from "./DirectoryService.js";

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
    const dirContainer = modal.querySelector("#directory-container");
    dirContainer.innerHTML = ""; // safety for re-open

    new DirectoryService({
      container: dirContainer,
      mode: "foldersonly",
      autoFetch: true
    }).initialize();

  }

  function closeModal(e) {
    if (e) e.preventDefault();
    modal.classList.add("hidden");
  }

  function resetWizard() {
    wizardStep = 1;
    
    const stepDir = modal.querySelector("#wizardStepDirectory");
    const stepTasks = modal.querySelector("#wizardStepTasks");



    stepDir?.classList.remove("hidden");
    stepTasks?.classList.add("hidden");



    if (continueBtn) continueBtn.textContent = "Continue";

    // optional: clear directory UI so it reloads next time
    const dirContainer = modal.querySelector("#directory-container");
    if (dirContainer) dirContainer.innerHTML = "";
  }


  if (openBtn && modal) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", (e) => { resetWizard(); closeModal(e); });


  const cancelBtn = document.getElementById("cancelProjectModal");
  const continueBtn = document.getElementById("continueProjectModal");

  if (cancelBtn) cancelBtn.addEventListener("click", (e) => { resetWizard(); closeModal(e); });

let wizardStep = 1;

    function showResultsDemo() {
    const panel = document.getElementById("resultsPanel");
    if (!panel) return;

    const loading = panel.querySelector(".results-loading");
    const tableWrap = panel.querySelector(".results-table");
    const tbody = panel.querySelector("#resultsTbody");

    panel.classList.remove("hidden");
    tableWrap?.classList.add("hidden");
    loading?.classList.remove("hidden");

    // Fake processing time
    setTimeout(() => {
      // Fill demo rows
      if (tbody) {
        tbody.innerHTML = `
    <tr>
      <td></td>
      <td>Task </td>
      <td>Sub Task</td>
      <td>Related Document Citation</td>
      <td>Owner</td>
      <td>Supervisor</td>
      <td>Task Detail</td>
      <td>Completed</td>
      <td>Began</td>
      <td>Assumed Completion</td>
      <td>Projected Completion</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td>Data Verification</td>
      <td></td>
      <td></td>
      <td></td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td>0%</td>
      <td>1/10/2026</td>
      <td>2/9/2026</td>
      <td class="status-green">2/9/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Operating Agreement Effective Date: 6/1/2017 (amended 10/4/2017)</td>
      <td>🗏, 🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Entity Name: Peanut Bamba II 2017 LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>EIN: 82-1848329</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Parent: Peanut Bamba Portfolio I 2017 LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Parent EIN: 27-0239326 </td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Site Lease; Effective: 2/1/2016 (amended 11/7/2016, 5/7/2020)</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Site Lease Lessee: Peanut Bamba 2017 II, LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green" class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Site Lease Lessor: Stonetown Mall 2020, LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green" class="status-green" class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Site Lease Rent: $6,750/mo (no escalation stated)</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green" class="status-green" class="status-green" class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Site Lease Payment: Completed</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>EPC Asset Owner: Peanut Bamba II 2017 LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green" class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>EPC Entity: C44</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green" class="status-green" class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>EPC Nameplate: 1.587 MWDC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green" class="status-green" class="status-green" class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>EPC Cost: GMP cost-plus-10%</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Irradiance Report Production: 1,930kWh/kWp/yr</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Irradiance Report Nameplate: 1,637 kWp</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>O&amp;M Price: $24,633/yr (2% esc.), $14,600/yr for panel washing, Escalation: rates capped at 2% increase</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>O&amp;M Provider: MG, Inc.</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>O&amp;M Customer: Peanut Bamba 2017 II LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Insurance Quote: $12,000/yr (broker quote)</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Offtaker Agreement Type: SSPA (PPA-type)</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Offtaker Agreement Provider: Peanut Bamba 2017 II, LLC; </td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Offtaker Agreement Buyer: Stonetown Mall 2020, LLC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Termination for Convenience</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>IE Report Production: 3,156,300 kWh/yr</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>IE Report System Size: 1,637 kW DC</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>IE Report Revenue: $0.1628/kWh </td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>IE Report System costs: O&amp;M $24,633/yr, insurance $18,089/yr, lease $45k/yr</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Cost Segregation Report ITC eligible basis: $5,365,975 </td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Loan Agreement: Size $2,165,000, 15-year term, interest at Note Rate (reset at year 6)</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Tax Equity Contribution: $1.202 × 0.99 × ITC amount</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td>Data Retrieval</td>
      <td></td>
      <td></td>
      <td></td>
      <td>David P</td>
      <td>Data Request</td>
      <td>0%</td>
      <td>1/10/2026</td>
      <td>2/9/2026</td>
      <td class="status-green">2/9/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Entity's Parent Financials</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Title Report</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-red">3/25/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>System Impact Study Completion Date Letter</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-red">4/10/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Interconnection Agreement</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Interconnection Requirements Exhibit</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Interconnection Deposit  Proof of Payment</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Offtaker Financials</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Cost Segregation Report: Eligibility Schedule</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Checklist</td>
      <td></td>
      <td>Tax Equity Contribution: Preferred Return Documentation</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Model</td>
      <td>Data Verification</td>
      <td></td>
      <td></td>
      <td></td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td>0%</td>
      <td>1/10/2026</td>
      <td>2/9/2026</td>
      <td class="status-green">2/9/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>Balance of Plant Costs in $/Wp : 2.4586</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>Panel Costs  in $/Wp : 0.5889</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>kWh/kWp in Wh/Wp : 1928</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>PPA Price in $/kWh : 0.1546</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>O&amp;M Fee in $/MW : 17.9</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>Site Control Fees in $/Yr : 45</td>
      <td>🗏</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Data Inputs</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Model</td>
      <td>Data Retrieval</td>
      <td></td>
      <td></td>
      <td></td>
      <td>David P</td>
      <td>Data Request</td>
      <td>0%</td>
      <td>1/10/2026</td>
      <td>2/9/2026</td>
      <td class="status-green">2/9/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>O&amp;M Reserves in $/MW</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>Asset Mgmt. in $/MW </td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>Insurance in $/Yr </td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-green">1/17/2026</td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Model</td>
      <td>Variance Flags</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Model</td>
      <td></td>
      <td>Nameplate Variance: Irradiance Report vs.  IE Report</td>
      <td>📤</td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Data Request</td>
      <td></td>
      <td>1/10/2026</td>
      <td>1/21/2026</td>
      <td class="status-red">2/11/2026</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Externals</td>
      <td>Entity Standing</td>
      <td></td>
      <td></td>
      <td></td>
      <td>David P</td>
      <td>Verify Standing</td>
      <td>0%</td>
      <td>1/10/2026</td>
      <td>2/9/2026</td>
      <td class="status-green">2/9/2026</td>
    </tr>
    <tr>
      <td>Externals</td>
      <td></td>
      <td>Peanut Bamba II 2017 LLC</td>
      <td></td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Standing</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Externals</td>
      <td></td>
      <td>Peanut Bamba Portfolio I 2017 LLC</td>
      <td></td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Standing</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Externals</td>
      <td></td>
      <td>Stonetown Mall 2020, LLC</td>
      <td></td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Standing</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Externals</td>
      <td></td>
      <td>MG, Inc.</td>
      <td></td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Verify Standing</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Others</td>
      <td>Comparative Analysis</td>
      <td></td>
      <td></td>
      <td></td>
      <td>David P</td>
      <td>Comparison</td>
      <td>0%</td>
      <td>1/10/2026</td>
      <td>2/9/2026</td>
      <td class="status-green">2/9/2026</td>
    </tr>
    <tr>
      <td>Others</td>
      <td></td>
      <td>Pricing Curve</td>
      <td></td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Comparison Analysis</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
    <tr>
      <td>Others</td>
      <td></td>
      <td>Build Costs</td>
      <td></td>
      <td>Jame D</td>
      <td>David P</td>
      <td>Comparison Analysis</td>
      <td></td>
      <td>1/10/2026</td>
      <td>2/1/2026</td>
      <td class="status-green">2/1/2026</td>
    </tr>
        `;
      }

      loading?.classList.add("hidden");
      tableWrap?.classList.remove("hidden");
    }, 1500); // change this to whatever you want
  }


if (continueBtn) {
  continueBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const stepDir = modal.querySelector("#wizardStepDirectory");
    const stepTasks = modal.querySelector("#wizardStepTasks");

    if (!stepDir || !stepTasks) {
      console.warn("Wizard containers not found", { stepDir, stepTasks });
      return;
    }

    if (wizardStep === 1) {
      // Step 1 → Step 2
      stepDir.classList.add("hidden");
      stepTasks.classList.remove("hidden");
      wizardStep = 2;

      // Optional: change button label so it's clear
      continueBtn.textContent = "Finish";
      return;
    }

    // Step 2: demo
    resetWizard();
    closeModal();
    showResultsDemo();

  });
}


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


