import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";

import { useSelector, useDispatch } from "react-redux";
import {
	setStep,
	setSteps,
	removeStep,
	removeStagedApp,
	setStagedApps,
	setCardEnabled,
	setCardState,
	setWorkflow,
	removeWorkflowStep,
	addWorkflowStep,
	WorkflowStep,
} from "../features/workflowSlice";

interface AppCardProps {
	stepId: string;
	stepType: string;
}

interface StagedApp {
	stepId: string;
	appName: string;
}

export default function AppCard({ stepId, stepType }: AppCardProps) {
	const dispatch = useDispatch();
	const [showStepTypeMenu, setShowStepTypeMenu] = React.useState(false);
	const menuRef = React.useRef<HTMLDivElement>(null);

	const steps = useSelector((state: any) => state.workflowApp.steps);
	const stagedApp = useSelector((state: any) => state.workflowApp.stagedApp);
	const cardState = useSelector((state: any) => state.workflowApp.cardState);
	const cardStatus = useSelector((state: any) => state.workflowApp.cardStatus);
	const workflow = useSelector((state: any) => state.workflowApp.workflow);

	const isCardActive: boolean = (stagedApp as StagedApp[]).some((app: StagedApp) => app.stepId === stepId);
	const isCardSelected: boolean = cardStatus && cardState.stepId === stepId;

	// Find the selected app for this step
	const selectedApp = (stagedApp as StagedApp[]).find((app: StagedApp) => app.stepId === stepId);
	const currentStep = steps.find((step: any) => step.stepId === stepId);

	// Close menu when clicking outside
	React.useEffect(() => {
		if (!showStepTypeMenu) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowStepTypeMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showStepTypeMenu]);

	interface HandleCardClickEvent extends React.MouseEvent<HTMLDivElement> {}

	interface UpdateStepEvent extends React.MouseEvent<HTMLButtonElement> {
		currentTarget: (EventTarget & HTMLButtonElement) & {
			dataset: DOMStringMap;
		};
	}

	interface NewStep {
		stepId: string;
		stepType: string;
	}

	function handleCardClick(event: HandleCardClickEvent): void {
		event.stopPropagation();
		console.log("Card clicked");
		dispatch(setCardEnabled(true));
		dispatch(setCardState({ stepId, stepType }));
	}

	function handleUpdateStep(event: UpdateStepEvent): void {
		event.stopPropagation();
		const actionType = event.currentTarget.dataset.action;

		if (actionType === "remove-step") {
			const stepIdToRemove = event.currentTarget.dataset.stepId as string;

			// Step 1: Remove and renumber workflow steps
			let workflowStepsList: WorkflowStep[] = [];
			if (workflow.steps) {
				workflowStepsList = [...workflow.steps];
				workflowStepsList = workflowStepsList.filter((wf) => wf.id !== stepIdToRemove);
				workflowStepsList.sort((a, b) => Number(a.id) - Number(b.id));

				// Create mapping of old IDs to new IDs
				const idMapping: Record<string, string> = {};
				workflowStepsList.forEach((step, index) => {
					const newId = (index + 1).toString();
					idMapping[step.id] = newId;
				});

				// Renumber all steps sequentially and update condition references
				workflowStepsList = workflowStepsList.map((step, index) => {
					const newStep = {
						...step,
						id: (index + 1).toString(),
					};

					// Update condition references to point to new step IDs
					if (newStep.type === "condition" && newStep.conditions) {
						newStep.conditions = newStep.conditions.map((cond) => {
							const updatedCond: any = { ...cond };

							if (cond.then && idMapping[cond.then]) {
								updatedCond.then = idMapping[cond.then];
							}
							if (cond.else && idMapping[cond.else]) {
								updatedCond.else = idMapping[cond.else];
							}

							return updatedCond;
						});
					}

					return newStep;
				});

				const updatedWorkflow = {
					...workflow,
					steps: workflowStepsList,
				};
				dispatch(setWorkflow(updatedWorkflow));
			}

			// Step 2: Remove and renumber UI steps
			let uiStepsList = [...steps];
			uiStepsList = uiStepsList.filter((step) => step.stepId !== stepIdToRemove);
			uiStepsList.sort((a, b) => Number(a.stepId) - Number(b.stepId));

			// Renumber UI steps
			uiStepsList = uiStepsList.map((step, index) => ({
				...step,
				stepId: (index + 1).toString(),
			}));
			dispatch(setSteps(uiStepsList));

			// Step 3: Remove and renumber staged apps
			let stagedAppsList = [...stagedApp];
			stagedAppsList = stagedAppsList.filter((app: StagedApp) => app.stepId !== stepIdToRemove);
			stagedAppsList.sort((a, b) => Number(a.stepId) - Number(b.stepId));

			// Renumber staged apps
			stagedAppsList = stagedAppsList.map((app, index) => ({
				...app,
				stepId: (index + 1).toString(),
			}));
			dispatch(setStagedApps(stagedAppsList));

			// Close the side panel if the removed step was selected
			if (cardStatus && cardState.stepId === stepIdToRemove) {
				dispatch(setCardEnabled(false));
			}
		} else {
			// Toggle dropdown menu
			setShowStepTypeMenu(!showStepTypeMenu);
		}
	}

	function handleAddStep(selectedStepType: "action" | "condition"): void {
		const newStepId = (Number(steps[steps.length - 1].stepId) + 1).toString();
		const newStep: NewStep = {
			stepId: newStepId,
			stepType: selectedStepType,
		};
		dispatch(setStep(newStep));

		// For condition steps, add to workflow immediately
		if (selectedStepType === "condition") {
			dispatch(
				addWorkflowStep({
					id: newStepId,
					type: "condition",
					conditions: [],
				})
			);
		}

		setShowStepTypeMenu(false);
	}

	return (
		<div className="flex flex-col items-center justify-start p-2 m-2">
			<div
				className={`bg-white rounded-lg shadow-md p-2 m-3 min-w-3xs max-w-2xs border-1 transition-all duration-200 cursor-pointer ${
					isCardSelected
						? "ring-2 ring-indigo-500 shadow-xl scale-105 border-indigo-500"
						: "hover:shadow-xl hover:ring-2 hover:ring-indigo-500/90 hover:scale-105"
				}`}
				onClick={handleCardClick}
			>
				<div className="relative ">
					<h2 className="text-xl font-semibold m-2">
						{currentStep?.appName
							? `Step ${stepId}: ${currentStep.appName.charAt(0).toUpperCase() + currentStep.appName.slice(1)}`
							: stepType === "action"
							? `Select an action`
							: stepType === "condition"
							? `Condition`
							: `Select a trigger`}
					</h2>
				</div>
				{stepType !== "condition" ? (
					<Dropdown stepId={stepId} />
				) : (
					<p className="text-sm text-gray-500 italic m-2 p-2">Click to configure condition rules</p>
				)}
			</div>
			<div className="min-w-3xs max-w-2xs flex flex-row justify-center relative" ref={menuRef}>
				<button
					data-action="add-step"
					onClick={handleUpdateStep}
					className="border-2 rounded-lg border-gray-500/50 m-2 p-2 hover:cursor-pointer hover:border-indigo-500/90 hover:shadow-xl transition duration-200"
				>
					➕
				</button>

				{/* Compact Dropdown Menu */}
				{showStepTypeMenu && (
					<div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border-2 border-indigo-500/50 z-10 min-w-[140px]">
						<button
							onClick={() => handleAddStep("action")}
							className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition text-sm font-medium border-b border-gray-200"
						>
							Action
						</button>
						<button
							onClick={() => handleAddStep("condition")}
							className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition text-sm font-medium"
						>
							Condition
						</button>
					</div>
				)}

				{(stepType === "action" || stepType === "condition") && (
					<button
						data-action="remove-step"
						data-step-id={stepId}
						onClick={handleUpdateStep}
						className="border-2 rounded-lg border-gray-500/50 m-2 p-2 hover:cursor-pointer hover:border-indigo-500/90 hover:shadow-xl transition duration-200"
					>
						➖
					</button>
				)}
			</div>
		</div>
	);
}
