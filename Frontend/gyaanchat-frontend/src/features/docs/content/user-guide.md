# Comprehensive User Guide: Your First Agent

Welcome to GyaanChat! This detailed guide will walk you through launching a secure, highly-capable AI agent initialized directly on your data from start to finish.

---

## 1. Initializing your Workspace

Once you log in, you will land on the **Analytics Dashboard**. This environment acts as your secure "Tenant Sandbox." Your bot, your data, and your configurations are entirely isolated from any other user on the platform.

GyaanChat prevents generic AI hallucinations through **Retrieval-Augmented Generation (RAG)**. Instead of guessing, it searches through your exact embeddings using ChromaDB and formulates an answer via local LLMs.

---

## 2. Connecting Data

To make your bot intelligent, you need to provide it with data. Navigate via the left sidebar to the **Documents** tab.

### Supported File Types & Limits
Drag and drop your file into the highlighted Dropzone. GyaanChat supports standard file types parsed natively on our backend.

| Format | Max File Size | Best Used For |
| :--- | :--- | :--- |
| **PDF** | 10 MB | Heavy reports, textual framework documentation. |
| **Text** | 5 MB | Lightweight FAQ updates or rapid patches. |
| **Word** | 10 MB | Standard internal company specs. |
| **CSV** | 10 MB | Flat-file structured rows or Q&A pairs. |

### Document Best Practices
1. **Text-Based PDFs**: GyaanChat optimizes for searchable PDFs. Images or heavily scanned photographic books will not index cleanly.
2. **Clear Structures**: Explicit Tables of Contents, clear headings, and bullet points drastically increase the similarity search accuracy! 

> [!TIP]
> This embedding process takes seconds, but for highly dense documents upwards of 10-15 megabytes, the background indexer may take a minute to fully initialize the nearest-neighbors algorithm. ☕

---

## 3. Customizing your Bot

Your AI agent represents your brand. Navigate to the **Bot Settings** tab to take full visual and behavioral control!

### Bot Persona & Temperature
- **Temperature Configuration**: This dictates your Bot's creativity. We default to `0.2`. Values near `0.1 - 0.3` produce highly strict, factual responses. Values near `0.9` produce creative variations but risk going off-script.
- **Fallback Configurations**: Set the exact phrase ("I couldn't find that") the bot utilizes when a user asks something unrelated to your PDFs.

### Themes & Branding
Within the Theme Customizer, you can natively specify Hex Codes to match your company logo:
- The floating widget bubble structure.
- The UI Header inside the chat window.
- The user's chat bubbles.

You can also input a `logo_url` schema image (preferably a transparent `128x128` PNG) for the chat icon!

![Theme Customizer](/docs-images/bot-settings.png)

---

## 4. Test the Bot

Before exposing your customized bot to the world, use the **Test Chat** tab on your left sidebar to experience the exact flow your users will see.

Try asking the bot detailed questions relying directly on the documents you provided in Step 2. If it succeeds, it's time to integrate!

![Chat Example](/docs-images/test-chat.png)

---

## 5. Embedding on your Website

Getting your customized GyaanChat out of the dashboard and into the hands of your users only takes one minute. Head to your **Install & Embed** tab.

### Standard HTML Script Injection
Copy your customized script and paste it slightly above the closing `</body>` tag of your application's HTML.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to my website</h1>
    
    <!-- Paste your unique GyaanChat Widget Script Below -->
    <script 
        src="https://api.gyaanchat.domain/widget.js" 
        data-widget-key="[YOUR_UNIQUE_BOT_KEY_HERE]">
    </script>
</body>
</html>
```

### React / SPA Environments
If you are using a Single Page Application, inject the script asynchronously on mount to prevent double-loading DOM conflicts:

```tsx
import { useEffect } from 'react';

export default function ChatWidget() {
    useEffect(() => {
        if (document.getElementById('gyaanchat-widget-script')) return;

        const script = document.createElement('script');
        script.id = 'gyaanchat-widget-script';
        script.src = 'https://api.gyaanchat.domain/widget.js';
        script.setAttribute('data-widget-key', '[YOUR_KEY_HERE]');
        script.async = true;
        
        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById('gyaanchat-widget-script');
            if (existingScript) existingScript.remove();
        };
    }, []);

    return null;
}
```

### Standalone iFrame (Direct Links)
If your CMS aggressively blocks external JavaScript requests, you can embed the raw un-widgetized chat via pure iFrames natively anywhere on your website using:

```url
http://localhost:8000/chat-embed?key=[WIDGET_KEY]
```

Congratulations! Your GyaanChat bot is completely setup and live!
