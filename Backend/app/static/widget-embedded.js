(function() {
  // Widget designed for iframe embedding
  // Configured via window.GyaanChatConfig

  if (!window.GyaanChatConfig) {
    console.error("GyaanChatConfig not found");
    return;
  }

  const config = window.GyaanChatConfig;
  const apiBase = config.apiBase || window.location.origin;
  const widgetKey = config.widgetKey;
  const container = config.container || "body";
  const embedded = config.embedded === true;

  // Generate unique visitor ID
  const getVisitorId = () => {
    let id = localStorage.getItem("gyaan_visitor_id");
    if (!id) {
      id = "visitor_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("gyaan_visitor_id", id);
    }
    return id;
  };

  const visitorId = getVisitorId();

  // Create embedded widget styles
  const createEmbeddedStyles = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        background: white;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      #gyaan-embedded-chat {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: white;
      }

      .gyaan-chat-header {
        background: #3b82f6;
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .gyaan-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #fafafa;
      }

      .gyaan-chat-message {
        display: flex;
        word-wrap: break-word;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .gyaan-chat-message.bot {
        justify-content: flex-start;
      }

      .gyaan-chat-message.user {
        justify-content: flex-end;
      }

      .gyaan-chat-message-content {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }

      .gyaan-chat-message.bot .gyaan-chat-message-content {
        background: white;
        color: #111827;
        border-bottom-left-radius: 4px;
        border: 1px solid #e5e7eb;
      }

      .gyaan-chat-message.user .gyaan-chat-message-content {
        background: #3b82f6;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .gyaan-chat-typing {
        display: flex;
        gap: 4px;
        padding: 10px 14px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        width: fit-content;
        border-bottom-left-radius: 4px;
      }

      .gyaan-chat-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d1d5db;
        animation: typing 1s infinite;
      }

      .gyaan-chat-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .gyaan-chat-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-6px);
        }
      }

      .gyaan-chat-input-bar {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
        background: white;
      }

      .gyaan-chat-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        resize: none;
      }

      .gyaan-chat-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .gyaan-chat-send-btn {
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 16px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: background 0.2s ease;
        white-space: nowrap;
      }

      .gyaan-chat-send-btn:hover {
        background: #2563eb;
      }

      .gyaan-chat-send-btn:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }

      /* Scrollbar styling */
      .gyaan-chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .gyaan-chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .gyaan-chat-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .gyaan-chat-messages::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `;
    document.head.appendChild(styleSheet);
  };

  // Fetch bot config
  const fetchBotConfig = async () => {
    try {
      const response = await fetch(`${apiBase}/bot/widget-config?widget_key=${widgetKey}`);
      if (!response.ok) throw new Error("Failed to fetch bot config");
      return await response.json();
    } catch (error) {
      console.error("Error fetching bot config:", error);
      return {
        name: "GyaanChat Bot",
        greeting: "Hi! How can I help you?",
        theme_color: "#3b82f6",
      };
    }
  };

  // Initialize widget
  const init = async () => {
    createEmbeddedStyles();

    const botConfig = await fetchBotConfig();
    const messages = [];
    let isWaitingForResponse = false;

    // Create chat container
    const chatDiv = document.createElement("div");
    chatDiv.id = "gyaan-embedded-chat";
    chatDiv.innerHTML = `
      <div class="gyaan-chat-header">
        <span>${escapeHtml(botConfig.name)}</span>
      </div>
      <div class="gyaan-chat-messages"></div>
      <div class="gyaan-chat-input-bar">
        <input type="text" class="gyaan-chat-input" placeholder="Ask something..." autocomplete="off" />
        <button class="gyaan-chat-send-btn">Send</button>
      </div>
    `;

    const containerEl = document.querySelector(container) || document.body;
    containerEl.appendChild(chatDiv);

    const messagesDiv = chatDiv.querySelector(".gyaan-chat-messages");
    const input = chatDiv.querySelector(".gyaan-chat-input");
    const sendBtn = chatDiv.querySelector(".gyaan-chat-send-btn");

    // Helpers
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const addMessage = (text, sender) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `gyaan-chat-message ${sender}`;
      msgDiv.innerHTML = `<div class="gyaan-chat-message-content">${escapeHtml(text)}</div>`;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      messages.push({ text, sender });
    };

    const showTyping = () => {
      const typingDiv = document.createElement("div");
      typingDiv.className = "gyaan-chat-message bot";
      typingDiv.innerHTML = `
        <div class="gyaan-chat-typing">
          <div class="gyaan-chat-typing-dot"></div>
          <div class="gyaan-chat-typing-dot"></div>
          <div class="gyaan-chat-typing-dot"></div>
        </div>
      `;
      messagesDiv.appendChild(typingDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      return typingDiv;
    };

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text || isWaitingForResponse) return;

      addMessage(text, "user");
      input.value = "";
      isWaitingForResponse = true;
      sendBtn.disabled = true;

      const typingIndicator = showTyping();

      try {
        const response = await fetch(`${apiBase}/chat/widget`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            widget_key: widgetKey,
            visitor_id: visitorId,
            message: text,
          }),
        });

        if (!response.ok) throw new Error("Chat request failed");
        const data = await response.json();
        typingIndicator.remove();
        addMessage(data.answer, "bot");
      } catch (error) {
        console.error("Error sending message:", error);
        typingIndicator.remove();
        addMessage("Sorry, I couldn't process that. Please try again.", "bot");
      } finally {
        isWaitingForResponse = false;
        sendBtn.disabled = false;
        input.focus();
      }
    };

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Show initial greeting
    addMessage(botConfig.greeting, "bot");
    input.focus();
  };

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
