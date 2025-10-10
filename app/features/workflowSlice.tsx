import { createSlice } from "@reduxjs/toolkit";

type AppState = {
	counter: number;
	user: any;
	apps: any[];
	steps: any[];
	stagedApp: any[];
};

export const appSlice = createSlice({
	name: "app",
	initialState: {
		counter: 0,
		user: null,
		apps: [],
		steps: [],
		stagedApp: [],
	} as AppState,
	reducers: {
		increment: (state) => {
			state.counter += 1;
		},
		setUser: (state, action) => {
			state.user = action.payload;
		},
		setApps: (state, action) => {
			state.apps = action.payload;
		},
		addStep: (state, action) => {
			state.steps.push(action.payload);
		},
		removeStep: (state, action) => {
			state.steps = state.steps.filter((step) => step.id !== action.payload);
		},
		setStagedApp: (state, action) => {
			state.stagedApp.push(action.payload);
		},
		removeStagedApp: (state, action) => {
			state.apps = state.apps.filter((app) => app.id !== action.payload);
		},
	},
});

export const { increment, setUser, setApps, addStep } = appSlice.actions;
export default appSlice.reducer;
