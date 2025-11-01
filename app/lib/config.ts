/**
 * API Configuration File
 * Central configuration for all API endpoints and URLs
 * Uses environment variables with fallback defaults for local development
 */

// Base URL configuration
export const BASE_URL = process.env.NEXT_PUBLIC_URI || "http://localhost:2000";
export const API_URL = `${BASE_URL}/api`;

// OAuth URLs for app integrations
export const OAUTH_URL = `${BASE_URL}/api/oauth`;

/**
 * API Endpoints Object
 * Contains all backend API endpoint paths
 * Organized by feature (User, Apps, Workflows, Logs, Integrations)
 *
 * Usage: import { API_ENDPOINTS } from './lib/config'
 * Example: await apiClient.get(API_ENDPOINTS.getUser)
 */
export const API_ENDPOINTS = {
	// User & Auth
	getUser: process.env.NEXT_PUBLIC_GET_USER_URI || "/user",
	login: process.env.NEXT_PUBLIC_LOGIN_URI || "/user/login",
	signup: process.env.NEXT_PUBLIC_SIGNUP_URI || "/user/signup",

	// Apps
	getApps: process.env.NEXT_PUBLIC_GET_APPS_URI || "/workflows/apps",
	deleteApp: (appName: string) => `/user/app/${appName}/delete`,
	// Workflows
	createWorkflow: "/workflows/create",
	getWorkflows: "/workflows",
	updateWorkflow: (id: string) => `/workflows/${id}`,
	deleteWorkflow: (id: string) => `/workflows/${id}`,
	toggleWorkflow: (id: string) => `/workflows/${id}/toggle`,
	testWorkflow: process.env.NEXT_PUBLIC_TEST_WORKFLOW || "/workflows/test",

	// Logs
	getWorkflowLogs: (workflowId: string) => `/logs/workflow/${workflowId}`,
	getWorkflowRunLogs: (workflowRunId: string) => `/logs/workflow-run/${workflowRunId}`,

	// Integrations
	integrations: {
		slack: {
			channels: "/integrations/slack/channels",
			users: "/integrations/slack/users",
			workspace: "/integrations/slack/workspace",
			me: "/integrations/slack/me",
		},
		gmail: {
			labels: "/integrations/gmail/labels",
			profile: "/integrations/gmail/profile",
		},
		github: {
			repos: "/integrations/github/repos",
			user: "/integrations/github/user",
			branches: (owner: string, repo: string) => `/integrations/github/repos/${owner}/${repo}/branches`,
		},
	},
};
