import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
	setCardEnabled,
	setStagedApp,
	setWorkflow,
	setUser,
	updateWorkflowStep,
	Workflow,
	WorkflowStep,
	StagedApp,
} from "../features/workflowSlice";
import { getTokenExpiry, getAccessToken } from "../utils/tokenUtils";
import {
	getActionConfig,
	getTriggerConfig,
	ConfigField,
	convertTitleToActionId,
	convertTitleToTriggerId,
} from "../config/actionConfigs";
import { fetchDropdownData } from "../utils/integrationHelpers";
import VariablePicker from "./VariablePicker";

type SidePanelProps = {
	stepId?: string;
	stepType?: string;
};

export type TiggersAndActions = {
	id: string;
	title: string;
	description: string;
};

interface App {
	appName: string;
	triggers?: string[];
	actions?: string[];
	// Add other properties if needed
}

interface ConditionRule {
	id: string;
	variable: string;
	operator: string;
	value: string;
	thenStep: string;
}

export default function SidePanel({ stepId, stepType }: SidePanelProps) {
	const dispatch = useDispatch();
	const [visualConditions, setVisualConditions] = useState<ConditionRule[]>([]);
	const [elseStep, setElseStep] = useState<string>("");
	const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
	const [configValues, setConfigValues] = useState<Record<string, any>>({});
	const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

	const stagedApp: StagedApp[] = useSelector((state: any) => state.workflowApp.stagedApp);
	const selectedStaged: StagedApp | undefined = stagedApp.find((app) => app.stepId === stepId);
	const app = useSelector((state: any) => state.workflowApp.apps);
	const workflow = useSelector((state: any) => state.workflowApp.workflow);

	const userDetails = useSelector((state: any) => state.workflowApp.user);

	// Find current step from workflow.steps
	const currentStep: WorkflowStep | undefined = workflow.steps.find((step: WorkflowStep) => step.id === stepId);

	// Find trigger step to determine available variables for conditions
	const triggerStep = workflow.steps.find((step: WorkflowStep) => step.type === "trigger");

	// Get available variables based on trigger app
	const getAvailableVariables = (): { value: string; label: string }[] => {
		if (!triggerStep?.appName) {
			return [{ value: "trigger.data", label: "Trigger Data" }];
		}

		const appName = triggerStep.appName.toLowerCase();

		switch (appName) {
			case "gmail":
			case "google":
				return [
					{ value: "trigger.subject", label: "Email Subject" },
					{ value: "trigger.from", label: "Email From" },
					{ value: "trigger.to", label: "Email To" },
					{ value: "trigger.body", label: "Email Body" },
					{ value: "trigger.messageId", label: "Message ID" },
					{ value: "trigger.threadId", label: "Thread ID" },
					{ value: "trigger.labels", label: "Email Labels" },
					{ value: "trigger.snippet", label: "Email Snippet" },
				];

			case "slack":
				return [
					{ value: "trigger.text", label: "Message Text" },
					{ value: "trigger.channelId", label: "Channel ID" },
					{ value: "trigger.channelName", label: "Channel Name" },
					{ value: "trigger.userId", label: "User ID" },
					{ value: "trigger.username", label: "Username" },
					{ value: "trigger.messageTs", label: "Message Timestamp" },
					{ value: "trigger.threadTs", label: "Thread Timestamp" },
				];

			case "github":
				return [
					{ value: "trigger.title", label: "Title" },
					{ value: "trigger.body", label: "Body" },
					{ value: "trigger.author", label: "Author" },
					{ value: "trigger.repository", label: "Repository" },
					{ value: "trigger.number", label: "Number" },
					{ value: "trigger.html_url", label: "URL" },
					{ value: "trigger.timestamp", label: "Timestamp" },
					{ value: "trigger.labels", label: "Labels" },
				];

			default:
				return [
					{ value: "trigger.data", label: "Trigger Data" },
					{ value: "trigger.id", label: "Trigger ID" },
					{ value: "trigger.timestamp", label: "Timestamp" },
				];
		}
	};

	const availableVariables = getAvailableVariables();

	const appScopes: TiggersAndActions[] | undefined =
		stepType === "trigger"
			? app.find((a: App) => a.appName == selectedStaged?.appName)?.triggers
			: app.find((a: App) => a.appName == selectedStaged?.appName)?.actions;

	// Get action or trigger config schema
	const actionConfig =
		currentStep?.title && stepType === "action"
			? getActionConfig(selectedStaged?.appName || "", currentStep.title)
			: null;

	const triggerConfig =
		currentStep?.title && stepType === "trigger"
			? getTriggerConfig(selectedStaged?.appName || "", currentStep.title)
			: null;

	// Fetch dropdown data when action or trigger is selected
	useEffect(() => {
		const fetchDropdowns = async () => {
			const config = stepType === "action" ? actionConfig : triggerConfig;
			if (!config || !currentStep?.title) return;

			// Check if user is connected to the app
			if (!selectedStaged?.connected) {
				setIsLoadingDropdowns(false);
				return;
			}

			setIsLoadingDropdowns(true);

			const newDropdownData: Record<string, any[]> = {};

			for (const field of config.fields) {
				if (field.type === "dropdown" && field.endpoint) {
					const data = await fetchDropdownData(field.endpoint);
					newDropdownData[field.name] = data;
				}
			}

			setDropdownData(newDropdownData);
			setIsLoadingDropdowns(false);
		};

		fetchDropdowns();
	}, [currentStep?.title, actionConfig, triggerConfig, selectedStaged?.connected, stepType]);

	// Initialize config values from currentStep.config
	useEffect(() => {
		if (currentStep?.config) {
			const configToSet = { ...currentStep.config };

			// Special handling for webhook payload - convert for display in textarea
			if (selectedStaged?.appName === "webhook" && configToSet.payload !== undefined) {
				const url = configToSet.url || "";
				const isSlackWebhook = url.includes("hooks.slack.com");

				if (typeof configToSet.payload === "object") {
					// If Slack webhook with { text: "..." }, extract the text
					if (isSlackWebhook && configToSet.payload.text) {
						configToSet.payload = configToSet.payload.text;
					} else {
						// For other JSON objects, stringify for editing
						configToSet.payload = JSON.stringify(configToSet.payload, null, 2);
					}
				}
				// If it's already a string, keep it as-is
			}

			setConfigValues(configToSet);
		}
	}, [currentStep?.id, selectedStaged?.appName]);

	// Initialize condition rules from currentStep (parse to visual format)
	useEffect(() => {
		if (stepType === "condition") {
			if (currentStep?.conditions && currentStep.conditions.length > 0) {
				const parsedConditions: ConditionRule[] = [];
				let parsedElse = "";

				currentStep.conditions.forEach((cond: any) => {
					if (cond.else !== undefined) {
						parsedElse = cond.else;
					} else if (cond.if && cond.then) {
						// Parse "{{trigger.subject}} contains 'Order'" into parts
						const ifPart = cond.if;
						const match = ifPart.match(
							/{{(.*?)}}[\s]+(contains|equals|starts with|ends with)[\s]+['"](.*)['"]?/i
						);

						if (match) {
							parsedConditions.push({
								id: Date.now().toString() + Math.random(),
								variable: match[1],
								operator: match[2],
								value: match[3].replace(/['"]$/g, ""), // Remove trailing quote if exists
								thenStep: cond.then,
							});
						}
					}
				});

				setVisualConditions(parsedConditions);
				setElseStep(parsedElse);
			} else {
				// Initialize with one empty condition if none exist
				const defaultVar = availableVariables[0]?.value || "trigger.data";
				setVisualConditions([
					{
						id: Date.now().toString(),
						variable: defaultVar,
						operator: "contains",
						value: "",
						thenStep: "",
					},
				]);
				setElseStep("");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep?.id, stepType]);

	useEffect(() => {
		if (!selectedStaged) return;
		if (selectedStaged.hasUser === true && selectedStaged.expired === true) {
			const refreshUser = async () => {
				const result = await getAccessToken(selectedStaged.appName);
				if (result.message === "success") {
					const updatedUserApp = userDetails.userApp.map((app: any) =>
						app.appName === selectedStaged.appName
							? { ...app, expiresAt: result.expiresAt } // update this one
							: app
					);

					dispatch(
						setUser({
							...userDetails,
							userApp: updatedUserApp,
						})
					);
					dispatch(
						setStagedApp({
							...selectedStaged,
							expired: false,
							connected: true,
						})
					);
				}
			};

			refreshUser();
		}
	}, [selectedStaged?.appName, selectedStaged?.hasUser, selectedStaged?.expired]);

	// Condition steps don't need a selectedStaged app
	if (!stepId || !stepType) {
		return null;
	}

	// For non-condition steps, require a selectedStaged app
	if (stepType !== "condition" && !selectedStaged) {
		return null;
	}

	function handleClose() {
		dispatch(setCardEnabled(false));
	}

	function handleAppSignin() {
		// Implement app sign-in functionality
		const userApps = userDetails?.userApp || [];
		const appToConnect = userApps.find((a: App) => a.appName === selectedStaged?.appName);

		if (appToConnect) {
			// App found in user apps - check if token is expired
			if (appToConnect.expiresAt !== null) {
				const getExpiry = getTokenExpiry(appToConnect.expiresAt || 0);

				if (getExpiry === "expired") {
					// Redirect to OAuth for re-authentication
					window.location.href = `${process.env.NEXT_PUBLIC_URI}/api/oauth/app/${selectedStaged?.appName}?state=${userDetails.user.id}`;
				} else {
				}
			}
		} else {
			// App not found - send an auth request
			const oauthUrl = `${process.env.NEXT_PUBLIC_URI}/api/oauth/app/${selectedStaged?.appName}?state=${userDetails.user.id}`;
			const popup = window.open(oauthUrl, "oauth", "width=600,height=700");

			window.addEventListener("message", (e) => {
				if (e.data.success === true) {
					popup?.close();
					window.close();
					dispatch(setStagedApp({ ...selectedStaged!, connected: true }));
					dispatch(setCardEnabled(false));
				}
			});

			popup?.focus();
		}
	}

	function handleSelect(event: React.ChangeEvent<HTMLSelectElement>) {
		const newTitle = event.target.value;

		if (!currentStep) return;

		const updatedStep: WorkflowStep = {
			...currentStep,
			title: newTitle,
			appName: selectedStaged!.appName,
		};

		// Set triggerId or actionId based on step type
		if (stepType === "trigger") {
			updatedStep.triggerId = convertTitleToTriggerId(newTitle);
		} else if (stepType === "action") {
			updatedStep.actionId = convertTitleToActionId(newTitle);
		}

		dispatch(updateWorkflowStep(updatedStep));
	}

	// Convert visual conditions to backend format and update
	function saveVisualConditions() {
		if (!currentStep) return;

		const conditions: any[] = visualConditions.map((cond) => ({
			if: `{{${cond.variable}}} ${cond.operator} '${cond.value}'`,
			then: cond.thenStep,
		}));

		// Add else clause if exists
		if (elseStep) {
			conditions.push({ else: elseStep });
		}

		const updatedStep = {
			...currentStep,
			conditions,
		};
		dispatch(updateWorkflowStep(updatedStep));
	}

	// Add a new condition
	function addCondition() {
		const defaultVar = availableVariables[0]?.value || "trigger.data";
		const newCondition: ConditionRule = {
			id: Date.now().toString() + Math.random(),
			variable: defaultVar,
			operator: "contains",
			value: "",
			thenStep: "",
		};
		setVisualConditions([...visualConditions, newCondition]);
	}

	// Remove a condition
	function removeCondition(id: string) {
		const updated = visualConditions.filter((c) => c.id !== id);
		setVisualConditions(updated);
		// Update backend immediately with the new conditions
		saveVisualConditionsWithValues(updated, elseStep);
	}

	// Update a specific condition
	function updateCondition(id: string, field: keyof ConditionRule, value: string) {
		const updated = visualConditions.map((c) => (c.id === id ? { ...c, [field]: value } : c));
		setVisualConditions(updated);
		// Save with the updated values
		saveVisualConditionsWithValues(updated, elseStep);
	}

	// Update else step
	function updateElseStep(step: string) {
		setElseStep(step);
		// Save with the updated else step
		saveVisualConditionsWithValues(visualConditions, step);
	}

	// Helper function to save with explicit values
	function saveVisualConditionsWithValues(conditions: ConditionRule[], else_step: string) {
		if (!currentStep) return;

		const conditionsArray: any[] = conditions.map((cond) => ({
			if: `{{${cond.variable}}} ${cond.operator} '${cond.value}'`,
			then: cond.thenStep,
		}));

		// Add else clause if exists and is not empty
		if (else_step && else_step !== "") {
			conditionsArray.push({ else: else_step });
		}

		const updatedStep = {
			...currentStep,
			conditions: conditionsArray,
		};
		dispatch(updateWorkflowStep(updatedStep));
	}

	// Handle dynamic config field changes
	function handleDynamicConfigChange(fieldName: string, value: any) {
		let newConfig = { ...configValues, [fieldName]: value };

		// Special handling for GitHub repository field - parse "owner/repo" format
		if (fieldName === "repository" && value && typeof value === "string" && value.includes("/")) {
			const [owner, repo] = value.split("/");
			newConfig = {
				...newConfig,
				owner,
				repo,
			};
		}

		setConfigValues(newConfig);

		if (currentStep) {
			// Prepare config for saving - convert webhook payload if needed
			const configToSave = { ...newConfig };

			// Special handling for webhook payload field - only process when saving
			if (fieldName === "payload" && selectedStaged?.appName === "webhook") {
				const url = configToSave.url || "";
				const isSlackWebhook = url.includes("hooks.slack.com");

				if (value && typeof value === "string") {
					// Try to parse as JSON first
					try {
						const parsed = JSON.parse(value);
						// If valid JSON, use it as-is
						configToSave.payload = parsed;

						// For Slack webhooks with JSON but no 'text' or 'blocks', wrap it
						if (isSlackWebhook && !parsed.text && !parsed.blocks) {
							configToSave.payload = { text: JSON.stringify(parsed) };
						}
					} catch (e) {
						// Plain text: only wrap for Slack webhooks
						if (isSlackWebhook) {
							configToSave.payload = { text: value };
						} else {
							// For non-Slack webhooks, keep as plain string
							configToSave.payload = value;
						}
					}
				} else if (!value) {
					// If empty, remove the payload field
					delete configToSave.payload;
				}
			}

			// Log webhook config removed for production cleanliness

			const updatedStep = {
				...currentStep,
				config: configToSave,
			};
			dispatch(updateWorkflowStep(updatedStep));
		}
	}

	// Render available steps reference (only forward steps for conditions)
	function renderAvailableSteps() {
		// For condition steps, only show steps that come after
		const availableSteps =
			stepType === "condition"
				? workflow.steps.filter((step: WorkflowStep) => Number(step.id) > Number(stepId))
				: workflow.steps.filter((step: WorkflowStep) => step.id !== stepId);

		if (availableSteps.length === 0) {
			return stepType === "condition" ? (
				<div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
					<p className="text-xs font-semibold text-gray-800 mb-1">No Forward Steps Available</p>
					<p className="text-xs text-gray-700">Add more steps after this condition using the ➕ button below.</p>
				</div>
			) : null;
		}

		return (
			<div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
				<p className="text-xs font-semibold text-gray-700 mb-2">
					{stepType === "condition" ? "Available Forward Steps:" : "Available Steps:"}
				</p>
				<div className="flex flex-wrap gap-2">
					{availableSteps.map((step: WorkflowStep) => (
						<span
							key={step.id}
							className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded border border-gray-300 shadow-sm"
						>
							<code className="text-indigo-600 font-bold text-xs">{step.id}</code>
							<span className="text-gray-500 text-xs">
								({step.type}){" "}
								{step.title && `- ${step.title.substring(0, 20)}${step.title.length > 20 ? "..." : ""}`}
							</span>
						</span>
					))}
				</div>
			</div>
		);
	}

	// Render dynamic config field based on type
	function renderConfigField(field: ConfigField) {
		const value = configValues[field.name] || "";

		switch (field.type) {
			case "dropdown":
				// Check if field has static options or needs to fetch from endpoint
				if (field.options && field.options.length > 0) {
					// Static options dropdown
					return (
						<div key={field.name} className="flex flex-col gap-1">
							<label className="text-sm font-medium">
								{field.label}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</label>
							<select
								value={value}
								onChange={(e) => handleDynamicConfigChange(field.name, e.target.value)}
								className="p-2 border border-gray-300 rounded text-sm"
							>
								<option value="">{field.placeholder || `Select ${field.label}`}</option>
								{field.options.map((option: string) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					);
				} else {
					// Dynamic options from API endpoint
					const options = dropdownData[field.name] || [];
					const displayKey = field.displayKey || "name";
					const valueKey = field.valueKey || "id";
					const hasOptions = options.length > 0;
					const isNotConnected = !selectedStaged?.connected;

					return (
						<div key={field.name} className="flex flex-col gap-1">
							<label className="text-sm font-medium">
								{field.label}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</label>
							{isNotConnected ? (
								<div className="p-2 border border-yellow-300 bg-yellow-50 rounded text-sm text-yellow-700">
									Connect your account to load {field.label.toLowerCase()} options
								</div>
							) : (
								<select
									value={value}
									onChange={(e) => handleDynamicConfigChange(field.name, e.target.value)}
									className="p-2 border border-gray-300 rounded text-sm"
									disabled={isLoadingDropdowns || !hasOptions}
								>
									<option value="">
										{isLoadingDropdowns
											? "Loading..."
											: !hasOptions
											? `No ${field.label.toLowerCase()} available`
											: `Select ${field.label}`}
									</option>
									{options.map((option: any, index: number) => (
										<option key={index} value={option[valueKey]}>
											{option[displayKey] || option[valueKey]}
										</option>
									))}
								</select>
							)}
						</div>
					);
				}

			case "textarea":
				return (
					<div key={field.name} className="flex flex-col gap-1">
						<div className="flex justify-between items-center">
							<label className="text-sm font-medium">
								{field.label}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</label>
							<VariablePicker
								availableVariables={availableVariables.map((v) => v.value)}
								onInsert={(variable) => {
									const newValue = value + variable;
									handleDynamicConfigChange(field.name, newValue);
								}}
							/>
						</div>
						<textarea
							value={value}
							onChange={(e) => handleDynamicConfigChange(field.name, e.target.value)}
							placeholder={field.placeholder}
							className="p-2 border border-gray-300 rounded text-sm"
							rows={3}
						/>
					</div>
				);

			case "number":
				return (
					<div key={field.name} className="flex flex-col gap-1">
						<label className="text-sm font-medium">
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<input
							type="number"
							value={value}
							onChange={(e) => handleDynamicConfigChange(field.name, e.target.value)}
							placeholder={field.placeholder}
							className="p-2 border border-gray-300 rounded text-sm"
							min="1"
							step="1"
						/>
					</div>
				);

			case "text":
			default:
				return (
					<div key={field.name} className="flex flex-col gap-1">
						<div className="flex justify-between items-center">
							<label className="text-sm font-medium">
								{field.label}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</label>
							<VariablePicker
								availableVariables={availableVariables.map((v) => v.value)}
								onInsert={(variable) => {
									const newValue = value + variable;
									handleDynamicConfigChange(field.name, newValue);
								}}
							/>
						</div>
						<input
							type="text"
							value={value}
							onChange={(e) => handleDynamicConfigChange(field.name, e.target.value)}
							placeholder={field.placeholder}
							className="p-2 border border-gray-300 rounded text-sm"
						/>
					</div>
				);
		}
	}

	return (
		<div
			className={`
    fixed top-[5%] right-0 h-[90vh] w-96
    bg-white shadow-lg border-l border-gray-300
    transform transition-transform duration-300
    border-2 m-2 border-indigo-500/50 rounded-lg shadow-xl/30
    flex flex-col`}
		>
			{/* Fixed Header */}
			<div className="flex justify-between bg-gray-100 p-3 rounded-t-lg border-b border-gray-200 flex-shrink-0">
				<h1 className="font-semibold">Step {stepId}</h1>
				<button onClick={handleClose}>
					<img
						src="/close-x.svg"
						alt="close-button-icon"
						className="h-6 w-6 cursor-pointer opacity-50 hover:opacity-100 transition"
					/>
				</button>
			</div>

			{/* Scrollable Content */}
			<div className="p-3 flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
				{/* App section - only for trigger/action steps */}
				{stepType !== "condition" && selectedStaged && (
					<div>
						<h1 className="m-1">App</h1>
						<div className="p-2 border-1 border-gray-500/50 rounded-lg">
							{selectedStaged.appName === `google`
								? `Gmail`
								: `${selectedStaged.appName[0].toUpperCase()}${selectedStaged.appName.substring(1)}`}
						</div>
					</div>
				)}
				<div>
					<h1 className="m-1">
						{stepType === "trigger"
							? `Trigger Event`
							: stepType === "condition"
							? `Condition Rules`
							: `Action Event`}
					</h1>

					{stepType === "condition" ? (
						<div className="p-4 border-1 border-gray-500/50 rounded-lg">
							<div className="flex flex-col gap-4">
								{/* Helper text */}
								<div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
									<p className="font-semibold mb-1.5">Build Your Conditions:</p>
									<p className="text-xs text-gray-500 leading-relaxed">
										Create rules to control workflow branching based on trigger data.
									</p>
								</div>

								{/* Visual Condition Builder */}
								<div className="flex flex-col gap-3">
									{visualConditions.map((condition, index) => (
										<div
											key={condition.id}
											className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm"
										>
											<div className="flex items-center gap-2 mb-3">
												<span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
													{index === 0 ? "IF" : "ELSE IF"}
												</span>
												<button
													type="button"
													onClick={() => removeCondition(condition.id)}
													className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
													title="Remove condition"
												>
													✕
												</button>
											</div>

											<div className="flex flex-col gap-3">
												{/* Variable selector */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1.5">
														Variable
														{triggerStep?.appName && (
															<span className="ml-1 text-xs text-gray-500">
																(from {triggerStep.appName})
															</span>
														)}
													</label>
													<select
														value={condition.variable}
														onChange={(e) => updateCondition(condition.id, "variable", e.target.value)}
														className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
													>
														{availableVariables.map((variable) => (
															<option key={variable.value} value={variable.value}>
																{variable.label}
															</option>
														))}
													</select>
												</div>

												{/* Operator selector */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1.5">
														Operator
													</label>
													<select
														value={condition.operator}
														onChange={(e) => updateCondition(condition.id, "operator", e.target.value)}
														className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
													>
														<option value="contains">contains</option>
														<option value="equals">equals</option>
														<option value="starts with">starts with</option>
														<option value="ends with">ends with</option>
													</select>
												</div>

												{/* Value input */}
												<div>
													<label className="block text-xs font-medium text-gray-700 mb-1.5">Value</label>
													<input
														type="text"
														value={condition.value}
														onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
														placeholder="Enter value..."
														className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
													/>
												</div>

												{/* Then step selector */}
												<div className="pt-2 border-t border-gray-200">
													<label className="block text-xs font-semibold text-gray-700 mb-1.5">
														THEN go to step:
													</label>
													<select
														value={condition.thenStep}
														onChange={(e) => updateCondition(condition.id, "thenStep", e.target.value)}
														className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
													>
														<option value="">Select step...</option>
														{workflow.steps
															.filter((s: WorkflowStep) => Number(s.id) > Number(stepId))
															.map((s: WorkflowStep) => (
																<option key={s.id} value={s.id}>
																	Step {s.id} ({s.type}) - {s.title || s.appName || "Not configured"}
																</option>
															))}
													</select>
													{workflow.steps.filter((s: WorkflowStep) => Number(s.id) > Number(stepId))
														.length === 0 && (
														<p className="text-xs text-gray-600 mt-1">
															⚠️ No steps after this condition. Add more steps below.
														</p>
													)}
												</div>
											</div>
										</div>
									))}

									{/* Add condition button */}
									<button
										type="button"
										onClick={addCondition}
										className="w-full text-sm px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors font-medium border-2 border-indigo-200 hover:border-indigo-300"
									>
										+ Add Condition
									</button>
								</div>

								{/* Else clause */}
								<div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
									<div className="flex items-center gap-2 mb-3">
										<span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
											ELSE (Fallback)
										</span>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-700 mb-1.5">
											If no conditions match, go to:
										</label>
										<select
											value={elseStep}
											onChange={(e) => updateElseStep(e.target.value)}
											className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
										>
											<option value="">Select step...</option>
											{workflow.steps
												.filter((s: WorkflowStep) => Number(s.id) > Number(stepId))
												.map((s: WorkflowStep) => (
													<option key={s.id} value={s.id}>
														Step {s.id} ({s.type}) - {s.title || s.appName || "Not configured"}
													</option>
												))}
										</select>
										{workflow.steps.filter((s: WorkflowStep) => Number(s.id) > Number(stepId)).length ===
											0 && (
											<p className="text-xs text-gray-600 mt-1">
												⚠️ No steps after this condition. Add more steps below.
											</p>
										)}
									</div>
								</div>

								{/* Available steps reference */}
								{renderAvailableSteps()}
							</div>
						</div>
					) : (
						<div className="p-2 border-1 border-gray-500/50 rounded-lg">
							<select
								id="my-scopes"
								className="p-1 hover:cursor-pointer"
								onChange={handleSelect}
								value={currentStep?.title || ""}
							>
								<option value="">Select an event</option>
								{appScopes &&
									appScopes.map((scope) => (
										<option key={scope.id} value={scope.title} className="p-1 hover:cursor-pointer">
											{scope.title}
										</option>
									))}
							</select>
						</div>
					)}
				</div>

				{/* Config section for action steps */}
				{stepType === "action" && actionConfig && currentStep?.title && (
					<div>
						<h1 className="m-1">Configuration</h1>
						<div className="p-2 border-1 border-gray-500/50 rounded-lg space-y-3">
							{actionConfig.fields.map((field) => renderConfigField(field))}
						</div>
					</div>
				)}

				{/* Config section for trigger steps */}
				{stepType === "trigger" && triggerConfig && currentStep?.title && triggerConfig.fields.length > 0 && (
					<div>
						<h1 className="m-1">Configuration</h1>
						<div className="p-2 border-1 border-gray-500/50 rounded-lg space-y-3">
							{triggerConfig.fields.map((field) => renderConfigField(field))}
						</div>
					</div>
				)}

				{/* Account section - only for trigger/action steps - placed at bottom */}
				{/* Hide for webhook since it doesn't require OAuth */}
				{stepType !== "condition" && selectedStaged && selectedStaged.appName !== "webhook" && (
					<div>
						<h1 className="m-1">Account</h1>
						<div className="p-2 border-1 border-gray-500/50 rounded-lg">
							{selectedStaged.connected ? (
								<button
									disabled
									onClick={handleAppSignin}
									className="p-1 pr-2 pl-2 rounded-lg bg-indigo-400 hover:cursor-pointer text-white"
								>
									<p>Connected</p>
								</button>
							) : (
								<button
									onClick={handleAppSignin}
									className="p-1 pr-2 pl-2 rounded-lg bg-indigo-400 hover:cursor-pointer hover:bg-indigo-700 transition duration-200 text-white"
								>
									<p>Sign in</p>
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
