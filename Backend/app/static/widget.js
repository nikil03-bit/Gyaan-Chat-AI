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
        width: 360px;
        height: 540px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        overflow: hidden;
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
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        gap: 12px;
        flex-shrink: 0;
      }

      .gyaan-widget-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .gyaan-widget-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }

      .gyaan-widget-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .gyaan-widget-avatar-icon {
        width: 18px;
        height: 18px;
        fill: white;
      }

      .gyaan-widget-info {
        flex: 1;
        min-width: 0;
      }

      .gyaan-widget-name {
        font-weight: 700;
        font-size: 0.9375rem;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gyaan-widget-status {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.75);
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }

      .gyaan-widget-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ade80;
        display: inline-block;
      }

      .gyaan-widget-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        flex-shrink: 0;
      }

      .gyaan-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #fafafa;
      }

      .gyaan-widget-message {
        display: flex;
        word-wrap: break-word;
        animation: fadeIn 0.3s ease;
        gap: 8px;
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
        align-items: flex-end;
      }

      .gyaan-widget-message.user {
        justify-content: flex-end;
      }

      .gyaan-widget-message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }

      .gyaan-widget-message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .gyaan-widget-message-avatar-icon {
        width: 14px;
        height: 14px;
        fill: white;
      }

      .gyaan-widget-message-content {
        max-width: 72%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 0.875rem;
        line-height: 1.5;
        word-break: break-word;
      }

      .gyaan-widget-message.bot .gyaan-widget-message-content {
        background: white;
        color: #111827;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      }

      .gyaan-widget-message.user .gyaan-widget-message-content {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(59,130,246,0.4);
      }

      .gyaan-widget-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        width: fit-content;
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
        background: white;
        flex-shrink: 0;
      }

      .gyaan-widget-input {
        flex: 1;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        resize: none;
      }

      .gyaan-widget-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .gyaan-widget-send-btn {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(59,130,246,0.4);
      }

      .gyaan-widget-send-btn:hover:not(:disabled) {
        opacity: 0.9;
      }

      .gyaan-widget-send-btn:disabled {
        opacity: 0.5;
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

      .gyaan-widget-messages::-webkit-scrollbar {
        width: 6px;
      }

      .gyaan-widget-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .gyaan-widget-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .gyaan-widget-messages::-webkit-scrollbar-thumb:hover {
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
        logo_url: null,
      };
    }
  };

  // Initialize widget
  const init = async () => {
    createStyles();

    const botConfig = await fetchBotConfig();
    const messages = [];
    let isWaitingForResponse = false;

    const themeColor = botConfig.theme_color || "#3b82f6";

    // Update theme in styles
    const styleSheet = document.styleSheets[document.styleSheets.length - 1];
    const cssRules = Array.from(styleSheet.cssRules);
    cssRules.forEach(rule => {
      if (rule.style) {
        rule.style.cssText = rule.style.cssText.replace(/#3b82f6/g, themeColor).replace(/#2563eb/g, themeColor);
      }
    });

    // Create widget button
    const btn = document.createElement("button");
    btn.className = "gyaan-widget-btn";
    btn.style.background = themeColor;
    btn.innerHTML = "💬";
    btn.title = "Chat with us!";
    document.body.appendChild(btn);

    // Create widget container
    const container = document.createElement("div");
    container.className = "gyaan-widget-container";
    container.style.display = "none";

    // Helpers
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const logoUrl = botConfig.logo_url
      ? (botConfig.logo_url.startsWith('http') ? botConfig.logo_url : `${apiBase}${botConfig.logo_url}`)
      : null;
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${escapeHtml(botConfig.name)}" />`
      : `<svg class="gyaan-widget-avatar-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

    container.innerHTML = `
      <div class="gyaan-widget-header" style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}cc)">
        <div class="gyaan-widget-header-left">
          <div class="gyaan-widget-avatar">${logoHtml}</div>
          <div class="gyaan-widget-info">
            <div class="gyaan-widget-name">${escapeHtml(botConfig.name)}</div>
            <div class="gyaan-widget-status">
              <span class="gyaan-widget-status-dot"></span>Online
            </div>
          </div>
        </div>
        <button class="gyaan-widget-close">×</button>
      </div>
      <div class="gyaan-widget-messages"></div>
      <div class="gyaan-widget-input-bar">
        <input type="text" class="gyaan-widget-input" placeholder="Type your message..." />
        <button class="gyaan-widget-send-btn" style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}cc)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send
        </button>
      </div>
    `;
    document.body.appendChild(container);

    const messagesDiv = container.querySelector(".gyaan-widget-messages");
    const input = container.querySelector(".gyaan-widget-input");
    const sendBtn = container.querySelector(".gyaan-widget-send-btn");
    const closeBtn = container.querySelector(".gyaan-widget-close");

    const addMessage = (text, sender) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `gyaan-widget-message ${sender}`;

      const avatarHtml = sender === "bot"
        ? `<div class="gyaan-widget-message-avatar">${logoHtml}</div>`
        : "";

      msgDiv.innerHTML = `
        ${avatarHtml}
        <div class="gyaan-widget-message-content">${escapeHtml(text)}</div>
      `;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      messages.push({ text, sender });
    };

    const showTyping = () => {
      const typingDiv = document.createElement("div");
      typingDiv.className = "gyaan-widget-message bot";
      typingDiv.innerHTML = `
        <div class="gyaan-widget-message-avatar">${logoHtml}</div>
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
    btn.addEventListener("click", () => {
      const isOpen = container.style.display !== "none";
      container.style.display = isOpen ? "none" : "flex";
      if (!isOpen && messages.length === 0) {
        addMessage(botConfig.greeting, "bot");
      }
      if (!isOpen) input.focus();
    });

    closeBtn.addEventListener("click", () => {
      container.style.display = "none";
    });

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Show greeting and initial setup
    setTimeout(() => {
      addMessage(botConfig.greeting, "bot");
    }, 300);
  };

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
