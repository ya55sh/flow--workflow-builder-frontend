// Configuration schemas for all triggers and actions

export type FieldType = "text" | "textarea" | "dropdown" | "number";

export interface ConfigField {
	name: string;
	label: string;
	type: FieldType;
	required: boolean;
	placeholder?: string;
	endpoint?: string; // For dropdown fields - API endpoint to fetch options
	displayKey?: string; // Key to display in dropdown (e.g., 'name', 'realName')
	valueKey?: string; // Key to use as value (e.g., 'id', 'login')
	options?: string[]; // For dropdown fields - static options array
}

export interface ActionConfig {
	fields: ConfigField[];
}

export interface TriggerConfig {
	fields: ConfigField[];
}

export const ActionConfigs: Record<string, Record<string, ActionConfig>> = {
	slack: {
		send_dm: {
			fields: [
				{
					name: "userId",
					label: "User",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/users",
					displayKey: "realName",
					valueKey: "id",
				},
				{
					name: "text",
					label: "Message",
					type: "textarea",
					required: true,
					placeholder: "You received an email: {{trigger.subject}}",
				},
			],
		},
		send_channel_message: {
			fields: [
				{
					name: "channel",
					label: "Channel",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
				{
					name: "text",
					label: "Message",
					type: "textarea",
					required: true,
					placeholder: "Enter your message here",
				},
			],
		},
		update_message: {
			fields: [
				{
					name: "channel",
					label: "Channel",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
				{
					name: "messageTs",
					label: "Message Timestamp",
					type: "text",
					required: true,
					placeholder: "{{trigger.messageTs}}",
				},
				{
					name: "text",
					label: "New Message Text",
					type: "textarea",
					required: true,
				},
			],
		},
		add_reaction: {
			fields: [
				{
					name: "channel",
					label: "Channel",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
				{
					name: "messageTs",
					label: "Message Timestamp",
					type: "text",
					required: true,
					placeholder: "{{trigger.messageTs}}",
				},
				{
					name: "reactionName",
					label: "Reaction",
					type: "text",
					required: true,
					placeholder: "thumbsup",
				},
			],
		},
	},
	gmail: {
		send_email: {
			fields: [
				{
					name: "to",
					label: "To",
					type: "text",
					required: true,
					placeholder: "recipient@example.com",
				},
				{
					name: "subject",
					label: "Subject",
					type: "text",
					required: true,
					placeholder: "Email subject",
				},
				{
					name: "body",
					label: "Body",
					type: "textarea",
					required: true,
					placeholder: "Email content",
				},
			],
		},
		reply_to_email: {
			fields: [
				{
					name: "messageId",
					label: "Message ID",
					type: "text",
					required: true,
					placeholder: "{{trigger.messageId}}",
				},
				{
					name: "threadId",
					label: "Thread ID",
					type: "text",
					required: true,
					placeholder: "{{trigger.threadId}}",
				},
				{
					name: "body",
					label: "Reply Body",
					type: "textarea",
					required: true,
					placeholder: "Your reply",
				},
			],
		},
		add_label_to_email: {
			fields: [
				{
					name: "messageId",
					label: "Message ID",
					type: "text",
					required: true,
					placeholder: "{{trigger.messageId}}",
				},
				{
					name: "labelId",
					label: "Label",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/gmail/labels",
					displayKey: "name",
					valueKey: "id",
				},
			],
		},
		star_email: {
			fields: [
				{
					name: "messageId",
					label: "Message ID",
					type: "text",
					required: true,
					placeholder: "{{trigger.messageId}}",
				},
			],
		},
	},
	github: {
		create_issue: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
				{
					name: "title",
					label: "Issue Title",
					type: "text",
					required: true,
					placeholder: "Bug report title or use variable",
				},
				{
					name: "body",
					label: "Description",
					type: "textarea",
					required: false,
					placeholder: "Issue description or use variable",
				},
			],
		},
		add_comment_to_issue: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
				{
					name: "issue_number",
					label: "Issue Number",
					type: "number",
					required: true,
					placeholder: "Enter issue number (e.g., 42)",
				},
				{
					name: "comment",
					label: "Comment",
					type: "textarea",
					required: true,
					placeholder: "Your comment or use variable",
				},
			],
		},
		close_issue: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
				{
					name: "issue_number",
					label: "Issue Number",
					type: "number",
					required: true,
					placeholder: "Enter issue number (e.g., 42)",
				},
			],
		},
		assign_issue: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
				{
					name: "issue_number",
					label: "Issue Number",
					type: "number",
					required: true,
					placeholder: "Enter issue number (e.g., 42)",
				},
				{
					name: "assignees",
					label: "Assignees",
					type: "text",
					required: true,
					placeholder: "username1, username2 or use variable",
				},
			],
		},
	},
	webhook: {
		send_webhook: {
			fields: [
				{
					name: "url",
					label: "Webhook URL",
					type: "text",
					required: true,
					placeholder: "https://webhook.site/xxxxx or https://discord.com/api/webhooks/...",
				},
				{
					name: "method",
					label: "HTTP Method",
					type: "dropdown",
					required: false,
					placeholder: "POST",
					options: ["POST"],
				},
				{
					name: "payload",
					label: "Payload",
					type: "textarea",
					required: false,
					placeholder:
						'Enter plain text or JSON.\nSlack: Plain text auto-wraps in {"text": "..."}\nOther: {"content": "Email from {{trigger.from}}"}',
				},
			],
		},
	},
};

export const TriggerConfigs: Record<string, Record<string, TriggerConfig>> = {
	gmail: {
		new_email: {
			fields: [],
		},
		email_labeled: {
			fields: [
				{
					name: "labelId",
					label: "Label",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/gmail/labels",
					displayKey: "name",
					valueKey: "id",
				},
			],
		},
		email_starred: {
			fields: [],
		},
		email_replied: {
			fields: [],
		},
	},
	slack: {
		new_channel_message: {
			fields: [
				{
					name: "channel",
					label: "Channel",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
			],
		},
		new_reaction: {
			fields: [
				{
					name: "channelId",
					label: "Channel",
					type: "dropdown",
					required: false,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
				{
					name: "reactionName",
					label: "Reaction Name",
					type: "text",
					required: false,
					placeholder: "thumbsup",
				},
			],
		},
		user_joined_channel: {
			fields: [
				{
					name: "channelId",
					label: "Channel",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
			],
		},
		message_updated: {
			fields: [
				{
					name: "channelId",
					label: "Channel",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/slack/channels",
					displayKey: "name",
					valueKey: "id",
				},
			],
		},
	},
	github: {
		new_issue: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
			],
		},
		pull_request_opened: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
			],
		},
		commit_pushed: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
			],
		},
		issue_commented: {
			fields: [
				{
					name: "repository",
					label: "Repository",
					type: "dropdown",
					required: true,
					endpoint: "/integrations/github/repos",
					displayKey: "full_name",
					valueKey: "full_name",
				},
			],
		},
	},
};

// Helper function to get config for an action
export function getActionConfig(appName: string, actionTitle: string): ActionConfig | null {
	const appConfigs = ActionConfigs[appName.toLowerCase()];
	if (!appConfigs) return null;

	// Try to find by matching title
	// Action IDs in backend use snake_case, titles are human-readable
	// We need to map from title to action ID
	const actionId = convertTitleToActionId(actionTitle);
	return appConfigs[actionId] || null;
}

// Convert action title to action ID (e.g., "Send Direct Message" -> "send_dm")
function convertTitleToActionId(title: string): string {
	const titleMap: Record<string, string> = {
		// Slack
		"Send Direct Message": "send_dm",
		"Send a message to a channel": "send_channel_message",
		"Update Message": "update_message",
		"Add Reaction": "add_reaction",
		// Gmail
		"Send Email": "send_email",
		"Reply to Email": "reply_to_email",
		"Add Label to Email": "add_label_to_email",
		"Star Email": "star_email",
		// GitHub
		"Create Issue": "create_issue",
		"Add Comment to Issue": "add_comment_to_issue",
		"Close Issue": "close_issue",
		"Assign Issue": "assign_issue",
		// Webhook
		"Send Webhook": "send_webhook",
	};

	return titleMap[title] || title.toLowerCase().replace(/\s+/g, "_");
}

// Helper function to get config for a trigger
export function getTriggerConfig(appName: string, triggerTitle: string): TriggerConfig | null {
	const appConfigs = TriggerConfigs[appName.toLowerCase()];
	if (!appConfigs) return null;

	const triggerId = convertTitleToTriggerId(triggerTitle);
	return appConfigs[triggerId] || null;
}

// Convert trigger title to trigger ID (e.g., "New Email Received" -> "new_email")
function convertTitleToTriggerId(title: string): string {
	const titleMap: Record<string, string> = {
		// Gmail
		"New Email Received": "new_email",
		"Email Labeled": "email_labeled",
		"Email Starred": "email_starred",
		"Email Replied To": "email_replied",
		// Slack
		"New Message in Channel": "new_channel_message",
		"New Reaction Added": "new_reaction",
		"User Joined Channel": "user_joined_channel",
		"Message Updated": "message_updated",
		// GitHub
		"New Issue Created": "new_issue",
		"PR Opened": "pull_request_opened",
		"Pull Request Opened": "pull_request_opened",
		"Commit Pushed": "commit_pushed",
		"Issue Commented": "issue_commented",
	};

	return titleMap[title] || title.toLowerCase().replace(/\s+/g, "_");
}

// Export conversion functions for use in other components
export { convertTitleToActionId, convertTitleToTriggerId };
