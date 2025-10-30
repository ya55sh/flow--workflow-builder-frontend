"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Interface: Workflow data structure
 * Represents a workflow in the dashboard grid
 */
interface Workflow {
	id: string; // Unique workflow identifier
	name: string; // User-defined workflow name
	description: string; // Brief description of workflow purpose
	status: "active" | "inactive" | "draft"; // Current execution status
	createdAt: string; // Creation date
	lastModified: string; // Last modification date
	nodeCount: number; // Number of steps in workflow
}

/**
 * Props interface for WorkflowCard component
 * Defines callback handlers for workflow actions
 */
interface WorkflowCardProps {
	workflow: Workflow; // The workflow data to display
	onEdit: (workflow: Workflow) => void; // Handler for edit action
	onDelete: (workflowId: string) => void; // Handler for delete action
	onToggle: (workflowId: string, currentStatus: "active" | "inactive" | "draft") => void; // Handler for activate/deactivate
	onViewLogs: (workflowId: string) => void; // Handler for viewing execution logs
}

/**
 * Workflow Card Component
 * Displays a single workflow with its details and action menu
 *
 * Features:
 * - Shows workflow name, description, and status
 * - Displays creation/modification dates
 * - Shows number of workflow steps
 * - Action menu with Edit, Toggle, View Logs, and Delete options
 * - Status badge with color coding
 * - Dropdown menu with outside-click handling
 */
export default function WorkflowCard({ workflow, onEdit, onDelete, onToggle, onViewLogs }: WorkflowCardProps) {
	const [showActions, setShowActions] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showActions) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (!menuRef.current) return;
			if (!menuRef.current.contains(event.target as Node)) {
				setShowActions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showActions]);

	/**
	 * Helper: Get Tailwind CSS classes for status badge based on workflow status
	 * @param status - The workflow status
	 * @returns CSS class string for background and text color
	 */
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800"; // Green for active workflows
			case "inactive":
				return "bg-gray-100 text-gray-800"; // Gray for inactive workflows
			case "draft":
				return "bg-yellow-100 text-yellow-800"; // Yellow for draft workflows
			default:
				return "bg-gray-100 text-gray-800"; // Default gray
		}
	};

	/**
	 * Helper: Format date string to user-friendly format
	 * @param dateString - ISO date string from backend
	 * @returns Formatted date like "Jan 15, 2025"
	 */
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-6">
			<div className="flex justify-between items-start mb-4">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
					<p className="text-gray-600 text-sm mb-3">{workflow.description}</p>
				</div>
				<div className="relative" ref={menuRef}>
					<button
						onClick={() => setShowActions(!showActions)}
						className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
						</svg>
					</button>
					{showActions && (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
							<div className="py-1">
								<button
									onClick={() => {
										onEdit(workflow);
										setShowActions(false);
									}}
									className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									Edit
								</button>
								<button
									onClick={() => {
										onToggle(workflow.id, workflow.status);
										setShowActions(false);
									}}
									className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
										/>
									</svg>
									{workflow.status === "active" ? "Deactivate" : "Activate"}
								</button>
								<button
									onClick={() => {
										onViewLogs(workflow.id);
										setShowActions(false);
									}}
									className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									View Logs
								</button>
								<button
									onClick={() => {
										onDelete(workflow.id);
										setShowActions(false);
									}}
									className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
								>
									<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
									Delete
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center space-x-4">
					<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
						{workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
					</span>
					<span className="text-sm text-gray-500">{workflow.nodeCount} nodes</span>
				</div>
				<div className="text-xs text-gray-400 whitespace-nowrap">Modified {formatDate(workflow.lastModified)}</div>
			</div>
		</div>
	);
}
