export function createFeedbackBar(sessionId) {
  const container = document.createElement("div");
  container.className = "feedback-bar-container";

  container.innerHTML = `
    <div class="feedback-bar">
      <span class="feedback-label">Got Feedback?</span>
      <button class="thumb-button" data-value="thumbs_up">👍</button>
      <button class="thumb-button" data-value="thumbs_down">👎</button>
      <textarea class="feedback-comment" placeholder="Optional comment..."></textarea>
      <button class="submit-feedback">Submit</button>
    </div>
  `;

  // Handle submission
  container.querySelector(".submit-feedback").addEventListener("click", async () => {
    const rating = container.querySelector(".thumb-button[data-active]")?.dataset?.value || null;
    const comment = container.querySelector(".feedback-comment").value.trim();
    const timestamp = new Date().toISOString();
    const username = (typeof Office !== "undefined" && Office.context?.document?.settings?.get("userName")) || "anonymous";

    const payload = {
      username,
      conversation_id: sessionId || "unknown",
      timestamp,
      rating,
      comment
    };

    const filename = `feedback_${timestamp.replace(/[:.]/g, '-')}.json`;

    try {
      await fetch("https://api.contractsmarts.ai/v1/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ filename, payload })
      });

      container.querySelector(".submit-feedback").textContent = "Thank you!";
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  });

  // Handle thumbs toggle
  container.querySelectorAll(".thumb-button").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".thumb-button").forEach(b => b.removeAttribute("data-active"));
      btn.setAttribute("data-active", "true");
    });
  });

  return container;
}

window.createFeedbackBar = createFeedbackBar;