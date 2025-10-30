"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkflowCard from "./components/WorkflowCard";
import { hasToken, isTokenExpired, removeToken } from "./utils/tokenUtils";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "./features/workflowSlice";
import { apiClient } from "./lib/api-client";
import { API_ENDPOINTS } from "./lib/config";

/**
 * Interface representing a workflow's frontend structure
 * Maps the backend workflow data to the UI representation
 */
interface Workflow {
	id: string; // Unique identifier from database
	name: string; // User-defined workflow name
	description: string; // Brief description of workflow purpose
	status: "active" | "inactive" | "draft"; // Current workflow execution status
	createdAt: string; // ISO date string of creation
	lastModified: string; // ISO date string of last update
	nodeCount: number; // Number of steps in the workflow
}

/**
 * Home Page Component - Main Dashboard
 * Displays all user workflows and provides workflow management capabilities
 * Features: Create, Edit, Delete, Toggle (activate/deactivate), View Logs
 */
export default function Home() {
	// Next.js router for navigation
	const router = useRouter();
	// Redux dispatcher for state updates
	const dispatch = useDispatch();

	// Local state management
	const [workflows, setWorkflows] = useState<Workflow[]>([]); // List of user's workflows
	const [isLoading, setIsLoading] = useState(true); // Loading state for async operations
	const [isMounted, setIsMounted] = useState(false); // Client-side hydration tracking

	// Get user data from Redux store
	const user = useSelector((state: any) => state.workflowApp.user);

	/**
	 * Effect: Ensure component is fully mounted on client side
	 * Prevents hydration mismatch between server and client rendering
	 */
	useEffect(() => {
		setIsMounted(true);
	}, []);

	/**
	 * Effect: Authentication check and data loading
	 * Runs after component mounts on client side
	 * - Verifies user authentication
	 * - Redirects to login if token is missing or expired
	 * - Loads user workflows and details if authenticated
	 */
	useEffect(() => {
		if (!isMounted) return;

		// Check if token exists and is valid
		if (!hasToken() || isTokenExpired()) {
			removeToken();
			router.push("/login");
			return;
		}
		// Load data if authenticated
		loadWorkflows();
		getUserDetails();
	}, [router, isMounted]);

	/**
	 * Fetches user details from backend if not already in Redux store
	 * Retrieves user ID, email, and connected app integrations
	 * Updates Redux store with fetched user data
	 */
	const getUserDetails = async () => {
		// Only fetch if user data is incomplete or missing
		if (!user || !user.email || !user.userApp || user.userApp.length === 0) {
			try {
				const data = await apiClient.get(API_ENDPOINTS.getUser);
				console.log("User details fetched:", data);

				// Combine user data from API response into unified structure
				const userData = {
					id: data?.user?.id?.toString() || "",
					email: data?.user?.email || "",
					userApp: data?.userApp || [], // Array of connected integrations
				};

				// Store user data in Redux for global access
				dispatch(setUser(userData));
			} catch (error) {
				console.error("Error fetching user details:", error);
			}
		}
	};

	/**
	 * Fetches all workflows belonging to the authenticated user
	 * Maps backend workflow structure to frontend-friendly format
	 * Handles errors gracefully by showing empty state
	 */
	const loadWorkflows = async () => {
		setIsLoading(true);
		try {
			const data = await apiClient.get(API_ENDPOINTS.getWorkflows);
			console.log("Workflows fetched:", data);

			// Map backend response to frontend format
			// Handles different field names from backend (_id vs id, workflowName vs name)
			const mappedWorkflows: Workflow[] = data.map((wf: any) => ({
				id: wf._id || wf.id, // MongoDB uses _id
				name: wf.workflowName || wf.name, // Support both field names
				description: wf.description || "No description",
				status: wf.isActive ? "active" : "inactive", // Convert boolean to status string
				createdAt: wf.createdAt ? new Date(wf.createdAt).toISOString().split("T")[0] : "",
				lastModified: wf.updatedAt ? new Date(wf.updatedAt).toISOString().split("T")[0] : "",
				nodeCount: wf.steps?.length || 0, // Count workflow steps/nodes
			}));

			setWorkflows(mappedWorkflows);
		} catch (error) {
			console.error("Error loading workflows:", error);
			// Show empty state on error instead of crashing
			setWorkflows([]);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handler: Navigate to workflow creation page
	 * Opens the workflow builder for creating a new workflow from scratch
	 */
	const handleCreateWorkflow = () => {
		router.push("/create-workflow");
	};

	/**
	 * Handler: Navigate to workflow edit page
	 * Opens the workflow builder in edit mode with pre-filled data
	 * @param workflow - The workflow object to edit
	 */
	const handleEditWorkflow = (workflow: Workflow) => {
		console.log("Edit workflow:", workflow);
		// Pass workflow ID as query parameter for loading existing data
		router.push(`/create-workflow?id=${workflow.id}`);
	};

	/**
	 * Handler: Delete a workflow
	 * Prompts user for confirmation before permanent deletion
	 * Updates UI optimistically after successful deletion
	 * @param workflowId - ID of the workflow to delete
	 */
	const handleDeleteWorkflow = async (workflowId: string) => {
		// Confirm before permanent deletion
		if (!confirm("Are you sure you want to delete this workflow?")) return;

		try {
			// Call backend API to delete workflow
			await apiClient.delete(API_ENDPOINTS.deleteWorkflow(workflowId));
			console.log("Workflow deleted successfully");

			// Remove from UI immediately (optimistic update)
			setWorkflows(workflows.filter((w) => w.id !== workflowId));
			alert("Workflow deleted successfully!");
		} catch (error) {
			console.error("Error deleting workflow:", error);
			alert("Failed to delete workflow. Please try again.");
		}
	};

	/**
	 * Handler: Navigate to workflow execution logs page
	 * Shows detailed execution history and logs for a specific workflow
	 * @param workflowId - ID of the workflow to view logs for
	 */
	const handleViewLogs = (workflowId: string) => {
		router.push(`/workflow-logs/${workflowId}`);
	};

	/**
	 * Handler: Toggle workflow active/inactive status
	 * Active workflows run automatically when triggered
	 * Inactive workflows are paused and won't execute
	 * @param workflowId - ID of the workflow to toggle
	 * @param currentStatus - Current status of the workflow
	 */
	const handleToggleWorkflow = async (workflowId: string, currentStatus: "active" | "inactive" | "draft") => {
		try {
			const isActive = currentStatus === "active";
			const newStatus = !isActive; // Toggle the status

			// Update status on backend
			await apiClient.patch(API_ENDPOINTS.toggleWorkflow(workflowId), {
				isActive: newStatus,
			});

			console.log(`Workflow ${workflowId} toggled to ${newStatus ? "active" : "inactive"}`);

			// Update UI optimistically
			setWorkflows(
				workflows.map((w) => (w.id === workflowId ? { ...w, status: newStatus ? "active" : "inactive" } : w))
			);

			alert(`Workflow ${newStatus ? "activated" : "deactivated"} successfully!`);
		} catch (error) {
			console.error("Error toggling workflow:", error);
			alert("Failed to toggle workflow status. Please try again.");
		}
	};

	// Show loading state while checking auth or fetching data
	if (!isMounted || isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading workflows...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 rounded-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">My Workflows</h1>
						<p className="mt-2 text-gray-600">Create and manage your automation workflows</p>
					</div>
					<button
						onClick={handleCreateWorkflow}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 hover:cursor-pointer"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						<span>Create Workflow</span>
					</button>
				</div>

				{/* Workflows Grid */}
				{workflows.length === 0 ? (
					<div className="text-center py-12">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">You don't have any workflows yet</h3>
						<p className="mt-1 text-sm text-gray-500">Get started by creating a new workflow.</p>
						<div className="mt-6">
							<button
								onClick={handleCreateWorkflow}
								className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
							>
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Create Workflow
							</button>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{workflows.map((workflow) => (
							<WorkflowCard
								key={workflow.id}
								workflow={workflow}
								onEdit={handleEditWorkflow}
								onDelete={handleDeleteWorkflow}
								onToggle={handleToggleWorkflow}
								onViewLogs={handleViewLogs}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
