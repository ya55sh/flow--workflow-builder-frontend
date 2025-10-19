import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";

import { useSelector, useDispatch } from "react-redux";
import { setStep, removeStep, removeStagedApp, setCardEnabled, setCardState } from "../features/workflowSlice";

interface AppCardProps {
	stepId: string;
	stepType: string;
}

export default function AppCard({ stepId, stepType }: AppCardProps) {
	const dispatch = useDispatch();

	const steps = useSelector((state: any) => state.workflowApp.steps);
	const stagedApp = useSelector((state: any) => state.workflowApp.stagedApp);
	interface StagedApp {
		stepId: string;
		appName: string;
	}

	const isCardActive: boolean = (stagedApp as StagedApp[]).some((app: StagedApp) => app.stepId === stepId);

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
			if (steps.length > 1) dispatch(removeStep(event.currentTarget.dataset.stepId as string));
			dispatch(removeStagedApp({ stepId: stepId, appName: "" }));
			return;
		} else {
			const newStep: NewStep = {
				stepId: (Number(steps[steps.length - 1].stepId) + 1).toString(),
				stepType: "action",
			};
			dispatch(setStep(newStep));
		}
	}

	return (
		<div className="flex flex-col items-center justify-start p-2 m-2">
			<div
				className="bg-white rounded-lg shadow-md p-2 m-3 min-w-3xs max-w-2xs border-1 hover:cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-indigo-500/90 hover:scale-105 transition-transform duration-200"
				onClick={isCardActive ? handleCardClick : undefined}
			>
				<div className="relative ">
					<h2 className="text-xl font-semibold m-2">
						{stepType === "action" ? `Select an action` : `Select a trigger`}
					</h2>
				</div>
				<Dropdown stepId={stepId} />
			</div>
			<div className="min-w-3xs max-w-2xs flex flex-row justify-center">
				<button
					data-action="add-step"
					onClick={handleUpdateStep}
					className="border-2 rounded-lg border-gray-500/50 m-2 p-2 hover:cursor-pointer hover:border-indigo-500/90 hover:shadow-xl transition duration-200"
				>
					➕
				</button>
				{stepType === "action" && (
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
