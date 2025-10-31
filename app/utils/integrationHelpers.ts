/**
 * Integration Helper Functions
 * Utility functions for fetching data from various integration APIs
 *
 * Supports:
 * - Slack: Channels, Users
 * - Gmail: Labels
 * - GitHub: Repositories, Branches
 * - Generic: Any endpoint via fetchDropdownData
 *
 * Used by: SidePanel component for populating dropdown fields
 */
import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/config";

/**
 * Fetch Slack Channels
 * Retrieves list of Slack channels user has access to
 * @returns Array of Slack channel objects
 */
export async function fetchSlackChannels() {
	try {
		const response = await apiClient.get<{ channels: any[] }>(API_ENDPOINTS.integrations.slack.channels);
		return response.channels || [];
	} catch (error: any) {
		console.error("Error fetching Slack channels:", {
			message: error.message,
			response: error.response?.data,
			status: error.response?.status,
		});
		return [];
	}
}

export async function fetchSlackUsers() {
	try {
		const response = await apiClient.get<{ users: any[] }>(API_ENDPOINTS.integrations.slack.users);
		return response.users || [];
	} catch (error: any) {
		console.error("Error fetching Slack users:", {
			message: error.message,
			response: error.response?.data,
			status: error.response?.status,
		});
		return [];
	}
}

// Gmail Integration Helper Functions
export async function fetchGmailLabels() {
	try {
		const response = await apiClient.get<{ labels: any[] }>(API_ENDPOINTS.integrations.gmail.labels);
		return response.labels || [];
	} catch (error) {
		console.error("Error fetching Gmail labels:", error);
		return [];
	}
}

// GitHub Integration Helper Functions
export async function fetchGithubRepos() {
	try {
		const response = await apiClient.get<{ repos: any[] }>(API_ENDPOINTS.integrations.github.repos);
		return response.repos || [];
	} catch (error) {
		console.error("Error fetching GitHub repos:", error);
		return [];
	}
}

export async function fetchGithubBranches(owner: string, repo: string) {
	try {
		const response = await apiClient.get<{ branches: any[] }>(
			API_ENDPOINTS.integrations.github.branches(owner, repo)
		);
		return response.branches || [];
	} catch (error) {
		console.error("Error fetching GitHub branches:", error);
		return [];
	}
}

/**
 * Generic Dropdown Data Fetcher
 * Maps endpoint paths to specific fetch functions
 * Falls back to direct API call if endpoint not in map
 *
 * @param endpoint - API endpoint path
 * @returns Array of data items for dropdown options
 */
export async function fetchDropdownData(endpoint: string): Promise<any[]> {
	const endpointMap: Record<string, () => Promise<any[]>> = {
		"/integrations/slack/channels": () => fetchSlackChannels(),
		"/integrations/slack/users": () => fetchSlackUsers(),
		"/integrations/gmail/labels": () => fetchGmailLabels(),
		"/integrations/github/repos": () => fetchGithubRepos(),
	};

	const fetchFunction = endpointMap[endpoint];
	if (fetchFunction) {
		return await fetchFunction();
	}

	// If not in map, try direct fetch
	try {
		const response = await apiClient.get<any>(endpoint);
		return response || [];
	} catch (error) {
		console.error(`Error fetching from ${endpoint}:`, error);
		return [];
	}
}
