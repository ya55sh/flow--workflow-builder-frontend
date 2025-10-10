import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../features/workflowSlice";

export default configureStore({
	reducer: {
		app: appReducer,
	},
});
