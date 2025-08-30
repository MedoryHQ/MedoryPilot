# Medory

Medory is a doctor’s personal assistant SaaS that digitizes and automates core workflows. It combines fast appointment booking and secure payments with built-in messaging, a rules/workflow engine, and editable, schema-backed patient records, examination sheets, Form 100, and lab results are stored as structured data (not PDFs) for searchability and automation. Patients can view their history, connect directly with their doctor, and schedule and pay in minutes. Medory reduces administrative overhead, helps doctors handle more appointments, and streamlines patient–doctor interactions.

---

### Project Structure

This monorepo is organized into the following applications and shared packages:

- **`apps/frontend`**: The patient-facing Next.js web application.

- **`apps/admin-panel`**: The doctor's dashboard built with React and Ant Design.

- **`apps/backend`**: The Node.js/Express.js API that serves both applications.

- **`packages/types`**: Shared TypeScript definitions.

- **`packages/utils`**: Shared utility functions.

---

### Getting Started

To set up the project locally, follow these steps:

1.  **Install Dependencies:**

    - For the root and frontend/admin-panel: `yarn install`
    - For the backend: `cd apps/backend && npm install`

2.  **Run the Applications:**
    - Start the backend API: `cd apps/backend && npm run dev`
    - Start the frontend app: `cd apps/frontend && yarn dev`
    - Start the admin panel: `cd apps/admin-panel && yarn dev`
