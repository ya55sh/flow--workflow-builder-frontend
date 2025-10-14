import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setStagedApp, addOrUpdateStagedApp, updateStep } from "../features/workflowSlice";

type DropdownProps = {
	stepId: string;
};

export default function Dropdown({ stepId }: DropdownProps) {
	const dispatch = useDispatch();
	const steps = useSelector((state: any) => state.workflowApp.steps);
	const apps = useSelector((state: any) => state.workflowApp.apps);

	const handleChange = (event) => {
		event.stopPropagation();
		const selectedAppName = event.target.value;

		dispatch(setStagedApp({ stepId: stepId, appName: selectedAppName }));

		if (steps.length === 1) {
			dispatch(updateStep({ stepId: stepId, stepType: "trigger", appName: selectedAppName }));
		} else {
			dispatch(updateStep({ stepId: stepId, stepType: "action", appName: selectedAppName }));
		}
	};

	return (
		<div className="flex flex-col">
			<label htmlFor="my-dropdown">Choose an option :</label>
			<select id="my-dropdown" className="m-2 p-2 border-1 rounded-lg hover:cursor-pointer">
				{apps.map((app) => (
					<option
						onClick={handleChange}
						key={app.id + app.name}
						value={app.appName}
						className="p-4 m-2 hover:cursor-pointer border-2 border-indigo-500/50 rounded-lg"
					>
						{app.displayName}
					</option>
				))}
			</select>
		</div>
	);
}
