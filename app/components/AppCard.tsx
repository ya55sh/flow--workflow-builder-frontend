import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";

interface AppCardProps {
	apps?: any[]; // or a more specific type if you have it

	onAppSelect: (stepId: string, appId: string) => void;
	children?: React.ReactNode;
}

export default function AppCard({ apps, onAppSelect, children }: AppCardProps) {
	return (
		<div className="flex flex-col items-center justify-start p-2 m-2">
			<div className="bg-white rounded-lg shadow-md p-2 m-3 min-w-3xs max-w-2xs border-1">
				<h2 className="text-xl font-semibold m-2">Select a trigger</h2>
				<Dropdown apps={apps ?? []} onAppSelect={onAppSelect} />
			</div>
			<div className="min-w-3xs max-w-2xs flex flex-row justify-center">
				<div className="border-2 rounded-lg border-gray-500/50 m-2 p-2 hover:cursor-pointer hover:border-gray-200/50 hover:shadow-xl">
					➕
				</div>
			</div>
		</div>
	);
}
