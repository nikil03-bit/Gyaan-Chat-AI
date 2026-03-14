(function() {
  // Ensure config is set
  if (!window.GyaanChatConfig) {
    console.error("GyaanChatConfig not found. Make sure to set window.GyaanChatConfig before loading widget.js");
    return;
  }

  const config = window.GyaanChatConfig;
  const apiBase = config.apiBase || "http://localhost:8000";
  const widgetKey = config.widgetKey;

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

  // Create widget styles
  const createStyles = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .gyaan-widget-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        z-index: 9999;
        transition: all 0.2s ease;
      }

      .gyaan-widget-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
      }

      .gyaan-widget-btn:active {
        transform: scale(0.95);
      }

      .gyaan-widget-container {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 400px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .gyaan-widget-header {
        background: #3b82f6;
        color: white;
        padding: 16px 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
      }

      .gyaan-widget-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
      }

      .gyaan-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .gyaan-widget-message {
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

      .gyaan-widget-message.bot {
        justify-content: flex-start;
      }

      .gyaan-widget-message.user {
        justify-content: flex-end;
      }

      .gyaan-widget-message-content {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
      }

      .gyaan-widget-message.bot .gyaan-widget-message-content {
        background: #f3f4f6;
        color: #111827;
        border-bottom-left-radius: 4px;
      }

      .gyaan-widget-message.user .gyaan-widget-message-content {
        background: #3b82f6;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .gyaan-widget-typing {
        display: flex;
        gap: 4px;
        padding: 10px 14px;
      }

      .gyaan-widget-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d1d5db;
        animation: typing 1s infinite;
      }

      .gyaan-widget-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .gyaan-widget-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-8px);
        }
      }

      .gyaan-widget-input-bar {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }

      .gyaan-widget-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
      }

      .gyaan-widget-input:focus {
        border-color: #3b82f6;
        background: white;
      }

      .gyaan-widget-send-btn {
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: background 0.2s ease;
      }

      .gyaan-widget-send-btn:hover {
        background: #2563eb;
      }

      .gyaan-widget-send-btn:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .gyaan-widget-container {
          width: calc(100% - 32px);
          height: 70vh;
          bottom: 80px;
          right: 16px;
        }
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
    createStyles();

    const botConfig = await fetchBotConfig();
    const messages = [];
    let isWaitingForResponse = false;

    // Create widget button
    const btn = document.createElement("button");
    btn.className = "gyaan-widget-btn";
    btn.innerHTML = "💬";
    btn.title = "Chat with us!";
    document.body.appendChild(btn);

    // Create widget container (hidden initially)
    const container = document.createElement("div");
    container.className = "gyaan-widget-container";
    container.style.display = "none";
    container.innerHTML = `
      <div class="gyaan-widget-header">
        <span>${botConfig.name}</span>
        <button class="gyaan-widget-close">×</button>
      </div>
      <div class="gyaan-widget-messages"></div>
      <div class="gyaan-widget-input-bar">
        <input type="text" class="gyaan-widget-input" placeholder="Ask something..." />
        <button class="gyaan-widget-send-btn">Send</button>
      </div>
    `;
    document.body.appendChild(container);

    const messagesDiv = container.querySelector(".gyaan-widget-messages");
    const input = container.querySelector(".gyaan-widget-input");
    const sendBtn = container.querySelector(".gyaan-widget-send-btn");
    const closeBtn = container.querySelector(".gyaan-widget-close");

    // Add initial greeting
    const addMessage = (text, sender) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `gyaan-widget-message ${sender}`;
      msgDiv.innerHTML = `<div class="gyaan-widget-message-content">${escapeHtml(text)}</div>`;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      messages.push({ text, sender });
    };

    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const showTyping = () => {
      const typingDiv = document.createElement("div");
      typingDiv.className = "gyaan-widget-message bot";
      typingDiv.innerHTML = `
        <div class="gyaan-widget-typing">
          <div class="gyaan-widget-typing-dot"></div>
          <div class="gyaan-widget-typing-dot"></div>
          <div class="gyaan-widget-typing-dot"></div>
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
      }
    };

    // Event listeners
    btn.addEventListener("click", () => {
      const isOpen = container.style.display !== "none";
      container.style.display = isOpen ? "none" : "flex";
      if (!isOpen && messages.length === 0) {
        addMessage(botConfig.greeting, "bot");
      }
    });

    closeBtn.addEventListener("click", () => {
      container.style.display = "none";
    });

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    // Show greeting on first load
    addMessage(botConfig.greeting, "bot");
  };

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
