import React, { useState } from "react";

interface DropdownProps {
	apps: any[]; // or a more specific type if you have it
	onAppSelect: (stepId: string, appId: string) => void;
}

export default function Dropdown({ apps, onAppSelect }: DropdownProps) {
	const [selectedValue, setSelectedValue] = useState("option1"); // Initial selected value

	const handleChange = (event) => {
		setSelectedValue(event.target.value);
	};

	return (
		<div className="flex flex-col">
			<label htmlFor="my-dropdown">Choose an option :</label>
			<select
				id="my-dropdown"
				value={selectedValue}
				onChange={handleChange}
				className="m-2 p-2 hover:cursor-pointer"
			>
				{apps.map((app) => (
					<option
						onClick={() => onAppSelect("1", selectedValue)}
						key={app.id}
						value={app.id}
						className="p-4 m-2 hover:cursor-pointer border-2 border-indigo-500/50 rounded-lg"
					>
						{app.name}
					</option>
				))}
			</select>
		</div>
	);
}
