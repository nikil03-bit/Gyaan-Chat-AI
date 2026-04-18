(function() {
  // Widget designed for iframe embedding
  // Configured via window.GyaanChatConfig

  if (!window.GyaanChatConfig) {
    console.error("GyaanChatConfig not found");
    return;
  }

  const config = window.GyaanChatConfig;
  const scriptEl = document.currentScript || document.querySelector('script[src*="/widget-embedded.js"]');
  const scriptBase = scriptEl?.src ? new URL(scriptEl.src, window.location.href).origin : window.location.origin;
  const apiBase = config.apiBase || scriptBase;
  const widgetKey = config.widgetKey;
  const container = config.container || "body";

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

  const parseChatResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream")) {
      const raw = await response.text();
      let answer = "";

      for (const line of raw.split(/\r?\n/)) {
        if (!line.startsWith("data: ")) continue;
        const payloadText = line.slice(6).trim();
        if (!payloadText) continue;
        try {
          const payload = JSON.parse(payloadText);
          if (payload.type === "content" && typeof payload.content === "string") {
            answer += payload.content;
          }
        } catch (_) {
          // Ignore malformed stream chunks and continue parsing.
        }
      }

      return { answer: answer || "Sorry, I couldn't process that. Please try again." };
    }

    return await response.json();
  };

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
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .gyaan-chat-header-avatar {
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

      .gyaan-chat-header-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .gyaan-chat-header-avatar-icon {
        width: 18px;
        height: 18px;
        fill: white;
      }

      .gyaan-chat-header-info {
        flex: 1;
        min-width: 0;
      }

      .gyaan-chat-header-name {
        font-weight: 700;
        font-size: 0.9375rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gyaan-chat-header-status {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.75);
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }

      .gyaan-chat-header-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4ade80;
        display: inline-block;
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
        gap: 8px;
        align-items: flex-end;
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

      .gyaan-chat-message-avatar {
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

      .gyaan-chat-message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .gyaan-chat-message-avatar-icon {
        width: 14px;
        height: 14px;
        fill: white;
      }

      .gyaan-chat-message-content {
        max-width: 72%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 0.875rem;
        line-height: 1.5;
        word-break: break-word;
      }

      .gyaan-chat-message-content p {
        margin: 0;
      }

      .gyaan-chat-message-content p + p {
        margin-top: 10px;
      }

      .gyaan-chat-message-content ul,
      .gyaan-chat-message-content ol {
        margin: 8px 0 0;
        padding-left: 20px;
      }

      .gyaan-chat-message-content li + li {
        margin-top: 4px;
      }

      .gyaan-chat-message.bot .gyaan-chat-message-content {
        background: white;
        color: #111827;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      }

      .gyaan-chat-message.user .gyaan-chat-message-content {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border-bottom-right-radius: 4px;
        box-shadow: 0 2px 8px rgba(59,130,246,0.4);
      }

      .gyaan-chat-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        width: fit-content;
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
        flex-shrink: 0;
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
        white-space: nowrap;
      }

      .gyaan-chat-send-btn:hover:not(:disabled) {
        opacity: 0.9;
      }

      .gyaan-chat-send-btn:disabled {
        opacity: 0.5;
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
        logo_url: null,
      };
    }
  };

  // Initialize widget
  const init = async () => {
    createEmbeddedStyles();

    const botConfig = await fetchBotConfig();
    const messages = [];
    let isWaitingForResponse = false;

    const themeColor = botConfig.theme_color || "#3b82f6";

    // Helpers
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    const renderInlineMarkdown = (text) => {
      const escaped = escapeHtml(text);
      const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return withBold.replace(/\*(.+?)\*/g, "<em>$1</em>");
    };

    const renderMarkdown = (text) => {
      const normalized = (text || "").replace(/\r\n/g, "\n");
      const lines = normalized.split("\n");
      const html = [];
      let paragraphLines = [];
      let inUl = false;
      let inOl = false;

      const flushParagraph = () => {
        if (!paragraphLines.length) return;
        const content = paragraphLines.map(renderInlineMarkdown).join("<br>");
        html.push(`<p>${content}</p>`);
        paragraphLines = [];
      };

      const closeLists = () => {
        if (inUl) {
          html.push("</ul>");
          inUl = false;
        }
        if (inOl) {
          html.push("</ol>");
          inOl = false;
        }
      };

      for (const line of lines) {
        const trimmed = line.trim();
        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);

        if (!trimmed) {
          flushParagraph();
          closeLists();
          continue;
        }

        if (orderedMatch) {
          flushParagraph();
          if (inUl) {
            html.push("</ul>");
            inUl = false;
          }
          if (!inOl) {
            html.push("<ol>");
            inOl = true;
          }
          html.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`);
          continue;
        }

        if (unorderedMatch) {
          flushParagraph();
          if (inOl) {
            html.push("</ol>");
            inOl = false;
          }
          if (!inUl) {
            html.push("<ul>");
            inUl = true;
          }
          html.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`);
          continue;
        }

        closeLists();
        paragraphLines.push(line);
      }

      flushParagraph();
      closeLists();
      return html.join("");
    };

    // Create chat container
    const chatDiv = document.createElement("div");
    chatDiv.id = "gyaan-embedded-chat";

    const logoUrl = botConfig.logo_url
      ? (botConfig.logo_url.startsWith('http') ? botConfig.logo_url : `${apiBase}${botConfig.logo_url}`)
      : null;
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${escapeHtml(botConfig.name)}" />`
      : `<svg class="gyaan-chat-header-avatar-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

    chatDiv.innerHTML = `
      <div class="gyaan-chat-header" style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}cc)">
        <div class="gyaan-chat-header-avatar">${logoHtml}</div>
        <div class="gyaan-chat-header-info">
          <div class="gyaan-chat-header-name">${escapeHtml(botConfig.name)}</div>
          <div class="gyaan-chat-header-status">
            <span class="gyaan-chat-header-status-dot"></span>Online
          </div>
        </div>
      </div>
      <div class="gyaan-chat-messages"></div>
      <div class="gyaan-chat-input-bar">
        <input type="text" class="gyaan-chat-input" placeholder="Type your message..." autocomplete="off" />
        <button class="gyaan-chat-send-btn" style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}cc)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send
        </button>
      </div>
    `;

    const containerEl = document.querySelector(container) || document.body;
    containerEl.appendChild(chatDiv);

    const messagesDiv = chatDiv.querySelector(".gyaan-chat-messages");
    const input = chatDiv.querySelector(".gyaan-chat-input");
    const sendBtn = chatDiv.querySelector(".gyaan-chat-send-btn");

    const addMessage = (text, sender) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `gyaan-chat-message ${sender}`;

      const avatarHtml = sender === "bot"
        ? `<div class="gyaan-chat-message-avatar">${logoHtml}</div>`
        : "";

      msgDiv.innerHTML = `
        ${avatarHtml}
        <div class="gyaan-chat-message-content">${renderMarkdown(text)}</div>
      `;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      messages.push({ text, sender });
    };

    const showTyping = () => {
      const typingDiv = document.createElement("div");
      typingDiv.className = "gyaan-chat-message bot";
      typingDiv.innerHTML = `
        <div class="gyaan-chat-message-avatar">${logoHtml}</div>
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
        const data = await parseChatResponse(response);
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
    setTimeout(() => {
      addMessage(botConfig.greeting, "bot");
    }, 200);

    input.focus();
  };

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
