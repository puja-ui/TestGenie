# TestGenie
Generate test cases instantly 🧞‍♂️

Automated, AI-powered test case generation for QA engineers and developers.

Translates feature descriptions and acceptance criteria into structured test cases using Gemini — categorizing them into Functional, Security, Boundary, and UX tests, and providing one-click exports to JSON, CSV, and Markdown.

---

## The problem this solves

Writing comprehensive test cases manually is incredibly time-consuming and prone to human error — developers and QA engineers often miss critical edge cases, security vulnerabilities, or negative scenarios. TestGenie uses AI to instantly generate a robust suite of test cases (including edge cases and boundary conditions) so you can focus on building and automating tests rather than writing boilerplate documentation.

---

## Architecture

```
Feature Description & Acceptance Criteria
      ↓
Subject App — Node.js Express server / Vercel Serverless
(validates constraints and parses configuration)
      ↓
AI Generator — Gemini 3.1 Flash Lite
(generates categorized test steps and expected results)
      ↓
Structured Test Cases (JSON)
      ↓
Interactive UI + CSV/Markdown/JSON Exports
```

---

## Why Gemini?

Using Gemini 3.1 Flash Lite is a deliberate architectural decision. Test case generation requires a model with strong reasoning, instruction following, and the ability to strictly output structured JSON arrays. Flash Lite provides an incredibly fast time-to-first-token while maintaining high accuracy for context-heavy QA tasks, making the UI feel snappy and responsive.

---

## What it generates

Each test case is categorized across four dimensions:

| Category | What it checks |
|---|---|
| Functional | Does the feature work exactly as described in the happy path? |
| Security | Are there vulnerabilities (e.g. SQL injection, unauthorized access)? |
| Boundary | Does the system handle extreme limits, long strings, or edge inputs gracefully? |
| UX | Does the system provide clear validation messages and a good user experience? |

Additionally, TestGenie supports single-case regeneration — if a specific test case isn't quite right, you can ask the AI to rewrite just that one case with more detail or a different focus.

---

## Models

| Role | Model | Provider | Why |
|---|---|---|---|
| Generator | `gemini-3.1-flash-lite` | Google AI | Fast, strong reasoning, structured JSON output |

---

## Sample output

> When prompted to generate test cases for a "Login" feature with the "Edge Cases" toggle enabled, TestGenie consistently generates standard happy paths (e.g., successful login) but heavily focuses on boundary conditions: excessively long passwords, SQL injection attempts, empty credentials, and rate-limiting scenarios. It correctly formats the steps, expected results, and categorizes each case appropriately.

---

## Stack

- **Language:** TypeScript / Node.js
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (Single Page Application)
- **AI Model:** Gemini 3.1 Flash Lite via `@google/genai`
- **Deployment:** Vercel (Zero-Config API Routes)

---

## Project structure

```
TestGenie/
├── api/
│   └── generate.ts            # Vercel Serverless entry point
├── public/
│   ├── index.html             # Vanilla HTML/JS frontend
│   └── loader.lottie          # Animation assets
├── src/
│   └── server.ts              # Express API & Gemini integration
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 18+
- A free Google Gemini API Key — [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone https://github.com/puja-ui/TestGenie.git
cd TestGenie
npm install
```

### Environment variables

Create `.env` and fill in your key:

```
GEMINI_API_KEY=your_gemini_key_here
PORT=3000
```

### Run locally

```bash
npm start
```

The application will start on `http://localhost:3000`. 

---

## Deploying to Vercel

The project is architected for zero-config deployment on Vercel.

1. Push your code to GitHub.
2. Create a New Project on Vercel and import the repo.
3. Select **Other** as the Framework Preset.
4. Add `GEMINI_API_KEY` to the Environment Variables.
5. Deploy. (Vercel automatically serves the `public/` directory statically and maps `api/generate.ts` as a serverless function).

---

## Key design decisions

**Why Vanilla JS / HTML instead of React?**
To keep the project incredibly lightweight and fast. By avoiding a heavy frontend framework, the application loads instantly and remains simple to hack on or extend without complex build steps for the client side.

**Why Vercel Zero-Config?**
The project was restructured to decouple the Express app routing from the static file serving. By moving the static assets to the root `public/` folder and the API route to `api/`, Vercel naturally serves the frontend on its Edge CDN while treating the backend as an isolated serverless function, completely eliminating bundler issues with the AI SDK.

---

## What's next

- Implement integration testing with Playwright for the UI and pytest for API testing
- Add Jira/Linear integration to directly push generated test cases to ticket tracking
- Allow custom system prompts for different testing methodologies (e.g., BDD style "Given/When/Then")
