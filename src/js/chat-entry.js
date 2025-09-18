import { createFeedbackBar } from '../js/feedbackbar.js';
import DirectoryService from '../js/DirectoryService.js';
import { initChatListeners } from '../js/chat.js';

document.addEventListener("DOMContentLoaded", () => {
  if (window.showdown) {
    const converter = new window.showdown.Converter();
    console.log(converter.makeHtml("# Hello from Showdown"));
  }

  // ✅ hand control to your existing chat logic
  initChatListeners(DirectoryService);
});
