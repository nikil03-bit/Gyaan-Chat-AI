# Embedding on Your Website

Once you've tested your bot and are happy with how it responds, it's time to put it on your website for your users.

GyaanChat makes this incredibly easy. You just need to copy a small snippet of code and paste it into your website's HTML.

![Deployment page showing the script tag embed code](/docs-images/install.png)

## Getting Your Embed Code

1.  Navigate to **Deployment** in the sidebar.
2.  You will see a block of `<script>` code.
3.  Click the **Copy** button to copy the code to your clipboard.

## Installing the Widget

You can add this script tag to almost any website builder or custom codebase. The installation process is generally the same regardless of your platform.

### Standard HTML Websites

If you are hand-coding your website or have direct access to your HTML files:

1.  Open your `index.html` (or the main layout file).
2.  Scroll down to the very bottom, right before the closing `</body>` tag.
3.  Paste the GyaanChat script tag.
4.  Save and publish your site.

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>
  <p>Some content here...</p>

  <!-- Paste the GyaanChat snippet here -->
  <script src="https://example.com/widget.js" data-bot-id="YOUR_BOT_ID_HERE"></script>
</body>
</html>
```

### Installation Guides for Popular Platforms

*   **WordPress:** Go to Appearance -> Theme File Editor -> `footer.php` and paste the script before `</body>`. Alternatively, use a free plugin like "Insert Headers and Footers".
*   **Shopify:** Go to Online Store -> Themes -> Edit Code. Open `theme.liquid` and paste the script right before the closing `</body>` tag.
*   **Webflow:** Go to Webflow Project Settings -> Custom Code. Paste the script into the "Footer Code" section.
*   **Squarespace:** Go to Settings -> Advanced -> Code Injection. Paste the script into the "Footer" section.

> [!TIP]
> If you make changes to your Bot Settings (like changing the color or the personality prompt) *after* you've embedded the code, you do **not** need to install new code. The widget automatically updates everywhere it is installed.
