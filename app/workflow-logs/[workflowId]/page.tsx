"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "../../lib/api-client";
import { API_ENDPOINTS } from "../../lib/config";
import { hasToken, isTokenExpired, removeToken } from "../../utils/tokenUtils";

/**
 * Interface: Workflow execution run summary
 * Represents a single execution instance of a workflow
 */
interface WorkflowRun {
	id: number; // Unique run identifier
	status: string; // Execution status (success, failed, running, pending)
	startedAt: string; // ISO timestamp when execution started
	finishedAt: string; // ISO timestamp when execution finished
	logs: LogEntry[]; // Detailed log entries for this run
}

/**
 * Interface: Individual log entry
 * Represents a single event/action logged during workflow execution
 */
interface LogEntry {
	id: number; // Unique log entry ID
	eventType: string; // Type of event (e.g., trigger_fired, action_executed)
	details: any; // Event-specific data and metadata
	createdAt: string; // ISO timestamp of log creation
	workflowRun?: { id: number }; // Associated workflow run ID
}

/**
 * Interface: Workflow logs API response
 * Contains workflow info and all associated log entries
 */
interface WorkflowLogsData {
	workflowId: number; // ID of the workflow
	workflowName: string; // Name of the workflow
	totalLogs: number; // Total number of log entries
	logs: LogEntry[]; // Array of all log entries
}

/**
 * Workflow Logs Page Component
 * Displays execution history for a specific workflow
 *
 * Features:
 * - Lists all execution runs for a workflow
 * - Shows run status (success/failed/running)
 * - Displays execution duration
 * - Click to view detailed logs for each run
 * - Groups logs by workflow run
 */
export default function WorkflowLogsPage() {
	const router = useRouter();
	const params = useParams();
	const workflowId = params.workflowId as string;

	const [workflowName, setWorkflowName] = useState<string>("");
	const [runs, setRuns] = useState<WorkflowRun[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!hasToken() || isTokenExpired()) {
			removeToken();
			router.push("/login");
			return;
		}
		loadWorkflowLogs();
	}, [workflowId, router]);

	/**
	 * Loads and processes workflow execution logs from backend
	 * Groups individual log entries by workflow run
	 * Determines execution status from log events
	 * Sorts runs by start time (newest first)
	 */
	const loadWorkflowLogs = async () => {
		setIsLoading(true);
		try {
			const data: WorkflowLogsData = await apiClient.get(API_ENDPOINTS.getWorkflowLogs(workflowId));
			console.log("Workflow logs fetched:", data);

			setWorkflowName(data.workflowName);

			// Group logs by workflowRun.id to organize by execution instance
			const runMap = new Map<number, LogEntry[]>();
			data.logs.forEach((log) => {
				if (log.workflowRun?.id) {
					if (!runMap.has(log.workflowRun.id)) {
						runMap.set(log.workflowRun.id, []);
					}
					runMap.get(log.workflowRun.id)!.push(log);
				}
			});

			// Convert grouped logs to WorkflowRun objects
			const runsArray: WorkflowRun[] = Array.from(runMap.entries()).map(([runId, logs]) => {
				// Sort logs by timestamp to find start and end times
				const sortedLogs = logs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

				// Determine execution status from log event types
				let status = "pending";
				const completedLog = logs.find((l) => l.eventType === "workflow_execution_completed");
				const failedLog = logs.find((l) => l.eventType === "workflow_execution_failed");

				if (completedLog) status = "success";
				else if (failedLog) status = "failed";
				else status = "running";

				return {
					id: runId,
					status,
					startedAt: sortedLogs[0].createdAt, // First log timestamp
					finishedAt: sortedLogs[sortedLogs.length - 1].createdAt, // Last log timestamp
					logs: [], // Detailed logs loaded on individual run view
				};
			});

			// Sort runs by start time (newest first)
			runsArray.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

			setRuns(runsArray);
		} catch (error) {
			console.error("Error loading workflow logs:", error);
			setRuns([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewRunDetails = (runId: number) => {
		router.push(`/workflow-logs/${workflowId}/${runId}`);
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

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 rounded-lg flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading workflow logs...</p>
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
						onClick={() => router.push("/")}
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
						Back to Workflows
					</button>
					<h1 className="text-3xl font-bold text-gray-900">{workflowName} - Execution Logs</h1>
					<p className="mt-2 text-gray-600">
						{runs.length} {runs.length === 1 ? "run" : "runs"} found
					</p>
				</div>

				{/* Workflow Runs List */}
				{runs.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-lg shadow-md">
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
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">No execution logs found</h3>
						<p className="mt-1 text-sm text-gray-500">
							This workflow hasn't been executed yet. Activate it to start logging executions.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{runs.map((run) => (
							<div
								key={run.id}
								onClick={() => handleViewRunDetails(run.id)}
								className="bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-indigo-500 transition-all"
							>
								<div className="flex justify-between items-center">
									<div className="flex items-center space-x-4">
										<h3 className="text-lg font-semibold text-gray-900">Run #{run.id}</h3>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}
										>
											{run.status.charAt(0).toUpperCase() + run.status.slice(1)}
										</span>
									</div>
									<div className="flex items-center space-x-6 text-sm text-gray-600">
										<div>
											<span className="font-medium">Started:</span> {formatTimestamp(run.startedAt)}
										</div>
										<div>
											<span className="font-medium">Duration:</span>{" "}
											{calculateDuration(run.startedAt, run.finishedAt)}
										</div>
										<svg
											className="w-5 h-5 text-indigo-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
