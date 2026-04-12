# Gyaan ChatAI - Comprehensive Project Report

## 1. Project Overview

### What is Gyaan ChatAI?
Gyaan ChatAI is a comprehensive SaaS (Software as a Service) AI chatbot platform. It empowers businesses and individuals to effortlessly build, customize, and deploy AI-powered virtual assistants on their own websites without writing any backend or AI logic.

At its core, it is a Retrieval-Augmented Generation (RAG) system. Users can upload their custom business data (such as PDF documents, FAQs, and manuals). The platform processes this data and creates a semantic knowledge base. When a visitor to the user's website asks a question, Gyaan ChatAI securely searches through this custom knowledge base and generates an accurate, context-aware answer using an underlying LLM (Large Language Model) powered by external/local models (e.g., Ollama).

### Primary Target Audience
1. **Tenants (Business Owners/Users):** People who register on the Gyaan ChatAI platform to create their own AI bots. They upload documents, customize the bot's look/feel, and get a small HTML script tag to embed the bot on their e-commerce store, blog, or corporate website.
2. **End-Users (Visitors):** People visiting the Tenant's website who will interact with the embedded chat widget.
3. **Super Admins:** The platform operators who oversee all tenants, monitor infrastructure health, and manage global settings.

### Core Value Proposition
- **No-Code AI Integration:** Turns PDF documents directly into conversational AI experts.
- **Data Privacy & Ownership:** Capabilities to run LLM inferences locally or connected securely to trusted providers.
- **Customizable Brand Identity:** Bots can be fully tailored (colors, personality, avatars) to match the host website's branding.
- **Embed Anywhere:** A simple `<script>` tag is all that's required to inject the floating chat widget on any website (Shopify, WordPress, custom HTML, etc.).

---

## 2. Architecture Breakdown

Gyaan ChatAI uses a modular, decoupled architecture where the Frontend directly interfaces with the API Backend, which internally acts as the mediator for Databases and AI inference engines.

### Backend Layer (Python / FastAPI)
The Backend acts as the platform's brain, exposing RESTful APIs. It is located in the `/Backend` directory.
- **Framework:** FastAPI
- **Database ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens), `passlib` for password hashing.
- **RAG/Vector Search:** ChromaDB, `sentence-transformers`
- **LLM Inferencing:** Ollama / Local Langchain orchestration.

#### Data Storage
1. **Relational Database (PostgreSQL):** Stores structural data such as Users (Tenants/Admins), Bot configurations, Conversation logs, and the metadata of uploaded Documents.
2. **Vector Database (ChromaDB):** Stores the mathematical representations (Embeddings) of the PDF documents.

#### How Document Ingestion Works (RAG Prep)
1. User uploads a PDF.
2. FastAPI processes the file via `PyPDF2`, extracting raw text.
3. The raw text is passed through an **Advanced Hybrid Paragraph-based Chunker**. Rather than blindly splitting text by character count, it respects paragraphs and logical document flows to maintain semantic context.
4. The chunks are converted to vectors using embedding models (e.g., via `sentence-transformers`).
5. Vectors are stored in a persistent ChromaDB instance along with metadata identifying the tenant who owns it.

#### How Chat Works (RAG Retrieval)
1. A user queries the bot through the website widget.
2. The query is converted into an embedding.
3. ChromaDB fetches the top most functionally similar text chunks associated with that Tenant.
4. The chunks + the system personality prompt + the user query are bundled and sent to the LLM (Ollama).
5. The LLM streams the generated response back to FastAPI via Server-Sent Events (SSE), greatly eliminating perceived "cold-start latency" and improving UX.

---

### Frontend Layer (React / Vite)
The Frontend serves the graphical interfaces. It is located in the `/Frontend/gyaanchat-frontend` directory.
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Vanilla CSS (`index.css`)
- **Routing:** React Router DOM V7
- **UI Icons:** Lucide-React

#### Application Segments
1. **Public Site:** Landing pages, Registration, Login.
2. **Docs Portal:** Extensive Markdown-rendered documentation pages explaining how to use GyaanChat (powered by `react-markdown` and `remark-gfm`).
3. **Tenant Dashboard:** 
   - Manage Knowledge Base (Upload documents).
   - Customize Bot Identity.
   - View Embed Instructions.
   - Test Chat functionality.
   - View Analytics & Conversation Histories.
4. **Super Admin Dashboard:**
   - Full oversight system controlling tenants, AI models, and platform metrics.

---

### Infrastructure & Deployment (Docker)
The system leverages a modular microservice orchestration using `docker-compose.yml` for unified scaling and environment isolation.
1. **`postgres` container**: Runs Postgres 16 with a persistent volume mapping `gyaanchat_pgdata`.
2. **`pgadmin` container**: Provides an admin UI interface for querying raw DB states.
3. **`ollama` container**: Houses the Generative AI inference engine mapping its models locally.

---

## 3. Core Features and Flows

This section details the distinct features of Gyaan ChatAI and walks through exactly how data moves through the system.

### Multi-Tenant Administration
- **Authentication:** Users can register an account, obtaining a JWT token valid for interactions.
- **Tenant Isolation:** A tenant is an environment owned by a single user. Every document they upload, every bot configuration they toggle, and every conversation that occurs is fiercely walled off using relational `tenant_id` references inside PostgreSQL and metadata filters within ChromaDB.
- **Super-Admin Interface:** A separate role exists to view overall system usage, manage active tenants, and track global document counts.

### Dynamic Knowledge Ingestion
Unlike standard LLMs which rely merely on past training data, Gyaan ChatAI uses real-time context ingestion.
- **Support:** Users can drag-and-drop PDFs.
- **Indexing:** The files are instantly processed through FastAPI. Users see an active status indicating the document is fully indexed.
- **De-Indexing:** Deleting a document immediately purges its vector embeddings from ChromaDB, instantly updating the bot's known intelligence.

### Bot Customization Engine
A core selling point is the ability to white-label the Chatbot.
- **Bot Name:** Name the virtual assistant (e.g., "Acme Corp Support").
- **Welcome Message:** Design the first message the user reads.
- **AI Personality Profile (System Prompt):** The most crucial feature. Users can assign roles ("You are a grumpy sailor", "You are an expert sales representative"). This prompt fundamentally modifies how the model processes the RAG context.
- **Visuals:** Brand Colors and Logo Avatars are dynamically injected into the embedded chat widget.

### Seamless Embedding
To simplify deployment for users:
- The `/app/install` screen generates a completely custom HTML `<script>` tag.
- This tag contains the Tenant's unique bot ID and loads an external JS payload that renders the Chat Widget precisely customized to their saved branding settings.

### Analytics and Real Conversations Tracking
- **Dashboards:** Tenants get graphical insights indicating how frequently their bot is queried.
- **Conversation Logs:** Complete, chronological transcripts of what human visitors are saying and how the AI is responding.
- **Feedback Loop:** By reading logs, Tenants discover if the Bot doesn't know something, directly indicating they need to add a new document covering that topic.

### Real-time Message Streaming
Originally subject to a 30-40s "cold-start" latency when using massive contexts, the system now implements stream-based generation. 
As the LLM processes the response token-by-token (word-by-word), FastAPI actively streams it back to the React UI using Server-Sent Events (SSE). This gives the illusion of blazing speed and provides a modern typing experience rather than a long loading spinner.
