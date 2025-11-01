# Flow - Workflow Automation Builder

A visual workflow builder for automating tasks across multiple platforms. Create powerful automation workflows without writing code.

Link -> https://flow-workflow-builder-frontend.vercel.app/

## Features

-  **Visual Workflow Builder**: Intuitive drag-and-drop interface for building automation workflows
-  **Multiple Integrations**: Connect Gmail, Slack, GitHub, and custom Webhooks
-  **Conditional Logic**: Add branching conditions to create intelligent workflows
-  **Dynamic Variables**: Reference trigger data using `{{trigger.variable}}` syntax
-  **Workflow Testing**: Test workflows before publishing to ensure they work correctly
-  **Execution Logs**: Monitor workflow runs with detailed execution logs and debugging information
-  **OAuth Authentication**: Secure app connections with OAuth 2.0

## Tech Stack

-  **Next.js 15.5.3** with React 19 - Modern React framework with App Router
-  **TypeScript** - Type-safe development
-  **Redux Toolkit** - State management for workflow builder
-  **Tailwind CSS** - Utility-first styling
-  **Axios** - HTTP client for API communication
-  **Google OAuth** - Authentication integration

## Prerequisites

-  Node.js 18+ installed
-  pnpm package manager
-  Backend API server running (required for full functionality)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flow--workflow-builder-frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Create environment configuration:

```bash
cp .env.example .env.local
```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Google OAuth Client ID (required for authentication)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Backend API URL (default: http://localhost:2000)
NEXT_PUBLIC_URI=http://localhost:2000
```

## Running the Application

**Development mode:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build:**

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/
├── components/       # Reusable UI components
├── features/         # Redux slices and state management
├── config/           # Action and trigger configurations
├── lib/              # API client and shared utilities
├── utils/            # Helper functions
├── create-workflow/  # Workflow builder page
├── workflow-logs/    # Execution logs pages
└── profile/          # User profile and settings
```

## Supported Integrations

### Gmail

-  **Triggers**: New Email, Email Labeled, Email Starred
-  **Actions**: Send Email, Reply to Email, Add Label, Star Email

### Slack

-  **Triggers**: New Channel Message, New Reaction, User Joined Channel
-  **Actions**: Send DM, Send Channel Message, Add Reaction, Update Message

### GitHub

-  **Triggers**: New Issue, PR Opened, Commit Pushed, Issue Commented
-  **Actions**: Create Issue, Add Comment, Close Issue, Assign Issue

### Webhooks

-  **Actions**: Send HTTP POST request to any URL

## How It Works

1. **Create a Workflow**: Start by selecting a trigger (e.g., "New Gmail Email")
2. **Add Actions**: Chain multiple actions (e.g., "Send Slack Message")
3. **Use Variables**: Reference trigger data like `{{trigger.from}}` or `{{trigger.subject}}`
4. **Add Conditions**: Create branching logic based on trigger data
5. **Test & Publish**: Test your workflow, then publish to activate it

## Development

The application uses Redux for state management. Key state is stored in:

-  `workflowSlice.tsx` - Workflow builder state, steps, and configurations

API calls are centralized in `app/lib/api-client.ts` with automatic authentication token handling.
