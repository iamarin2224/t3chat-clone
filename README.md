# T3 Chat Clone

A feature-rich, high-performance clone of [t3.chat](https://t3.chat) built using Next.js (App Router), Prisma, PostgreSQL, Better-Auth, and the Vercel AI SDK. It leverages OpenRouter to offer real-time streaming with support for advanced AI reasoning models.

---

## Overview

This project is a modern, responsive AI chat client that mimics the core experience of t3.chat. It allows users to authenticate securely, browse and select from a dynamic list of free AI models, initiate chat sessions, and interact with LLMs in real-time. 

### Key Features
*   **Social Authentication:** Complete OAuth flow (GitHub and Google) powered by Better-Auth.
*   **Dynamic Model Selection:** Automatically fetches and displays free-tier models from the OpenRouter API.
*   **Real-time Streaming:** Smooth word-by-word streaming of text responses using Vercel's `ai` SDK.
*   **Reasoning Process Visualizer:** Displays the underlying reasoning steps in a dedicated collapsible UI element.
*   **Conversation Management:** Save, load, and delete chat history seamlessly with a responsive sidebar navigation.
*   **Auto-Triggering:** Automatically resumes conversations when redirecting from the landing page.

---

## Tech Stack

*   **Frontend Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **AI Integration & Streaming:** [Vercel AI SDK](https://sdk.ai.dev/) & [@openrouter/ai-sdk-provider](https://github.com/OpenRouterHQ/openrouter-ai-sdk-provider)
*   **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
*   **Authentication:** [Better-Auth](https://www.better-auth.com/)
*   **State Management:** [TanStack React Query v5](https://tanstack.com/query/latest)
*   **Styling & UI Elements:** Tailwind CSS, Framer Motion, Lucide React, and custom modular AI input/conversation components

---

## Getting Started

Follow these steps to set up and run the application locally.

### Prerequisites
*   Node.js (v18.x or later recommended)
*   A running PostgreSQL database instance
*   An [OpenRouter API Key](https://openrouter.ai/)
*   OAuth client credentials for Google and/or GitHub (optional for local dev if mock authentication is configured, but required for social login)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd t3chat-clone
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root of the project and populate it with the following environment variables:

```env
# Node Environment
NODE_ENV="development"

# PostgreSQL connection string
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<db_name>?schema=public"

# Better-Auth Configuration
# Secret key used for session encryption (generate with `openssl rand -hex 32`)
BETTER_AUTH_SECRET="your-better-auth-secret"
# The canonical URL of your local application (also used for auth client redirections)
BETTER_AUTH_URL="http://localhost:3000"

# Social Authentication Credentials
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenRouter Configuration
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### Database Initialization

Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:

```bash
# Push schema changes directly to the database
npx prisma db push

# Generate the type-safe Prisma client
npx prisma generate
```

### Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the application.

---

## Usage

### Starting a Chat
1. Sign in using either your Google or GitHub account on the `/sign-in` screen.
2. On the home screen, select an AI model from the model selector dropdown inside the prompt input box.
3. Type your prompt and press **Enter** or click the submit button. You will be redirected to the conversation view (`/chat/[chatId]`), where the model will automatically start streaming its response.

### Conversing & Managing History
*   **Streaming Responses:** Watch replies populate dynamically. If the selected model outputs reasoning data, it will render in a dedicated, collapsible `<Reasoning>` accordion.
*   **Stop / Retry:** You can halt a response mid-stream by clicking **Stop**, or regenerate the AI's last reply by clicking **Retry**.
*   **Sidebar Navigation:** Browse your past conversations in the sidebar. Click any item to load that thread.
*   **Deleting Conversations:** Click the delete button adjacent to any chat in the sidebar to permanently remove it and its message history.

---

## About Me
*   I am Arin Das, pursuing BCSE from Jadavpur Univeristy.