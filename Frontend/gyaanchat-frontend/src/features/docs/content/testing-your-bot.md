# Testing Your Bot

Before you put your bot on your website for the world to see, you'll want to test it to make sure it's answering correctly and behaving the way you expect.

![Chat Preview page showing a test conversation](/docs-images/test-chat.png)

## Using the Chat Preview

Go to **Chat Preview** in the sidebar. 

This page provides a fully functional, live version of your chat widget directly inside the dashboard. It behaves exactly as it will on your website.

1.  Type a question in the input box and press Enter.
2.  Watch how the bot responds.
3.  Pay attention to the formatting, tone, and accuracy of the answer.

## What to Test

Here is a quick checklist of things to test before going live:

*   **Ask a direct question:** Ask something that is explicitly stated in one of your uploaded documents. 
*   **Ask a complex question:** Ask something that requires the bot to synthesize information from two different parts of your documents.
*   **Ask an off-topic question:** Try asking the bot about something completely unrelated to your business (e.g., "What is the capital of France?"). The bot *should* politely decline to answer, as it is restricted to your knowledge base.

![Example of the bot refusing to answer an off-topic question](/docs-images/test-chat.png)

> [!CAUTION]
> If your bot answers an off-topic question, you may need to adjust your AI Personality prompt on the Bot Settings page to explicitly tell it: *"Do not answer questions that are not related to the uploaded documents."*

## Fixing Incorrect Answers

If the bot gives a wrong answer or says it doesn't know something that is in your documents:

1.  **Check the documents:** Ensure the answer actually exists in the file you uploaded, and that the text is legible (not a scanned image).
2.  **Clarify the text:** Sometimes, information in a document is ambiguous. Try rewriting the section in your document more clearly and re-uploading it.
3.  **Adjust the prompt:** Go to Bot Settings and adjust the Personality prompt to guide the AI on how to interpret certain terms.

Once you are happy with how the bot is performing, you're ready to deploy it!
