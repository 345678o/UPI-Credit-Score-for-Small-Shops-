# 💳 CrediPay | Small Business Fintech Infrastructure

**CrediPay** is a high-fidelity, merchant-first fintech platform designed to bridge the gap between traditional Kirana stores and digital financial ecosystems. It provides a seamless interface for auditing transactions, managing business performance via AI, and building credit eligibility through daily operations.

---

## 🌟 Key Features

### 1. Unified Business Ledger (The Pulse)
*   **Automatic Income Sync**: Zero-touch recording of digital payments.
*   **Manual Audit Vault**: An intuitive logger for expenses (Rent, Inventory, Salaries).
*   **Dual-State Logging**: Differentiates between automatic digital inflows and manual manual outlays for a 360° financial view.

### 2. Strategic AI Engine (Growth Engine)
*   **Performance Narrative**: Real-time business insights powered by **Google Gemini (Genkit)**.
*   **Profitability Audits**: Automated analysis of gross income vs. capital leakage.
*   **Efficiency Metrics**: Actionable coaching pointers based on 10-day financial velocity.

### 3. Responsive Pro-Workspace
*   **Full Website Experience**: A sophisticated desktop portal featuring a persistent command sidebar and integrated audit top bar.
*   **Native-Feel Mobile App**: A fluid, PhonePe-inspired mobile interface specifically optimized for one-handed merchant operation.
*   **Universal Shell**: Adaptive layout ensuring a premium experience from a smartphone to a 27-inch desktop monitor.

### 4. Merchant Trust Protocol
*   **Proprietary Credit Scoring**: A dynamic scoring algorithm that rewards transaction consistency and financial discipline.
*   **Capital Eligibility**: Real-time evaluation for loan disbursement based on net profit trends.

---

## 🛠 Tech Stack

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router & Turbopack)
*   **Backend & Security**: [Firebase](https://firebase.google.com/) (Firestore, Authentication, App Hosting)
*   **AI Orchestration**: [Firebase Genkit](https://genkit.dev/)
*   **Large Language Model**: [Google Gemini 1.5 Flash](https://ai.google.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
*   **Data Visualization**: [Recharts](https://recharts.org/)

---

## 🔒 Security Architecture

CrediPay employs a **Recursive Ownership Model** via Firestore Security Rules. This ensures that every transaction, customer record, and analytics summary is isolated and accessible only by the authenticated merchant who owns that business identity.

```javascript
match /users/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 20+
*   Firebase CLI installed and logged in.
*   A Gemini API Key (set as `GEMINI_API_KEY` in your environment logic).

### 2. Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Deployment
The project is optimized for **Firebase App Hosting**.
```bash
npx firebase-frameworks@latest deploy
```

---

## 📂 Project Structure

*   `/src/app`: Responsive page routes (Dashboard, Ledger, Analytics, Profile).
*   `/src/components/layout`: The `AppShell` responsive navigation infrastructure.
*   `/src/lib/fintech-backend.ts`: The centralized fintech logic and scoring layer.
*   `/src/ai/flows`: Genkit orchestration for business performance intelligence.
*   `/src/firebase`: Client-side SDK initialization and custom hooks.

---

## 📝 Support & Roadmap
*   [ ] Phase 4: Direct NBFC/Lender API Integration.
*   [ ] Phase 5: Multi-store aggregation for enterprise merchants.
*   [ ] Phase 6: Automated tax filing (GST) preparation.

*Developed with precision for the modern Indian Merchant.*
