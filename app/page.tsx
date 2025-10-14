"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkflowCard from "./components/WorkflowCard";
import { hasToken, isTokenExpired, removeToken } from "./utils/tokenUtils";

interface Workflow {
	id: string;
	name: string;
	description: string;
	status: "active" | "inactive" | "draft";
	createdAt: string;
	lastModified: string;
	nodeCount: number;
}

export default function Home() {
	const router = useRouter();
	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Check authentication on component mount
	useEffect(() => {
		if (!hasToken() || isTokenExpired()) {
			removeToken();
			router.push("/login");
			return;
		}
		loadWorkflows();
	}, [router]);

	const loadWorkflows = async () => {
		setIsLoading(true);
		try {
			// TODO: Replace with actual API call
			// const response = await fetch('/api/workflows', {
			//   headers: {
			//     'Authorization': getBearerToken()
			//   }
			// });
			// const data = await response.json();

			// Mock data for now
			const mockWorkflows: Workflow[] = [
				{
					id: "1",
					name: "Email Marketing Campaign",
					description: "Automated email sequence for new subscribers",
					status: "active",
					createdAt: "2024-01-15",
					lastModified: "2024-01-20",
					nodeCount: 8,
				},
				{
					id: "2",
					name: "User Onboarding",
					description: "Welcome new users with guided setup process",
					status: "draft",
					createdAt: "2024-01-18",
					lastModified: "2024-01-19",
					nodeCount: 5,
				},
				{
					id: "3",
					name: "Order Processing",
					description: "Handle order fulfillment and notifications",
					status: "inactive",
					createdAt: "2024-01-10",
					lastModified: "2024-01-15",
					nodeCount: 12,
				},
			];

			setWorkflows(mockWorkflows);
		} catch (error) {
			console.error("Error loading workflows:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateWorkflow = () => {
		// Redirect to workflow builder instead of creating via modal
		router.push("/create-workflow");
	};

	const handleEditWorkflow = (workflow: Workflow) => {
		// TODO: Navigate to workflow editor
		console.log("Edit workflow:", workflow);
		router.push(`/workflow/${workflow.id}/edit`);
	};

	const handleDeleteWorkflow = async (workflowId: string) => {
		if (!confirm("Are you sure you want to delete this workflow?")) return;

		try {
			// TODO: Replace with actual API call
			// await fetch(`/api/workflows/${workflowId}`, {
			//   method: 'DELETE',
			//   headers: {
			//     'Authorization': getBearerToken()
			//   }
			// });

			setWorkflows(workflows.filter((w) => w.id !== workflowId));
		} catch (error) {
			console.error("Error deleting workflow:", error);
		}
	};

	const handleDuplicateWorkflow = async (workflow: Workflow) => {
		try {
			// TODO: Replace with actual API call
			const duplicatedWorkflow: Workflow = {
				...workflow,
				id: Date.now().toString(),
				name: `${workflow.name} (Copy)`,
				status: "draft",
				createdAt: new Date().toISOString().split("T")[0],
				lastModified: new Date().toISOString().split("T")[0],
			};

			setWorkflows([duplicatedWorkflow, ...workflows]);
		} catch (error) {
			console.error("Error duplicating workflow:", error);
		}
	};

	if (isLoading) {
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
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
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
								onDuplicate={handleDuplicateWorkflow}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
