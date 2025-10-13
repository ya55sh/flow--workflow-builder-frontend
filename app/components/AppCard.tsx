import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import { useSelector, useDispatch } from "react-redux";
import { setStep, removeStep, removeStagedApp } from "../features/workflowSlice";

interface AppCardProps {
	stepId: string;
	stepType: string;
}

export default function AppCard({ stepId, stepType }: AppCardProps) {
	const dispatch = useDispatch();
	const steps = useSelector((state: any) => state.workflowApp.steps);
	const stagedApp = useSelector((state: any) => state.workflowApp.stagedApp);

	function handleUpdateStep(event) {
		const actionType = event.currentTarget.dataset.action;

		if (actionType === "remove-step") {
			if (steps.length > 1) dispatch(removeStep(event.currentTarget.dataset.stepId));
			dispatch(removeStagedApp({ stepId: stepId, appName: "" }));
			return;
		} else {
			const newStep = {
				stepId: (Number(steps[steps.length - 1].stepId) + 1).toString(),
				stepType: "action",
			};
			dispatch(setStep(newStep));
		}
	}

	return (
		<div className="flex flex-col items-center justify-start p-2 m-2">
			<div className="bg-white rounded-lg shadow-md p-2 m-3 min-w-3xs max-w-2xs border-1">
				<div className="relative flex justify-between items-center hover:cursor-pointer">
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
					className="border-2 rounded-lg border-gray-500/50 m-2 p-2 hover:cursor-pointer hover:border-gray-200/50 hover:shadow-xl"
				>
					➕
				</button>
				{stepType === "action" && (
					<button
						data-action="remove-step"
						data-step-id={stepId}
						onClick={handleUpdateStep}
						className="border-2 rounded-lg border-gray-500/50 m-2 p-2 hover:cursor-pointer hover:border-gray-200/50 hover:shadow-xl"
					>
						➖
					</button>
				)}
			</div>
		</div>
	);
}
