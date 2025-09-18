import React from "react";
import { createRoot } from "react-dom/client";
import "./checklist.css";

const EditableCell = ({ initialValue }) => {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);

  const handleBlur = () => setEditing(false);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") setEditing(false);
  };

  return (
    <div className="editable-cell">
      {editing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span onClick={() => setEditing(true)}>
          {value}
          <span
            className="edit-icon"
            style={{
              marginLeft: "6px",
              opacity: 0.3,
              cursor: "pointer",
            }}
          >
            ✏️
          </span>
        </span>
      )}
    </div>
  );
};

function OptionsMenu() {
  const options = [
    "Use a Template",
    "Manually Create",
    "Upload Existing Checklist",
    "Generate Automatically",
  ];

  return (
    <div className="menu-container">
      <div className="menu-title">Choose Your Closing Checklist Source</div>
      <ul className="menu-list">
        {options.map((text, i) => (
          <li key={i} className="menu-item">
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}


function HeaderBar() {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <>
      <div className="header-bar">
        <div className="header-left">Checklist Dashboard</div>
        <div className="header-right">
          <span
            className={`tooltip-wrapper ${showHelp ? "clicked" : ""}`}
            data-tooltip="Click for help"
            onClick={() => setShowHelp(!showHelp)}
          >
            ❓
          </span>
        </div>
      </div>

      {showHelp && (
        <div className="help-popup">
          <div className="help-popup-header">
            Help &amp; Tips
            <button className="close-button" onClick={() => setShowHelp(false)}>✕</button>
          </div>
          <div>
            <p>Click on a project to expand its checklist.</p>
            <p>Click the ✏️ icon to edit a field temporarily.</p>
            <p>Status icons like ✅ ⏳ ⌛ are explained inline.</p>
          </div>
        </div>
      )}
    </>
  );
}

const ChecklistCardContent = () => {
  return (
    <div>
      <div className="checklist-content">
<table className="checklist-table" width="99%">
 <thead>
  <tr>
   <th width="88">
    {<EditableCell initialValue="" />}
   </th>
   <th width="320">
    {<EditableCell initialValue="Document or Action Item" />}
   </th>
   <th width="105">
    {<EditableCell initialValue="Section" />}
   </th>
   <th width="111">
    {<EditableCell initialValue="Responsible Party" />}
   </th>
   <th width="118">
    {<EditableCell initialValue="Signatories" />}
   </th>
   <th width="155">
    {<EditableCell initialValue="Status/Comments" />}
   </th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td colSpan="6" width="896">
    {<EditableCell initialValue="A.Master Purchase Agreement" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td colSpan="5" width="809">
    {<EditableCell initialValue="Project Presentation and Purchaser Review" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="1." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project Presentation Certificate[1]" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 2.2(a)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="1.1" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Annex A: Description of Project" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="1.2" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Annex B: Expected Terms for the Proposed Project" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project Report" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2.1" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Annex A: IE Report" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2.2" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Annex B: Appraisal" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2.3" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Annex C: Vendor warranties" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2.4" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Annex D: Customer Agreements" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="3." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Outstanding Diligence Related Items" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="EPC Assignment and Amendment" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form (GAF to confirm sign-off on Contract Price of $3,879,370.39)." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lender Consent to EPC Assignment and Amendment" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form. To be dated and fully executed." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="O&M Agreement" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="ENTITY to provide executed copy." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="First Amendment to O&M Agreement" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lender Consent to O&M Agreement" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form. To be dated and fully executed." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Distribution Agreement" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="☒ PDA☐ ENTITY☐ Blue Sky Portfolio III 2017, LLC" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Org. Docs: Please provide copies of the current organizational documents for the Project Company. The LLCA provided shows ENTITY as the member." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 00)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="SSPAs: Please confirm the dates of the SSPAs and that all have been executed by the counterparties." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Completed (Folder 06)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="SSPAs: Please provide the assignment of the SSPAs to the Project Company." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 06)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="SSPAs: Please provide the complete Oxnard BP SSPA identifying the meter location and notice address of the Applicant." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 06)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Interconnection: Please provide fully executed copies of the interconnection agreements with the generating facility and customer account information complete." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="These can only be provided at COD" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Interconnection: Please provide the interconnection agreement applications." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 05)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Interconnection: The allocation chart lists 6 accounts (without matching them to the applicant name), but there are 8 SSPAs. Please provide an updated allocation chart that identifies the customer names and please provide evidence of the terminated SSPAs." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 06) – Please provide an updated allocation chart showing the allocations of each of the 14 entities with which SSPAs have been provided." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="EPC: Please provide a copy of the NTP." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Complete." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="EPC: Please confirm that no Liquidated Damages have been or will be assessed because the Scheduled Completion Date is being extended pursuant to the amendment." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Confirmed" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="EPC: Please provide evidence that the notice party and information for the Owner has been updated to include G-I as a copy-notice party or address in an estoppel." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Complete." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="O&M: Please provide a fully executed copy of the August 23, 2018 O&M Agreement referenced in the Loan Agreement." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 03) – Please note that the O&M Contractor signature is missing on page 8.  Please provide." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lease: Please provide evidence that the Commercial Operation Date deadline has been extended." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Please allow for post closing deliverableGAF has confirmed it is acceptable to deliver  post closing" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lease: Please provide a copy of the assignment by California Property Owner I, LLC to DRA FUND IX LLC." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Notice provided. I don’t believe that landlord has any obligation to provide the actual assignment.  – Please request a copy of the assignment agreement to confirm that the assignment occurred as contemplated by the notice of assignment. Additionally, as a condition to assignment, Landlord’s assignee (i.e., DRA FUND IX LLC) is required to agree in writing with the Tenant to assume all of the prior Landlord’s obligations (See Section IX(B) of the Lease).  This assumption language should be in the assignment agreement between the prior Landlord and the current Landlord." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lease: Please provide a copy of the Consent to Assignment and Assumption referenced in the Tenant Estoppel." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Loan: Please confirm the amount currently disbursed under the Loan Agreement." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="1,640,000" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Loan: Please confirm that the Loan Fees were paid in full." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Confirmed" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Loan:Please provide Complete Pledge Agreement (including Exhibit A), Complete Estoppel (including Exhibits A and B)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 09)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Loan: Exhibit B lists an SSPA with GNC, which has not been provide. Please provide a copy of this SSPA" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Provided (Folder 06)" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td colSpan="5" width="809">
    {<EditableCell initialValue="Conditions to Purchase Date/Initial Project Payment" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="4." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Transaction Documents (to the extent not previously delivered)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(iv)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="N/A" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="5." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project Documents for subject Project (to the extent not previously delivered)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 4.1(a)(iv), (viii), (xx), (xxxii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="See diligence requests above." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="6." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Closing Request[2]·       Seller reps and warranties true and correct and each CP satisfied·       No Tax Law Change (or otherwise reflected in Project Model)·       Consents/waivers/approvals obtained·       Project documents in full force and effect·       No default·       No MAE·       Not used for swimming pools·       Investor Member has not made Capital Contributions in excess of $1,000,000 for Purchased Projects that have not achieved Substantial Completion·       No PTO, Final Completion, etc." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 4.1(a)(i), (x), (xiii), (xiv), (xvi), (xvii), (xviii), (xxiv), (xxv)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="7." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project is listed on Schedule 1 or approved by Investor Member" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(ii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="8." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Estoppel certificates from offtakers" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(iii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Not required." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="9." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project Company Secretary’s Certificate" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(v)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Project Company" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="10." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Seller Secretary’s Certificate" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(v)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="11." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project Model" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(ix)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="G-I/ENTITY" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Posted to datasite (Projects Brixmor Esplanade Plaza (Aug 22, 2019)). Complete." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="12." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Purchase and Sale Confirmation Notice[3]" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 2.3(b)(i), 4.1(a)(vi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="13." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Assignment and Assumption Agreement[4]" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 2.3(b)(ii), 4.1(a)(vii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller/Purchaser" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller¨Purchaser" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="14." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Applicable Appraisal" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Posted to datasite. Under Milbank review." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="15." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Permits (other than PTO and other post-Purchase Date Permits)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Posted to datasite. GAF to confirm sign off." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="16." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Interim Completion Certificate" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xv)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨IE" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="17." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Section 1445 Affidavit" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xix)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="18." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Consultant Reports" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="18.1" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Environmental Site Assessment and reliance letter[5]" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller/Env consultant" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Env Consultant" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="N/A" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="18.2" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Independent Engineer’s Report and reliance letter" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller/IE" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨IE" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="18.3" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Insurance Report (if requested) and certificates of insurance (evidencing Required Insurance)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxvii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller/Ins consultant" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Ins Consultant" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Not requested." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="19." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Other information reasonably requested" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxiii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="20." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Warranties inure to benefit of Project Company" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxvi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Posted to datasite." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="21." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Qualification to participate in state SREC Program (if applicable)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxviii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="22." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Purchase Date prior to the expiration of Commitment Period" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxix)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="23." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Recent lien search/no liens other than Permitted Liens" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxx)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Complete." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="24." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Funds Flow" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxxi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨G-I¨ENTITY¨Seller¨Company" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="25." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Forbearance Agreement" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxxii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="☒  Lender¨Project Company¨G-I" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form, subject to confirmation of project size." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="26." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lender Consent" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxxiii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Lender¨Project Company¨ENTITY Portfolio III 2017¨ENTITY¨Company" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="27." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Palm Drive Side Consent" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(a)(xxxiv)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="☒ PDA" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Executed. UCC-3 in agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="28." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Updated MPA Schedule 2 reflecting all Purchased Projects and Cancelled Projects" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 2.3(b)(iii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td colSpan="5" width="809">
    {<EditableCell initialValue="Conditions Precedent to Subsequent Payment Date" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="1." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Transaction Documents and Project Documents (to the extent not previously delivered)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(ii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Lease: Please provide evidence that the Commercial Operation Date deadline has been extended." />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Fully executed and populated Interconnection Agreements" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Closing Request[6]·       Seller reps and warranties true and correct and each CP satisfied·       No default·       No MAE" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 4.1(b)(i), (ix), (x)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="3." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Placed-in-Service Certificate" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(iii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Seller" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="4." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Payment of amounts due under Project Documents" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(iv)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="5." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Project Model, updated Base Case Model, True-Up Report[7], Cancelled Project Report[8]and Change Order Report[9]" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 3.4, 3.5, 3.6, 4.1(b)(v)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="6." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Final unconditional waiver and release by the Contractor[10]" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(vi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨[Contractors]" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="7." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Evidence warranties inure to benefit of Project Company" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(vii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="8." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Funds Flow Memo" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(viii)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="9." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Appraisal Bring-down" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.1(b)(xi)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td colSpan="6" width="896">
    {<EditableCell initialValue="B.LLC Agreement" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td colSpan="5" width="809">
    {<EditableCell initialValue="Class A Member Purchase Date Capital Contribution Conditions Precedent" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="1." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Capital Contribution Request[11]·       Class B Member and Affiliate reps and warranties true and correct·       Attaching Closing Request, Project Presentation Certificate·       No Insolvency Event·       Consents/waivers/approvals obtained·       Guaranty in full force/effect·       No proceedings by Govt Authority·       No termination of rights under Transaction Documents·       No MAE" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 4.06(a), (b), (c), (f), (h), (i), (j), (m), (p)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Managing Member" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="Agreed form." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="2." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Transaction Documents (to the extent not previously delivered)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(g)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="N/A" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="3." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Base Case Model" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(d)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="GAF 11/12/19" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="4." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Evidence that Class B Member has made its required Capital Contribution" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(e)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="To be included in Funds Flow." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="5." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Satisfaction of CPs to Initial Project Payment under § 4.1(a) of the MPA" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(k)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Seller" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="See A above." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="6." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Updated list of insurance policies (Ex. C)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(l)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="7." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Palm Drive Side Letter" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(n)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="See A(27) above." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="8." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Form 556 for each Project (if QF status is applicable)" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.06(o)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="ENTITY/Garrett to confirm whether Form 556 is necessary, and if so, that it will be timely filed." />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="" />}
   </td>
   <td colSpan="5" width="809">
    {<EditableCell initialValue="Class A Member Subsequent Capital Contribution Conditions Precedent" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="9." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Capital Contribution Request[12]·       Class B Member and Affiliate reps and warranties true and correct·       Attaching Closing Request, Placed-in-Service Certificate, Change Order Report, Cancelled Project Report·       No MAC in law unless Tax Law Change is reflected in True-Up Model·       No MAE·       No Insolvency Event·       No termination of rights under Transaction Documents" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§§ 4.07(b), (c), (e), (g), (h)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="¨Managing Member" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="10." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Satisfaction of CPs to Subsequent Project Payment under § 4.1(b) of the MPA" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.07(a)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="11." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="Evidence that Class B Member has made its required Capital Contribution" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.07(d)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td width="88">
    {<EditableCell initialValue="12." />}
   </td>
   <td width="320">
    {<EditableCell initialValue="True-Up Base Case Model" />}
   </td>
   <td width="105">
    {<EditableCell initialValue="§ 4.07(f)" />}
   </td>
   <td width="111">
    {<EditableCell initialValue="Class B Member" />}
   </td>
   <td width="118">
    {<EditableCell initialValue="" />}
   </td>
   <td width="155">
    {<EditableCell initialValue="" />}
   </td>
  </tr>
  <tr>
   <td colSpan="10">
    {<EditableCell initialValue="[1]To be delivered during the Commitment Period in the form of Exhibit A to the MPA; delivery of a complete Project Presentation Certificate with all attachments begins Purchaser’s/Investor’s 10 Business Day “Due Diligence Period”[2]In the form of Exhibit B to the MPA[3]In the form of Exhibit C to the MPA[4]In the form of Exhibit I to the MPA[5]For any ground mounted Projects[6]In the form of Exhibit B to the MPA[7]True-Up Report (in the form of Exhibit F to the MPA) to be delivered at least 5 Business Days prior to any Subsequent Project Payment Date[8]In the form of Exhibit D to the MPA[9]In the form of Exhibit E to the MPA[10]In the form of Exhibit G to the MPA, or form prescribed by statute.[11]To be delivered at least 10 Business Days before Purchase Date.[12]To be delivered at least 5 Business Days before the Subsequent Project Payment Date." />}
   </td>
  </tr>
 </tbody>
</table>
      </div>
    </div>
  );
};

function ProjectCard({ name, type, statusIcons, index, isOpen, onToggle, bgColor, textColor, headerText, completion }) {
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  return (
    <div className={`project-card ${isOpen ? "expanded" : ""}`} style={{ backgroundColor: bgColor, color: textColor }}>
<div className="project-title" onClick={onToggle}>
  <span className="project-status-icons">
    {statusIcons.map((status, i) => (
      <span
        key={i}
        className="tooltip-wrapper status-icon"
        data-tooltip={status.tooltip}
      >
        {status.icon}
      </span>
    ))}
  </span>
  <span className="project-name">{name}</span>

  <span className="project-progress">
    <div className="progress-thermometer">
      <div
        className="progress-fill"
        style={{ width: `${completion || 0}%` }}
      />
    </div>
    <span className="progress-text">{completion || 0}%</span>
  </span>

        {isOpen && (
          <>
            <div className="project-action-menu desktop-only">
              <div className="action-wrapper">
                  <span
                    title="Share"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareMenu(!showShareMenu);
                    }}
                  >
                    📤
                  </span>

                  {showShareMenu && (
                    <div className="share-submenu">
                      <div>📧 Email</div>
                      <div>💬 Slack</div>
                      <div>🟣 Teams</div>
                    </div>
                  )}
                </div>
              <span title="Print">🖨️</span>
              <span title="Save a Copy">💾</span>
              <span title="Mark as Completed">💰</span>
              <span title="Archive">🗃️</span>




            </div>

            <div className="action-wrapper mobile-only">
              <div
                className="mobile-menu-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileMenu(!showMobileMenu);
                }}
              >
                ☰
              </div>

  {showMobileMenu && (
    <div className="mobile-menu-popup"
    onClick={(e) => e.stopPropagation()}
    >
      <div>📤 Share</div>
      <div>🖨️ Print</div>
      <div>💾 Save Locally</div>
      <div>✅ Mark as Completed</div>
      <div>🗃️ Archive</div>
    </div>
  )}
</div>
</>
        )}
      </div>

      {isOpen && (
        type === "checklist"
          ? <ChecklistCardContent headerText={headerText} />
          : <OptionsMenu />
      )}
    </div>
  );
}


const projects = [
  {
    name: "Hanford Mall Project",
    type: "checklist",
    completion: 85,
    statusIcons: [
      { icon: "✅", tooltip: "In Progress" }
    ],
    bgColor: "#ccffcc",
    textColor: "black"
  },
  {
    name: "Penny Lane Project",
    type: "checklist",
    completion: 67,
    statusIcons: [
      { icon: "✅", tooltip: "In Progress" }
    ],
    bgColor: "#ccffcc",     // background color
    textColor: "black"    // text color
  },
  {
    name: "Pleasant Valley Project",
    type: "checklist",
    completion: 34,
    statusIcons: [
      { icon: "✅", tooltip: "In Progress" }
    ],
    bgColor: "#ccffcc",     // background color
    textColor: "black"    // text color
  },
  {
    name: "Panama Project",
    type: "checklist",
    completion: 67,
    statusIcons: [
      { icon: "✅", tooltip: "In Progress" }
    ],
    bgColor: "#ccffcc",     // background color
    textColor: "black"    // text color
  },
  {
    name: "Winery Project",
    type: "checklist",
    completion: 45,
    statusIcons: [
      { icon: "⚠️", tooltip: "Overdue Items" },
      { icon: "✅", tooltip: "In Progress" }
    ],
    bgColor: "#ffffcc",
    textColor: "black"
  },
  {
    name: "Mos Eisly Downtown",
    type: "menu",
    completion: 0,
    statusIcons: [
      { icon: "❗", tooltip: "No Checklist Configured" }
    ],
    bgColor: "#ffb3b3",
    textColor: "black"
  }
];

function App() {
  const [openCardIndex, setOpenCardIndex] = React.useState(null);

  return (
    <div className="main-wrapper">
      <HeaderBar />
      <div className="checklist-container">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.name}
            name={project.name}
            type={project.type}
            completion={project.completion}
            statusIcons={project.statusIcons}
            bgColor={project.bgColor}
            textColor={project.textColor}
            headerText={project.headerText}
            index={index}
            isOpen={openCardIndex === index}
            onToggle={() =>
              setOpenCardIndex(openCardIndex === index ? null : index)
            }
          />
        ))}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
