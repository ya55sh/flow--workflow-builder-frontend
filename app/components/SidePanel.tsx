import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCardEnabled } from "../features/workflowSlice";

type SidePanelProps = {
	stepId?: string;
	stepType?: string;
};

export default function SidePanel({ stepId, stepType }: SidePanelProps) {
	const dispatch = useDispatch();

	interface StagedApp {
		stepId: string;
		appName: string;
		// Add other properties if needed
	}

	interface App {
		appName: string;
		triggerScopes?: string[];
		actionScopes?: string[];
		// Add other properties if needed
	}

	const stagedApp: StagedApp[] = useSelector((state: any) => state.workflowApp.stagedApp);
	const selectedStaged: StagedApp | undefined = stagedApp.find((app) => app.stepId === stepId);
	const cardStatus = useSelector((state: any) => state.workflowApp.cardStatus);
	const app = useSelector((state: any) => state.workflowApp.apps);
	const appScopes: string[] | undefined =
		stepType === "trigger"
			? app.find((a: App) => a.appName == selectedStaged?.appName)?.triggerScopes
			: app.find((a: App) => a.appName == selectedStaged?.appName)?.actionScopes;

	console.log("Selected scopes app:", appScopes);
	if (!stepId || !stepType || !selectedStaged) {
		return null; // or some fallback UI
	}

	function handleClose() {
		// Implement close functionality if needed
		dispatch(setCardEnabled(false));
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
									<option key={scope} value={scope} className="p-1 hover:cursor-pointer">
										{scope}
									</option>
								))}
						</select>
					</div>
				</div>
				<div>
					<h1 className="m-1">Account</h1>
					<div className="p-2 border-1 border-gray-500/50 rounded-lg ">
						<button className="p-1 pr-2 pl-2 rounded-lg bg-indigo-400 hover:cursor-pointer hover:bg-indigo-700 transition duration-200 text-white">
							Sign in
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
