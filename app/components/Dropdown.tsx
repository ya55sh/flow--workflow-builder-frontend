import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setStagedApp, updateStep } from "../features/workflowSlice";
import { getTokenExpiry, getAccessToken } from "../utils/tokenUtils";
import axios from "axios";

type DropdownProps = {
	stepId: string;
};

interface App {
	id: string;
	name: string;
	appName: string;
	displayName: string;
}

interface HandleChangeEvent extends React.MouseEvent<HTMLSelectElement, MouseEvent> {
	target: HTMLSelectElement;
}

export default function Dropdown({ stepId }: DropdownProps) {
	const dispatch = useDispatch();
	const steps = useSelector((state: any) => state.workflowApp.steps);
	const apps = useSelector((state: any) => state.workflowApp.apps);
	const userDetails = useSelector((state: any) => state.workflowApp.user);
	const userAppsMap: Map<string, App> = new Map();
	userDetails?.userApp?.forEach((app: App) => {
		userAppsMap.set(app.appName, app);
	});

	const handleChange = async (event: HandleChangeEvent) => {
		event.stopPropagation();
		const selectedAppName: string = event.target.value;

		if (userAppsMap.has(selectedAppName.toLowerCase())) {
			const stagedPayload = {
				stepId: stepId,
				appName: selectedAppName,
				connected: true,
				expired: true,
				hasUser: true,
			};

			let appInfo = userDetails?.userApp.filter((app) => app.appName === selectedAppName.toLowerCase());
			console.log(appInfo);
			if (appInfo.appName === "slack" && appInfo.expiresAt === null) {
				stagedPayload.expired = false;
			}

			if (appInfo.expiresAt) {
				let getAppExpiry = getTokenExpiry(appInfo.expiresAt);
				if (getAppExpiry === "expired") {
					stagedPayload.expired = true;
				} else {
					stagedPayload.expired = false;
				}
			}

			dispatch(setStagedApp(stagedPayload));
		} else {
			const stagedPayload = {
				stepId: stepId,
				appName: selectedAppName,
				connected: false,
				expired: false,
				hasUser: false,
			};
			dispatch(setStagedApp(stagedPayload));
		}

		if (steps.length === 1) {
			dispatch(updateStep({ stepId: stepId, stepType: "trigger", appName: selectedAppName }));
		} else {
			dispatch(updateStep({ stepId: stepId, stepType: "action", appName: selectedAppName }));
		}
	};

	return (
		<div className="flex flex-col">
			<label htmlFor="my-dropdown">Choose an option :</label>
			<select id="my-dropdown" className="m-2 p-2 border-1 rounded-lg hover:cursor-pointer" onClick={handleChange}>
				{apps.map((app: App) => (
					<option
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
