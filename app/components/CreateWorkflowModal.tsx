"use client";
import { useState } from "react";

interface CreateWorkflowModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (workflowData: { name: string; description: string }) => void;
}

export default function CreateWorkflowModal({ isOpen, onClose, onCreate }: CreateWorkflowModalProps) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) return;

		setIsLoading(true);
		try {
			await onCreate(formData);
			setFormData({ name: "", description: "" });
			onClose();
		} catch (error) {
			console.error("Error creating workflow:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setFormData({ name: "", description: "" });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Create New Workflow</h2>
					<button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6">
					<div className="mb-4">
						<label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700 mb-2">
							Workflow Name *
						</label>
						<input
							type="text"
							id="workflow-name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter workflow name"
							required
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="workflow-description" className="block text-sm font-medium text-gray-700 mb-2">
							Description
						</label>
						<textarea
							id="workflow-description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
							placeholder="Describe your workflow (optional)"
						/>
					</div>

					<div className="flex justify-end space-x-3">
						<button
							type="button"
							onClick={handleClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading || !formData.name.trim()}
							className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Creating..." : "Create Workflow"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
