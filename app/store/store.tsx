import { configureStore } from "@reduxjs/toolkit";
import workflowReducer from "../features/workflowSlice";

export default configureStore({
	reducer: {
		workflowApp: workflowReducer,
	},
});
