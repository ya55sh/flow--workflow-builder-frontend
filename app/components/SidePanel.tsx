import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCardEnabled, setStagedApp } from "../features/workflowSlice";
import { getTokenExpiry, getAccessToken } from "../utils/tokenUtils";
import axios from "axios";

type SidePanelProps = {
	stepId?: string;
	stepType?: string;
};

interface StagedApp {
	stepId: string;
	appName: string;
	connected?: boolean;
	expired?: boolean;
	hasUser?: boolean;
	// Add other properties if needed
}

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

export default function SidePanel({ stepId, stepType }: SidePanelProps) {
	const dispatch = useDispatch();

	const stagedApp: StagedApp[] = useSelector((state: any) => state.workflowApp.stagedApp);
	const selectedStaged: StagedApp | undefined = stagedApp.find((app) => app.stepId === stepId);
	const app = useSelector((state: any) => state.workflowApp.apps);
	const userDetails = useSelector((state: any) => state.workflowApp.user);
	const appScopes: TiggersAndActions[] | undefined =
		stepType === "trigger"
			? app.find((a: App) => a.appName == selectedStaged?.appName)?.triggers
			: app.find((a: App) => a.appName == selectedStaged?.appName)?.actions;

	console.log("Selected staged app:", selectedStaged);

	if (!stepId || !stepType || !selectedStaged) {
		return null; // or some fallback UI
	}

	useEffect(() => {
		if (selectedStaged.hasUser === true && selectedStaged.expired === true) {
			const refreshUser = async () => {
				try {
					const result = await getAccessToken(selectedStaged.appName);
					if (result === "success") {
						dispatch(
							setStagedApp({
								...selectedStaged,
								expired: false,
								connected: true,
							})
						);
					}
				} catch (err) {
					console.error("Failed to refresh token:", err);
				}
			};

			refreshUser();
		}
	}, []);

	function handleClose() {
		dispatch(setCardEnabled(false));
	}

	function handleAppSignin() {
		// Implement app sign-in functionality if needed
		console.log("Clicking app signin");

		const userApps = userDetails?.userApp || [];
		const appToConnect = userApps.find((a: App) => a.appName === selectedStaged?.appName);
		//if app found in user apps, set connected to true
		console.log("App to connect:", appToConnect);

		if (appToConnect) {
			appToConnect.connected = true;
			if (appToConnect.expiresAt !== null) {
				const getExpiry = getTokenExpiry(appToConnect.expiresAt || 0);

				if (getExpiry === "expired") {
					console.log("Token expired — reauthenticate needed");
				} else {
					console.log("Token valid — proceed as normal");
				}
			}
		}
		// If app not found, send an auth request and add to user apps in db and then update user apps in redux state
		else {
			window.location.href = `${process.env.NEXT_PUBLIC_URI}/oauth/app/${selectedStaged?.appName}?state=${userDetails.user.id}`;
		}
	}

	return (
		<div
			className={`
    fixed top-[20%] right-0 h-[60%] w-96
    bg-white shadow-lg border-l border-gray-300
    transform transition-transform duration-300
    border-2 m-2 p-2 border-indigo-500/50 rounded-lg shadow-xl/30`}
		>
			<div className="p-2 flex flex-col gap-4">
				<div className="flex justify-between bg-gray-100 p-2 rounded-lg">
					<h1>Step {stepId}. </h1>
					<button onClick={handleClose}>
						<img
							src="/close-x.svg"
							alt="close-button-icon"
							className="h-6 w-6 cursor-pointer opacity-50 hover:opacity-100 transition"
						/>
					</button>
				</div>
				<div>
					<h1 className="m-1">App</h1>
					<div className="p-2 border-1 border-gray-500/50 rounded-lg">{selectedStaged.appName}</div>
				</div>
				<div>
					<h1 className="m-1">{stepType === "trigger" ? `Trigger Event` : `Action Event`}</h1>

					<div className="p-2 border-1 border-gray-500/50 rounded-lg">
						<select id="my-scopes" className="p-1 hover:cursor-pointer">
							{appScopes &&
								appScopes.map((scope) => (
									<option key={scope.id} value={scope.title} className="p-1 hover:cursor-pointer">
										{scope.title}
									</option>
								))}
						</select>
					</div>
				</div>
				<div>
					<h1 className="m-1">Account</h1>
					<div className="p-2 border-1 border-gray-500/50 rounded-lg ">
						{selectedStaged.connected ? (
							<button
								disabled
								onClick={handleAppSignin}
								className=" p-1 pr-2 pl-2 rounded-lg bg-indigo-400 hover:cursor-pointer text-white"
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
			</div>
		</div>
	);
}
