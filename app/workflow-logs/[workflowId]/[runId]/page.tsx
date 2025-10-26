"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../lib/config";
import { hasToken, isTokenExpired, removeToken } from "../../../utils/tokenUtils";

/**
 * Interface: Individual log entry
 * Represents a single event during workflow execution
 */
interface LogEntry {
	id: number; // Unique log entry ID
	eventType: string; // Type of event (e.g., action_executed, trigger_fired)
	details: any; // Event-specific data and metadata
	createdAt: string; // ISO timestamp of log creation
}

/**
 * Interface: Complete workflow run details
 * Contains all information about a single workflow execution
 */
interface WorkflowRunDetails {
	workflowRunId: number; // ID of this execution run
	workflow: {
		id: number; // Parent workflow ID
		name: string; // Parent workflow name
	};
	status: string; // Execution status (success, failed, running)
	startedAt: string; // ISO timestamp when execution started
	finishedAt: string; // ISO timestamp when execution finished
	logs: LogEntry[]; // Chronological array of log entries
}

/**
 * Workflow Run Details Page Component
 * Displays detailed execution logs for a single workflow run
 *
 * Features:
 * - Shows complete execution timeline
 * - Displays all logged events in chronological order
 * - Formats event details (handles long email bodies, JSON payloads)
 * - Shows execution duration and status
 * - Special rendering for trigger data (email snippets, bodies, etc.)
 */
export default function WorkflowRunDetailsPage() {
	const router = useRouter();
	const params = useParams();
	const workflowId = params.workflowId as string;
	const runId = params.runId as string;

	const [runDetails, setRunDetails] = useState<WorkflowRunDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!hasToken() || isTokenExpired()) {
			removeToken();
			router.push("/login");
			return;
		}
		loadRunDetails();
	}, [workflowId, runId, router]);

	const loadRunDetails = async () => {
		setIsLoading(true);
		try {
			const data: WorkflowRunDetails = await apiClient.get(API_ENDPOINTS.getWorkflowRunLogs(runId));
			console.log("Run details fetched:", data);
			setRunDetails(data);
		} catch (error) {
			console.error("Error loading run details:", error);
			setRunDetails(null);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "success":
				return "bg-green-100 text-green-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "running":
				return "bg-blue-100 text-blue-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatTimestamp = (timestamp: string) => {
		return new Date(timestamp).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const calculateDuration = (startedAt: string, finishedAt: string) => {
		const start = new Date(startedAt).getTime();
		const end = new Date(finishedAt).getTime();
		const durationMs = end - start;

		if (durationMs < 1000) return `${durationMs}ms`;
		if (durationMs < 60000) return `${(durationMs / 1000).toFixed(2)}s`;
		return `${(durationMs / 60000).toFixed(2)}m`;
	};

	const formatEventType = (eventType: string) => {
		return eventType
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	/**
	 * Helper: Render log details with special formatting
	 * Handles long text fields like email bodies and snippets
	 * Provides scrollable containers for lengthy content
	 * Separates different types of data for better readability
	 *
	 * @param details - The log entry details object
	 * @returns JSX element with formatted details
	 */
	const renderLogDetails = (details: any) => {
		// Check if details contains trigger data with body/snippet (common for email triggers)
		const hasTrigger = details.trigger || details.triggerData?.trigger;
		const triggerData = details.trigger || details.triggerData?.trigger;

		if (hasTrigger && triggerData) {
			// Extract long text fields for special rendering
			const { body, snippet, ...otherFields } = triggerData;

			return (
				<div className="mt-3 space-y-3">
					{/* Display other fields normally */}
					{Object.keys(otherFields).length > 0 && (
						<div className="bg-gray-50 p-4 rounded border border-gray-200">
							<pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
								{JSON.stringify(otherFields, null, 2)}
							</pre>
						</div>
					)}

					{/* Display snippet with controlled height */}
					{snippet && (
						<div className="bg-gray-50 p-4 rounded border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 mb-2">Snippet:</p>
							<div className="max-h-24 overflow-y-auto">
								<p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{snippet}</p>
							</div>
						</div>
					)}

					{/* Display body with controlled height and scroll */}
					{body && (
						<div className="bg-gray-50 p-4 rounded border border-gray-200">
							<p className="text-xs font-semibold text-gray-600 mb-2">Body:</p>
							<div className="max-h-48 overflow-y-auto">
								<p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{body}</p>
							</div>
						</div>
					)}

					{/* Display other root-level fields */}
					{Object.keys(details).filter((key) => key !== "trigger" && key !== "triggerData").length > 0 && (
						<div className="bg-gray-50 p-4 rounded border border-gray-200">
							<pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
								{JSON.stringify(
									Object.fromEntries(
										Object.entries(details).filter(([key]) => key !== "trigger" && key !== "triggerData")
									),
									null,
									2
								)}
							</pre>
						</div>
					)}
				</div>
			);
		}

		// Default rendering for non-email logs
		return (
			<div className="bg-gray-50 p-4 rounded mt-3 border border-gray-200 max-h-64 overflow-y-auto">
				<pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
					{JSON.stringify(details, null, 2)}
				</pre>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading run details...</p>
				</div>
			</div>
		);
	}

	if (!runDetails) {
		return (
			<div className="min-h-screen bg-gray-50 rounded-lg flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900">Run not found</h2>
					<button
						onClick={() => router.push(`/workflow-logs/${workflowId}`)}
						className="mt-4 text-indigo-600 hover:text-indigo-800"
					>
						Back to Logs
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 rounded-lg">
			<div className="min-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => router.push(`/workflow-logs/${workflowId}`)}
						className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
					>
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Back to Logs
					</button>

					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{runDetails.workflow.name} - Run #{runDetails.workflowRunId}
							</h1>
							<div className="flex items-center space-x-4 mt-2">
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(runDetails.status)}`}
								>
									{runDetails.status.charAt(0).toUpperCase() + runDetails.status.slice(1)}
								</span>
								<span className="text-gray-600">
									Duration: {calculateDuration(runDetails.startedAt, runDetails.finishedAt)}
								</span>
							</div>
						</div>
						<div className="text-right text-sm text-gray-600">
							<div>
								<span className="font-medium">Started:</span> {formatTimestamp(runDetails.startedAt)}
							</div>
							<div>
								<span className="font-medium">Finished:</span> {formatTimestamp(runDetails.finishedAt)}
							</div>
						</div>
					</div>
				</div>

				{/* Execution Logs */}
				<div className="space-y-3">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Execution Logs</h2>
					{runDetails.logs.length === 0 ? (
						<div className="bg-white rounded-lg shadow-md p-12 text-center">
							<p className="text-gray-500">No logs found for this run.</p>
						</div>
					) : (
						runDetails.logs.map((log) => (
							<div key={log.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
								<div className="flex justify-between items-start mb-3">
									<span className="text-base font-medium text-indigo-600">
										{formatEventType(log.eventType)}
									</span>
									<span className="text-sm text-gray-500">{formatTimestamp(log.createdAt)}</span>
								</div>
								{log.details && Object.keys(log.details).length > 0 && renderLogDetails(log.details)}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
