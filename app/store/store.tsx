/**
 * Redux Store Configuration
 * Central state management store for the entire application
 *
 * Structure:
 * - workflowApp: Contains all workflow builder state (user, apps, steps, workflows)
 *
 * Uses Redux Toolkit for simplified Redux configuration
 * All state updates go through actions defined in workflowSlice.tsx
 */
import { configureStore } from "@reduxjs/toolkit";
import workflowReducer from "../features/workflowSlice";

/**
 * Configure and export the Redux store
 * Combines all reducers (currently just workflowReducer)
 * Can be extended with additional reducers as app grows
 */
export default configureStore({
	reducer: {
		workflowApp: workflowReducer, // Main workflow builder state
	},
});
