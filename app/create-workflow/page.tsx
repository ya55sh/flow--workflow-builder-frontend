"use client";
import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppCard from "../components/AppCard";
import { useDispatch, useSelector } from "react-redux";
import { setApps, setWorkflow, setSteps, setStagedApps, setUser } from "../features/workflowSlice";
import SidePanel from "../components/SidePanel";
import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/config";
import { getActionConfig, getTriggerConfig } from "../config/actionConfigs";

/**
 * Type definition for workflow creation stages
 * Used to track progress through the workflow creation process
 */

/**
 * Create Workflow Page Component
 * Main workflow builder interface for creating and editing automation workflows
 *
 * Features:
 * - Visual workflow builder with drag-and-drop cards
 * - Step-by-step configuration (triggers, actions, conditions)
 * - Integration with external apps (Gmail, Slack, GitHub, etc.)
 * - Workflow testing before publishing
 * - Edit mode for existing workflows
 * - Real-time validation and error checking
 */
function CreateWorkflowContent() {
	// Hooks
	const dispatch = useDispatch(); // Redux dispatcher
	const router = useRouter(); // Next.js router for navigation
	const searchParams = useSearchParams(); // URL query parameters

	// Redux state selectors - Get data from global store
	const workflow = useSelector((state: any) => state.workflowApp.workflow); // Current workflow being built
	const steps: Step[] = useSelector((state: any) => state.workflowApp.steps); // UI steps in builder
	const { stepId, stepType } = useSelector((state: any) => state.workflowApp.cardState); // Currently selected step
	const cardStatus = useSelector((state: any) => state.workflowApp.cardStatus); // Side panel open/close state
	const userDetails = useSelector((state: any) => state.workflowApp.user); // Authenticated user data

	// Local component state
	const [isWorkflowTested, setIsWorkflowTested] = React.useState(false); // Track if workflow passed testing
	const [isTestingWorkflow, setIsTestingWorkflow] = React.useState(false); // Testing in progress flag
	const [isEditMode, setIsEditMode] = React.useState(false); // Create vs Edit mode
	const [workflowId, setWorkflowId] = React.useState<string | null>(null); // ID when editing existing workflow
	const [isLoadingWorkflow, setIsLoadingWorkflow] = React.useState(false); // Loading workflow data
	const [isLoadingUser, setIsLoadingUser] = React.useState(true); // Loading user data
	const [hasLoadedWorkflow, setHasLoadedWorkflow] = React.useState(false); // Prevent duplicate loads
	const [workflowNameInput, setWorkflowNameInput] = React.useState(""); // Controlled input for workflow name

	/**
	 * Interface: Step structure in the UI builder
	 * Represents a simplified version of a workflow step for display purposes
	 */
	interface Step {
		stepId: string; // Unique identifier for this step
		stepType: string; // Type: trigger, action, or condition
		// Additional properties may be added as needed
	}

	/**
	 * Effect: Fetch user details on component mount
	 * Ensures user data is loaded before workflow operations
	 * Redirects to login if user authentication fails
	 */
	useEffect(() => {
		const getUserDetails = async () => {
			// Only fetch if user details are missing from Redux store
			if (!userDetails || !userDetails.user || !userDetails.user.id) {
				try {
					setIsLoadingUser(true);
					const data = await apiClient.get(API_ENDPOINTS.getUser);
					dispatch(setUser(data)); // Store in Redux
				} catch (error) {
					console.error("Error fetching user details:", error);
					// Redirect to login if user fetch fails (likely auth issue)
					router.push("/login");
				} finally {
					setIsLoadingUser(false);
				}
			} else {
				setIsLoadingUser(false);
			}
		};
		getUserDetails();
	}, []);

	/**
	 * Effect: Fetch available apps/integrations on component mount
	 * Loads list of available apps (Gmail, Slack, GitHub, etc.) for workflow builder
	 */
	useEffect(() => {
		const fetchApps = async () => {
			try {
				const data = await apiClient.get(API_ENDPOINTS.getApps);
				if (data) {
					dispatch(setApps(data)); // Store available apps in Redux
				}
			} catch (error) {
				console.error("Error fetching apps:", error);
			}
		};
		fetchApps();
	}, []);

	useEffect(() => {
		// Reset test status when workflow changes
		setIsWorkflowTested(false);
	}, [workflow]);

	// Sync input field with workflow name from Redux when workflow is loaded
	useEffect(() => {
		if (isEditMode && workflow.workflowName && workflow.workflowName !== workflowNameInput) {
			setWorkflowNameInput(workflow.workflowName);
		}
	}, [workflow.workflowName, isEditMode]);

	// Check if we're in edit mode and load workflow (only once)
	useEffect(() => {
		const id = searchParams.get("id");
		if (id && !isLoadingUser && userDetails?.user?.id && !hasLoadedWorkflow) {
			setIsEditMode(true);
			setWorkflowId(id);
			loadWorkflowForEdit(id);
		}
	}, [searchParams, isLoadingUser, userDetails, hasLoadedWorkflow]);

	const loadWorkflowForEdit = async (id: string) => {
		setIsLoadingWorkflow(true);
		try {
			const data = await apiClient.get(`/workflows/${id}`);

			// Backend might return 'name' or 'workflowName'
			const workflowName = data.name || data.workflowName || "";

			// Populate the workflow state
			dispatch(
				setWorkflow({
					workflowName: workflowName,
					steps: data.steps || [],
				})
			);

			// Recreate UI steps - replace all steps at once to avoid duplicates
			const uiSteps =
				data.steps?.map((step: any) => ({
					stepId: step.id,
					stepType: step.type,
					appName: step.appName,
				})) || [];
			dispatch(setSteps(uiSteps));

			// Add to staged apps - replace all at once to avoid duplicates
			// Check if user is actually connected to each app
			const stagedApps =
				data.steps?.map((step: any) => {
					const userApp = userDetails?.userApp?.find((app: any) => app.appName === step.appName);
					const isConnected = !!userApp;
					const isExpired = userApp?.expiresAt ? Date.now() > userApp.expiresAt : false;

					return {
						stepId: step.id,
						appName: step.appName,
						connected: isConnected,
						expired: isExpired,
						hasUser: isConnected,
					};
				}) || [];
			dispatch(setStagedApps(stagedApps));

			// In edit mode, workflow is already tested
			setIsWorkflowTested(true);
			setHasLoadedWorkflow(true);

			// Set the workflow name in local state
			setWorkflowNameInput(workflowName);
		} catch (error) {
			console.error("Error loading workflow for edit:", error);
			alert("Failed to load workflow. Redirecting to home.");
			router.push("/");
		} finally {
			setIsLoadingWorkflow(false);
		}
	};

	/**
	 * Handler: Update workflow name input field
	 * Controlled input for workflow name
	 */
	function handleWorkflowNameChange(event: React.ChangeEvent<HTMLInputElement>) {
		setWorkflowNameInput(event.target.value);
	}

	/**
	 * Handler: Submit and save workflow name
	 * Updates Redux store with the entered workflow name
	 */
	function handleWorkflowNameSubmit() {
		const wfName = workflowNameInput.trim();

		// Merge workflow name into existing workflow object
		const workflowData = {
			...workflow,
			workflowName: wfName,
		};

		dispatch(setWorkflow(workflowData)); // Update Redux store
	}

	/**
	 * Handler: Test workflow before publishing
	 * Validates all workflow steps and configuration
	 * Sends test request to backend to verify workflow can execute
	 * Must pass before workflow can be published
	 */
	async function handleTestWorkflow() {
		// Check if user is loaded
		if (!userDetails || !userDetails.user || !userDetails.user.id) {
			alert("User data not loaded. Please refresh the page.");
			return;
		}

		// Validate workflow name is provided
		if (!workflow.workflowName || workflow.workflowName.trim() === "") {
			alert("Please enter a workflow name before testing");
			return;
		}

		// Validate workflow has required step types
		const hasTrigger = workflow.steps.some((step: any) => step.type === "trigger");
		const hasAction = workflow.steps.some((step: any) => step.type === "action");

		if (!hasTrigger || !hasAction) {
			alert("Workflow must have at least one trigger and one action");
			return;
		}

		// Validate all steps have required fields
		for (const step of workflow.steps) {
			// Condition steps don't need appName or title
			if (step.type !== "condition") {
				if (!step.appName) {
					alert(`Step ${step.id} is missing an app selection`);
					return;
				}
				if (!step.title) {
					alert(`Step ${step.id} is missing an event selection`);
					return;
				}
			}

			if (step.type === "trigger" && !step.triggerId) {
				alert(`Step ${step.id} is missing a trigger ID`);
				return;
			}
			if (step.type === "action" && !step.actionId) {
				alert(`Step ${step.id} is missing an action ID`);
				return;
			}

			// Validate required configuration fields
			if (step.type === "action") {
				const actionConfig = getActionConfig(step.appName, step.title);
				if (actionConfig) {
					for (const field of actionConfig.fields) {
						if (field.required) {
							const value = step.config?.[field.name];
							if (!value || value === "") {
								alert(`Step ${step.id}: Please select or enter a value for "${field.label}"`);
								return;
							}
						}
					}
				}
			} else if (step.type === "trigger") {
				const triggerConfig = getTriggerConfig(step.appName, step.title);
				if (triggerConfig) {
					for (const field of triggerConfig.fields) {
						if (field.required) {
							const value = step.config?.[field.name];
							if (!value || value === "") {
								alert(`Step ${step.id}: Please select or enter a value for "${field.label}"`);
								return;
							}
						}
					}
				}
			} else if (step.type === "condition") {
				// Validate condition steps
				if (!step.conditions || step.conditions.length === 0) {
					alert(`Step ${step.id}: Condition has no rules defined. Please configure at least one condition.`);
					return;
				}

				// Validate each condition rule
				let hasIfThen = false;
				let hasElse = false;

				for (const condition of step.conditions) {
					// Check for if-then conditions
					if (condition.if && condition.then) {
						hasIfThen = true;
						// Validate that the target step exists
						const targetExists = workflow.steps.some((s: any) => s.id === condition.then);
						if (!targetExists) {
							alert(`Step ${step.id}: Condition references non-existent step ${condition.then}`);
							return;
						}
						// Check if condition.then is empty
						if (!condition.then || condition.then === "") {
							alert(`Step ${step.id}: Please select a target step for the condition`);
							return;
						}
					}
					// Check for else condition
					if (condition.else !== undefined) {
						hasElse = true;
						if (condition.else && condition.else !== "") {
							const targetExists = workflow.steps.some((s: any) => s.id === condition.else);
							if (!targetExists) {
								alert(`Step ${step.id}: Condition else clause references non-existent step ${condition.else}`);
								return;
							}
						}
					}
				}

				// Ensure at least one if-then rule exists
				if (!hasIfThen) {
					alert(`Step ${step.id}: Condition must have at least one IF-THEN rule configured`);
					return;
				}
			}
		}

		setIsTestingWorkflow(true);

		// Convert to the new JSON format
		const workflowPayload = {
			userId: userDetails.user.id,
			workflow: {
				workflowName: workflow.workflowName,
				steps: workflow.steps,
			},
		};

		try {
			const result = await apiClient.post(API_ENDPOINTS.testWorkflow, workflowPayload);
			setIsWorkflowTested(true);
			alert("Workflow tested successfully! You can now publish it.");
		} catch (error) {
			console.error("Error testing workflow:", error);
			setIsWorkflowTested(false);
			alert("Workflow test failed. Please check your configuration and try again.");
		} finally {
			setIsTestingWorkflow(false);
		}
	}

	async function handlePublishWorkflow() {
		// Check if workflow has been tested
		if (!isWorkflowTested) {
			alert("Please test the workflow first before publishing");
			return;
		}

		if (isEditMode && workflowId) {
			await handleUpdateWorkflow();
		} else {
			await handleCreateWorkflow();
		}
	}

	async function handleCreateWorkflow() {
		// Safety check for user data
		if (!userDetails || !userDetails.user || !userDetails.user.id) {
			alert("User data not loaded. Please refresh the page.");
			return;
		}

		const workflowPayload = {
			userId: userDetails.user.id,
			workflow: {
				workflowName: workflow.workflowName,
				steps: workflow.steps,
			},
		};

		try {
			const result = await apiClient.post(API_ENDPOINTS.createWorkflow, workflowPayload);
			alert("Workflow published successfully!");
			router.push("/");
		} catch (error) {
			console.error("Error publishing workflow:", error);
			alert("Failed to publish workflow. Please try again.");
		}
	}

	async function handleUpdateWorkflow() {
		if (!workflowId) return;

		const workflowPayload = {
			workflow: {
				workflowName: workflow.workflowName,
				steps: workflow.steps,
			},
		};

		try {
			const result = await apiClient.patch(API_ENDPOINTS.updateWorkflow(workflowId), workflowPayload);
			alert("Workflow updated successfully!");
			router.push("/");
		} catch (error) {
			console.error("Error updating workflow:", error);
			alert("Failed to update workflow. Please try again.");
		}
	}

	if (isLoadingUser || isLoadingWorkflow) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">{isLoadingUser ? "Loading user data..." : "Loading workflow..."}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen flex flex-col gap-12 items-center justify-start p-4 m-2 bg-gray-50 rounded-lg">
			{cardStatus && <SidePanel stepId={stepId} stepType={stepType} />}

			<div className="max-w-4xl flex gap-x-12 flex-row items-center justify-evenly p-2 m-2 text-black border-2 border-indigo-500/50 rounded-lg shadow-lg">
				<div>
					<input
						className="bg-gray-200 p-2 m-2 rounded-lg focus:outline-none border-1"
						placeholder="Enter workflow name"
						id="workflow-name"
						value={workflowNameInput}
						onChange={handleWorkflowNameChange}
					></input>

					<button
						onClick={handleWorkflowNameSubmit}
						className="bg-gray-200 hover:bg-indigo-700 hover:text-white hover:cursor-pointer text-black font-semibold p-2 m-2 rounded-lg transition duration-300 ease-in-out"
					>
						Submit
					</button>
				</div>

				<button
					onClick={handleTestWorkflow}
					disabled={isTestingWorkflow}
					className={`${
						isTestingWorkflow
							? "bg-gray-400 cursor-not-allowed"
							: isWorkflowTested
							? "bg-green-500 text-white"
							: "bg-gray-200 hover:bg-indigo-700 hover:text-white hover:cursor-pointer text-black"
					} font-semibold p-2 m-2 rounded-lg transition duration-300 ease-in-out`}
				>
					{isTestingWorkflow ? "Testing..." : isWorkflowTested ? "Test Passed" : "Test Workflow"}
				</button>

				<button
					onClick={handlePublishWorkflow}
					disabled={!isWorkflowTested}
					className={`${
						!isWorkflowTested
							? "bg-gray-400 cursor-not-allowed opacity-50"
							: "bg-gray-200 hover:bg-indigo-700 hover:text-white hover:cursor-pointer text-black"
					} font-semibold p-2 m-2 rounded-lg transition duration-300 ease-in-out`}
					title={
						!isWorkflowTested
							? "Please test the workflow first"
							: isEditMode
							? "Update workflow"
							: "Publish workflow"
					}
				>
					{isEditMode ? "Update Workflow" : "Publish Workflow"}
				</button>
				<Link href={"/"}>
					<button className="m-2 p-2 rounded-lg hover:cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out">
						Cancel
					</button>
				</Link>
			</div>

			<div className="min-h-screen border-gray-500/50 rounded-lg shadow-xl min-w-3xl">
				{steps.map((step: Step) => (
					<AppCard key={step.stepId} stepId={step.stepId} stepType={step.stepType} />
				))}
			</div>
		</div>
	);
}

/**
 * Wrapper component with Suspense boundary
 * Required for Next.js 15 when using useSearchParams()
 */
export default function CreateWorkflow() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gray-50 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading...</p>
					</div>
				</div>
			}
		>
			<CreateWorkflowContent />
		</Suspense>
	);
}
