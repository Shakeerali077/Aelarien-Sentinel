# Aelarien Sentinel Alpha: AI Governance & Orchestration Platform

A high-performance, enterprise-grade AI governance system designed for multi-agent orchestration with real-time safety enforcement. Sentinel Alpha provides a secure registry for knowledge indexing, policy enforcement, and auditable AI interactions.

## 🚀 Key Features

- **Mission Control**: A real-time terminal interface for orchestrating multi-agent clusters with live safety monitoring.
- **Policy Registry**: Define high-resolution governance boundaries. Policies are enforced at runtime via the Sentinel Alpha reasoning engine to prevent data leaks and prompt injections.
- **Neural Dashboard**: Real-time telemetry and risk variance tracing using Recharts to monitor system health and heuristic risk levels.
- **Knowledge Base (RAG)**: Index and serve local documentation to agents with cryptographically audited retrieval paths.
- **Audit Logs & Export**: Continuous session tracing with CSV export capabilities for compliance reporting.
- **Policy Engine**: Integrated risk analysis using Gemini Flash to sanitize inputs before they reach the reasoning core.

## 🛠 Tech Stack

- **Frontend**: React 18+ (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Database & Auth**: Firebase (Cloud Firestore & Google Auth)
- **AI Core**: Google Gemini 1.5 Pro & 1.5 Flash
- **Visualization**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following:

1.  **Node.js**: Version 18.x or higher.
2.  **Firebase Project**: A Firebase project with Firestore and Authentication (Google Provider) enabled.
3.  **Google AI Studio API Key**: Required for the Gemini generative capabilities.

## 🔧 Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd sentinel-alpha
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_apiKey
    VITE_FIREBASE_AUTH_DOMAIN=your_authDomain
    VITE_FIREBASE_PROJECT_ID=your_projectId
    VITE_FIREBASE_STORAGE_BUCKET=your_storageBucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messagingSenderId
    VITE_FIREBASE_APP_ID=your_appId
    GEMINI_API_KEY=your_gemini_api_key
    ```
    *Note: Ensure `firebase-applet-config.json` is also present if using internal deployment.*

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🏗 Project Structure

- `src/components/console`: Mission Control terminal logic.
- `src/components/governance`: Policy editor and audit log visualizations.
- `src/services/aiService.ts`: Core AI orchestration logic, risk analysis, and RAG integration.
- `src/lib/firebase.ts`: Database initialization and security rule error handling.
- `firestore.rules`: Enterprise-hardened security rules for multi-tenant isolation.
- `firebase-blueprint.json`: Data schema definitions for the integrated registry.

## 🛡 Security & Governance

Sentinel Alpha uses a **Validation-First** approach:
1.  **Input Sanitization**: User prompts are scanned against the **Policy Registry** before being processed.
2.  **Relational Sync**: All data access is gated by Firestore security rules that verify project membership.
3.  **Immutability**: Audit logs are designed to be immutable at the database layer to ensure compliance integrity.

## 📄 License

Internal Development - Aelarien Security Group.
