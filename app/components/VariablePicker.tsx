import React, { useState } from "react";

/**
 * Props interface for VariablePicker component
 */
interface VariablePickerProps {
	onInsert: (variable: string) => void; // Callback when variable is selected
	availableVariables?: string[]; // List of available variables (optional)
}

/**
 * Default variables available across all apps
 * Common trigger data fields from various integrations
 */
const defaultVariables = [
	"trigger.subject", // Email subject
	"trigger.from", // Email sender
	"trigger.to", // Email recipient
	"trigger.body", // Email/message body
	"trigger.messageId", // Message identifier
	"trigger.threadId", // Thread identifier
	"trigger.text", // Message text
	"trigger.channelId", // Channel identifier
	"trigger.userId", // User identifier
	"trigger.messageTs", // Message timestamp
];

/**
 * Helper: Format variable names into readable labels
 * Converts camelCase variable names to user-friendly Title Case labels
 * Example: "messageId" becomes "Message Id"
 *
 * @param variable - The variable path (e.g., "trigger.messageId")
 * @returns Formatted, human-readable label
 */
function formatVariableLabel(variable: string): string {
	const parts = variable.split(".");
	if (parts.length < 2) return variable;

	const fieldName = parts[parts.length - 1];
	// Convert camelCase to Title Case with spaces
	return fieldName
		.replace(/([A-Z])/g, " $1") // Add space before capital letters
		.replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
		.trim();
}

/**
 * Variable Picker Component
 * Dropdown selector for inserting dynamic workflow variables into text fields
 *
 * Features:
 * - Shows available variables from trigger data
 * - Formats variable names for readability
 * - Inserts variables in {{variable}} format
 * - Context-aware variables based on trigger type
 * - Dropdown closes on selection or outside click
 *
 * Use case: Allows users to reference trigger data in action fields
 * Example: "Send email with subject: {{trigger.subject}}"
 */
export default function VariablePicker({ onInsert, availableVariables = defaultVariables }: VariablePickerProps) {
	// Local state for dropdown open/close
	const [isOpen, setIsOpen] = useState(false);

	/**
	 * Handler: Insert selected variable into parent field
	 * Wraps variable in double curly braces {{variable}} format
	 * Closes dropdown after insertion
	 *
	 * @param variable - The variable path to insert
	 */
	function handleInsert(variable: string) {
		onInsert(`{{${variable}}}`); // Wrap in template syntax
		setIsOpen(false); // Close dropdown
	}

	return (
		<div className="relative inline-block w-full">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="px-2.5 py-1.5 m-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors font-medium w-full"
				title="Insert variable"
			>
				{"{x}"}
			</button>

			{isOpen && (
				<>
					{/* Backdrop */}
					<div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

					{/* Dropdown */}
					<div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
						<div className="p-2 border-b border-gray-200">
							<p className="text-xs font-semibold text-gray-600">Available Variables</p>
						</div>
						<div className="py-1">
							{availableVariables.map((variable, index) => (
								<button
									key={index}
									onClick={() => handleInsert(variable)}
									className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors"
								>
									<div className="flex flex-col">
										<span className="text-xs font-medium text-gray-700">{formatVariableLabel(variable)}</span>
										<code className="text-xs text-indigo-600 mt-0.5">{`{{${variable}}}`}</code>
									</div>
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
