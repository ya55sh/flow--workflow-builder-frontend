"use client";
import { useState, useRef, useEffect } from "react";

interface WorkflowNodeData {
	id: string;
	type: string;
	title: string;
	description: string;
	position: { x: number; y: number };
	config: any;
}

interface WorkflowNodeProps {
	node: WorkflowNodeData;
	onUpdate: (updates: Partial<WorkflowNodeData>) => void;
	onDelete: () => void;
}

export default function WorkflowNode({ node, onUpdate, onDelete }: WorkflowNodeProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [showConfig, setShowConfig] = useState(false);
	const nodeRef = useRef<HTMLDivElement>(null);

	const getNodeTypeColor = (type: string) => {
		switch (type) {
			case "trigger":
				return "bg-blue-500";
			case "action":
				return "bg-green-500";
			case "condition":
				return "bg-yellow-500";
			case "delay":
				return "bg-purple-500";
			default:
				return "bg-gray-500";
		}
	};

	const getNodeTypeIcon = (type: string) => {
		switch (type) {
			case "trigger":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				);
			case "action":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			case "condition":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			case "delay":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			default:
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				);
		}
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsDragging(true);
		setDragStart({
			x: e.clientX - node.position.x,
			y: e.clientY - node.position.y,
		});
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			onUpdate({
				position: {
					x: e.clientX - dragStart.x,
					y: e.clientY - dragStart.y,
				},
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [isDragging, dragStart]);

	const handleTitleChange = (newTitle: string) => {
		onUpdate({ title: newTitle });
	};

	const handleTypeChange = (newType: string) => {
		onUpdate({ type: newType });
	};

	return (
		<>
			<div
				ref={nodeRef}
				className={`absolute bg-white rounded-lg shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-move ${
					isDragging ? "shadow-2xl scale-105" : ""
				}`}
				style={{
					left: node.position.x,
					top: node.position.y,
					width: 200,
					minHeight: 100,
				}}
				onMouseDown={handleMouseDown}
			>
				{/* Node Header */}
				<div className={`${getNodeTypeColor(node.type)} text-white p-3 rounded-t-lg`}>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							{getNodeTypeIcon(node.type)}
							<span className="font-medium text-sm capitalize">{node.type}</span>
						</div>
						<div className="flex items-center space-x-1">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowConfig(!showConfig);
								}}
								className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
								className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{/* Node Content */}
				<div className="p-3">
					{isEditing ? (
						<input
							type="text"
							value={node.title}
							onChange={(e) => handleTitleChange(e.target.value)}
							onBlur={() => setIsEditing(false)}
							onKeyPress={(e) => e.key === "Enter" && setIsEditing(false)}
							className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
							autoFocus
						/>
					) : (
						<h3
							className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 rounded px-1"
							onClick={() => setIsEditing(true)}
						>
							{node.title}
						</h3>
					)}
					<p className="text-xs text-gray-500 mt-1">{node.description}</p>
				</div>

				{/* Configuration Panel */}
				{showConfig && (
					<div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
						<div className="space-y-2">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Node Type</label>
								<select
									value={node.type}
									onChange={(e) => handleTypeChange(e.target.value)}
									className="w-full text-xs border border-gray-300 rounded px-2 py-1"
								>
									<option value="trigger">Trigger</option>
									<option value="action">Action</option>
									<option value="condition">Condition</option>
									<option value="delay">Delay</option>
								</select>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
								<input
									type="text"
									value={node.description}
									onChange={(e) => onUpdate({ description: e.target.value })}
									className="w-full text-xs border border-gray-300 rounded px-2 py-1"
									placeholder="Enter description"
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
