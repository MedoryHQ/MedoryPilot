# PraxisSync

PraxisSync is a multi-language (EN/GE) SaaS designed to digitize and streamline operations for solo medical practices, featuring a patient web app and a robust admin panel.

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
