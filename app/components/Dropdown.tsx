import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setStagedApp, updateStep, addWorkflowStep, updateWorkflowStep } from "../features/workflowSlice";
import { getTokenExpiry } from "../utils/tokenUtils";
import axios from "axios";

/**
 * Props interface for Dropdown component
 */
type DropdownProps = {
	stepId: string; // ID of the step this dropdown belongs to
};

/**
 * Interface: App/Integration data structure
 * Represents an available integration app in the dropdown
 */
interface App {
	id: string; // Unique app identifier
	name: string; // App name
	appName: string; // App identifier (lowercase, e.g., "gmail", "slack")
	displayName: string; // User-friendly display name
}

/**
 * Dropdown Component
 * App selector dropdown for workflow steps
 *
 * Features:
 * - Lists available integration apps (Gmail, Slack, GitHub, etc.)
 * - Shows user's connection status for each app
 * - Handles OAuth token expiration checking
 * - Updates both UI steps and workflow steps in Redux
 * - Determines step type based on position (first step = trigger, others = action)
 */
export default function Dropdown({ stepId }: DropdownProps) {
	const dispatch = useDispatch();
	const steps = useSelector((state: any) => state.workflowApp.steps);
	const apps = useSelector((state: any) => state.workflowApp.apps);
	const workflow = useSelector((state: any) => state.workflowApp.workflow);
	const userDetails = useSelector((state: any) => state.workflowApp.user);
	const userAppsMap: Map<string, App> = new Map();
	userDetails?.userApp?.forEach((app: App) => {
		userAppsMap.set(app.appName, app);
	});

	// Find the current step to get its selected app
	const currentStep = steps.find((step: any) => step.stepId === stepId);
	const selectedAppName = currentStep?.appName || "";

	/**
	 * Handler: App selection change
	 * Processes when user selects an app from the dropdown
	 *
	 * Flow:
	 * 1. Determine step type (trigger if first step, otherwise action)
	 * 2. Check if user has connected this app
	 * 3. Verify OAuth token expiration status
	 * 4. Update staged app with connection status
	 * 5. Update UI steps and workflow steps in Redux
	 *
	 * @param event - Select change event
	 */
	const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.stopPropagation();
		const selectedAppName: string = event.target.value;
		// Determine step type based on position (first step is always trigger)
		const stepType = steps.length === 1 ? "trigger" : "action";

		// Check if user has already connected to this app
		if (userAppsMap.has(selectedAppName.toLowerCase())) {
			const stagedPayload = {
				stepId: stepId,
				appName: selectedAppName,
				connected: true,
				expired: true,
				hasUser: true,
			};

			let appInfo = userDetails?.userApp.filter((app: App) => app.appName === selectedAppName.toLowerCase())[0];

			if (appInfo.appName === "slack" && appInfo.expiresAt === null) {
				stagedPayload.expired = false;
			} else if (appInfo != null) {
				let getAppExpiry = getTokenExpiry(appInfo.expiresAt);
				if (getAppExpiry === "expired") {
					stagedPayload.expired = true;
				} else {
					stagedPayload.expired = false;
				}
			}

			dispatch(setStagedApp(stagedPayload));
		} else {
			const stagedPayload = {
				stepId: stepId,
				appName: selectedAppName,
				connected: false,
				expired: false,
				hasUser: false,
			};
			dispatch(setStagedApp(stagedPayload));
		}

		// Update UI steps
		dispatch(updateStep({ stepId: stepId, stepType, appName: selectedAppName }));

		// Add or update workflow step
		const existingWorkflowStep = workflow.steps.find((step: any) => step.id === stepId);

		if (existingWorkflowStep) {
			// Update existing step
			dispatch(
				updateWorkflowStep({
					...existingWorkflowStep,
					appName: selectedAppName,
				})
			);
		} else {
			// Add new step to workflow
			dispatch(
				addWorkflowStep({
					id: stepId,
					type: stepType as "trigger" | "action",
					appName: selectedAppName,
				})
			);
		}
	};

	return (
		<div className="flex flex-col">
			<label htmlFor="my-dropdown">Choose an option :</label>
			<select
				id="my-dropdown"
				className="m-2 p-2 border-1 rounded-lg hover:cursor-pointer"
				onChange={handleChange}
				value={selectedAppName}
			>
				<option value="">Select an app</option>
				{apps.map((app: App) => (
					<option
						key={app.id + app.name}
						value={app.appName}
						className="p-4 m-2 hover:cursor-pointer border-2 border-indigo-500/50 rounded-lg"
					>
						{app.displayName}
					</option>
				))}
			</select>
		</div>
	);
}
