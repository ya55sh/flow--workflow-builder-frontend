import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Represents a single step in the workflow builder UI
 * Used for tracking step order and basic step information
 */
export type Step = { stepId: string; stepType: string; appName?: string };

/**
 * Represents an app that is being configured/staged for a specific step
 * Tracks connection status and authentication state
 */
export type StagedApp = {
	stepId: string; // The step this app is associated with
	appName: string; // The name of the app (e.g., 'gmail', 'slack')
	connected?: boolean; // Whether the app is currently connected
	expired?: boolean; // For reauth app in case of expiry
	hasUser?: boolean; // Has user is for initial render that tells where to show signin or connected/reauth
};

/**
 * Represents the state of the app card modal/panel
 * Used to determine which card is currently being configured
 */
export type CardState = {
	stepId: string; // The step ID being edited
	stepType: string; // The type of step (trigger, action, condition)
};

/**
 * Represents a user's connected app with authentication tokens
 * Stores OAuth tokens and expiry information
 */
export type userApps = {
	appName: string; // Name of the integrated app
	connected?: boolean; // Connection status
	accessToken?: string; // OAuth access token
	refreshToken?: string; // OAuth refresh token
	expiresAt?: number; // Token expiration timestamp
};

/**
 * Represents the authenticated user
 * Contains user identification and their connected apps
 */
export type User = {
	id: string; // Unique user identifier
	email: string; // User's email address
	userApp?: userApps[]; // List of user's connected apps
};

/**
 * Represents a complete workflow step with all configuration
 * This is the final structure that gets saved to the backend
 */
export type WorkflowStep = {
	id: string; // Unique step identifier
	type: "trigger" | "action" | "condition"; // Type of workflow step
	appName?: string; // The app this step uses (if applicable)
	title?: string; // Display title for the step
	triggerId?: string; // Specific trigger ID for trigger steps
	actionId?: string; // Specific action ID for action steps
	config?: Record<string, any>; // Step configuration and parameters
	conditions?: Array<{
		// Conditional branching logic
		if?: string; // Condition expression
		then?: string; // Step to execute if true
		else?: string; // Step to execute if false
	}>;
};

/**
 * Represents a complete workflow
 * Contains the workflow name and all of its configured steps
 */
export type Workflow = {
	workflowName: string; // The name of the workflow
	steps: WorkflowStep[]; // Array of configured workflow steps
};

/**
 * The main Redux state for the application
 * Manages all workflow builder state including user, apps, and workflows
 */
export type AppState = {
	user: any; // Currently authenticated user
	apps: any[]; // Available apps that can be integrated
	steps: Step[]; // Current workflow steps being built
	stagedApp: StagedApp[]; // Apps being configured for each step
	cardStatus: boolean; // Whether the app card modal is open
	cardState: CardState; // Current state of the app card modal
	workflow: Workflow; // The workflow currently being built/edited
	userWorkflows: Workflow[]; // List of user's saved workflows
};

/**
 * Redux slice for managing workflow builder state
 * Contains all reducers for managing users, apps, steps, and workflows
 */
export const appSlice = createSlice({
	name: "app",
	// Initial state with default values
	initialState: {
		user: { id: "", email: "", userApp: [] },
		apps: [],
		steps: [{ stepId: "1", stepType: "trigger" }], // Start with one trigger step
		stagedApp: [],
		cardStatus: false,
		cardState: { stepId: "", stepType: "" },
		workflow: {
			workflowName: "",
			steps: [],
		},
		userWorkflows: [],
	} as AppState,
	reducers: {
		/**
		 * Sets the currently authenticated user
		 * Called after successful login or when restoring session
		 */
		setUser: (state, action: PayloadAction<any>) => {
			state.user = action.payload;
		},

		/**
		 * Sets the list of available apps that can be integrated
		 * Typically called on app initialization
		 */
		setApps: (state, action: PayloadAction<any[]>) => {
			state.apps = action.payload;
		},

		/**
		 * Adds a single new step to the workflow builder
		 * Used when user clicks "Add Step" button
		 */
		setStep: (state, action) => {
			state.steps.push(action.payload);
		},

		/**
		 * Replaces all steps with a new array of steps
		 * Used when loading an existing workflow or resetting
		 */
		setSteps: (state, action: PayloadAction<Step[]>) => {
			state.steps = action.payload;
		},

		/**
		 * Updates a specific step's information (e.g., setting the app name)
		 * Finds the step by ID and updates its properties
		 */
		updateStep: (state, action: PayloadAction<Step>) => {
			const { stepId, appName } = action.payload;
			state.steps = state.steps.map((step) => (step.stepId === stepId ? { ...step, appName } : step));
		},

		/**
		 * Removes a step from the workflow builder
		 * Ensures at least one step remains (prevents removing the last step)
		 */
		removeStep: (state, action) => {
			if (state.steps.length > 1) state.steps = state.steps.filter((step) => step.stepId !== action.payload);
		},

		/**
		 * Sets or updates a staged app for a specific step
		 * If the app already exists for this step, updates it; otherwise adds it
		 * Used during the app configuration process
		 */
		setStagedApp: (state, action: PayloadAction<StagedApp>) => {
			const { stepId, appName, connected, expired, hasUser } = action.payload;
			const app = state.stagedApp.find((a) => a.stepId === stepId);

			if (app) {
				// Update existing staged app
				app.appName = appName;
				app.connected = connected;
				app.expired = expired;
				app.hasUser = hasUser;
			} else {
				// Add new staged app
				state.stagedApp.push(action.payload);
			}
		},

		/**
		 * Replaces all staged apps with a new array
		 * Used when resetting or loading existing workflow configuration
		 */
		setStagedApps: (state, action: PayloadAction<StagedApp[]>) => {
			state.stagedApp = action.payload;
		},

		/**
		 * Removes a staged app from a specific step
		 * Called when user disconnects or changes the app for a step
		 */
		removeStagedApp: (state, action: PayloadAction<StagedApp>) => {
			const { stepId, appName } = action.payload;
			state.stagedApp = state.stagedApp.filter((a) => a.stepId !== stepId);
		},

		/**
		 * Controls whether the app card modal/panel is open or closed
		 * True = modal open, False = modal closed
		 */
		setCardEnabled: (state, action: PayloadAction<boolean>) => {
			state.cardStatus = action.payload;
		},

		/**
		 * Sets the current state of the app card (which step and type is being edited)
		 * Used to determine what to display in the app configuration modal
		 */
		setCardState: (state, action: PayloadAction<CardState>) => {
			state.cardState = action.payload;
		},

		/**
		 * Updates the current workflow being built/edited
		 * Merges new properties with existing workflow (partial update)
		 */
		setWorkflow: (state, action: PayloadAction<Workflow>) => {
			state.workflow = { ...state.workflow, ...action.payload };
		},

		/**
		 * Adds a new step to the workflow's steps array
		 * This is the fully configured step that will be saved
		 */
		addWorkflowStep: (state, action: PayloadAction<WorkflowStep>) => {
			state.workflow.steps.push(action.payload);
		},

		/**
		 * Updates an existing workflow step by ID
		 * Merges new properties with existing step (partial update)
		 */
		updateWorkflowStep: (state, action: PayloadAction<WorkflowStep>) => {
			const { id } = action.payload;
			const index = state.workflow.steps.findIndex((step) => step.id === id);
			if (index !== -1) {
				state.workflow.steps[index] = { ...state.workflow.steps[index], ...action.payload };
			}
		},

		/**
		 * Removes a workflow step by ID
		 * Filters out the step from the workflow's steps array
		 */
		removeWorkflowStep: (state, action: PayloadAction<string>) => {
			state.workflow.steps = state.workflow.steps.filter((step) => step.id !== action.payload);
		},

		/**
		 * Adds workflows to the user's list of saved workflows
		 * Appends to existing workflows rather than replacing
		 */
		setUserWorkflows: (state, action: PayloadAction<Workflow[]>) => {
			state.userWorkflows.push(...action.payload);
		},
	},
});

/**
 * Exported action creators for dispatching Redux actions
 * These are automatically generated by Redux Toolkit from the reducers
 * Import and use these in components to update the state
 */
export const {
	setUser,
	setApps,
	setStep,
	setSteps,
	updateStep,
	removeStep,
	setStagedApp,
	setStagedApps,
	removeStagedApp,
	setCardEnabled,
	setCardState,
	setWorkflow,
	addWorkflowStep,
	updateWorkflowStep,
	removeWorkflowStep,
} = appSlice.actions;

/**
 * The reducer to be added to the Redux store
 * Handles all state updates defined in the reducers above
 */
export default appSlice.reducer;
