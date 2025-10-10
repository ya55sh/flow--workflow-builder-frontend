"use client";
import axios from "axios";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hasToken, isTokenExpired, removeToken } from "../utils/tokenUtils";
import Link from "next/link";
import AppCard from "../components/AppCard";

// const token = localStorage.getItem("accessToken");

type AppOption = {
	id: string;
	name: string;
	icon?: React.ReactNode;
};

type WorkflowStep = {
	id: string;
	type: "trigger" | "action";
	app?: string; // or more data depending on your AppCard
};

type StageKey = "setup" | "configure" | "test";

export default function CreateWorkflow() {
	const [steps, setSteps] = useState<WorkflowStep[]>([
		{ id: "1", type: "trigger" }, // initial trigger card
	]);

	const [apps, setApps] = useState<any[]>([]);
	const [stageApps, setStageApps] = useState<any[]>([]);

	useEffect(() => {
		const fetchApps = async () => {
			const token = localStorage.getItem("accessToken");
			const data = await axios.get(`${process.env.NEXT_PUBLIC_URI}${process.env.NEXT_PUBLIC_GET_APPS_URI}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			console.log("Apps data:", data.data);
			if (data?.data) {
				setApps(data.data);
			}
		};
		fetchApps();
	}, []);

	function handleAppSelect(stepId: string, appId: string) {
		setSteps((prevSteps) => prevSteps.map((step) => (step.id === stepId ? { ...step, app: appId } : step)));

		console.log(`App ${appId} selected for step ${stepId}`);

		const isLastStep = steps[steps.length - 1].id === stepId;
		if (isLastStep) {
			setSteps((prev) => [...prev, { id: `${prev.length + 1}`, type: "action" }]);
		}
	}

	return (
		<div className="min-h-screen min-w-900 flex flex-col gap-12 items-center justify-start p-4 m-2 bg-gray-50">
			<div className="w-full max-w-3xl flex gap-x-12 flex-row items-center justify-evenly p-2 m-2 text-black border-2 border-indigo-500/50 rounded-lg shadow-lg">
				<input className="bg-gray-100 p-3 m-2 rounded-lg" placeholder="Enter workflow name"></input>
				<button className="bg-gray-200 hover:bg-indigo-700 hover:text-white hover:cursor-pointer text-black font-semibold p-2 m-2 rounded-lg">
					Test Workflow
				</button>

				<button className="bg-gray-200 hover:bg-indigo-700 hover:text-white hover:cursor-pointer text-black font-semibold p-2 m-2 rounded-lg">
					Save Workflow
				</button>
				<Link href={"/"}>
					<button className="m-2 p-2 rounded-lg hover:cursor-pointer hover:bg-gray-200">Cancel</button>
				</Link>
			</div>

			<div className="min-h-screen border-gray-500/50 rounded-lg shadow-xl min-w-3xl">
				{steps.map((step) => (
					<AppCard key={step.id} apps={apps} onAppSelect={handleAppSelect} />
				))}
			</div>
		</div>
	);
}
