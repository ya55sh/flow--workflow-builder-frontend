import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Step = { stepId: string; stepType: string; appName?: string };

export type StagedApp = {
	stepId: string;
	appName: string;
	connected?: boolean;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};

type AppState = {
	counter: number;
	user: any;
	apps: any[];
	steps: Step[]; // or more specific type
	stagedApp: StagedApp[];
};

export const appSlice = createSlice({
	name: "app",
	initialState: {
		counter: 0,
		user: null,
		apps: [],
		steps: [{ stepId: "1", stepType: "trigger" }],
		stagedApp: [],
	} as AppState,
	reducers: {
		increment: (state) => {
			state.counter += 1;
		},

		setUser: (state, action: PayloadAction<any>) => {
			state.user = action.payload;
		},

		setApps: (state, action: PayloadAction<any[]>) => {
			state.apps = action.payload;
		},

		setStep: (state, action) => {
			state.steps.push(action.payload);
		},

		updateStep: (state, action: PayloadAction<Step>) => {
			const { stepId, appName } = action.payload;
			state.steps = state.steps.map((step) => (step.stepId === stepId ? { ...step, appName } : step));
		},

		removeStep: (state, action) => {
			if (state.steps.length > 1) state.steps = state.steps.filter((step) => step.stepId !== action.payload);
		},

		setStagedApp: (state, action: PayloadAction<StagedApp>) => {
			console.log("Setting stagedApp:", action.payload);
			const { stepId, appName } = action.payload;
			const app = state.stagedApp.find((a) => a.stepId === stepId);

			if (app) {
				app.appName = appName;
			} else {
				state.stagedApp.push(action.payload);
			}
		},

		addOrUpdateStagedApp: (state, action: PayloadAction<StagedApp>) => {
			const index = state.stagedApp.findIndex((a) => a.appName === action.payload.appName);
			if (index > -1) {
				state.stagedApp[index] = { ...state.stagedApp[index], ...action.payload };
			} else {
				state.stagedApp.push(action.payload);
			}
		},

		removeStagedApp: (state, action: PayloadAction<StagedApp>) => {
			const { stepId, appName } = action.payload;
			state.stagedApp = state.stagedApp.filter((a) => a.stepId !== stepId);
		},

		updateAppTokens: (
			state,
			action: PayloadAction<{
				name: string;
				accessToken?: string;
				refreshToken?: string;
				expiresAt?: number;
			}>
		) => {
			const app = state.stagedApp.find((a) => a.appName === action.payload.name);
			if (app) {
				if (action.payload.accessToken) app.accessToken = action.payload.accessToken;
				if (action.payload.refreshToken) app.refreshToken = action.payload.refreshToken;
				if (action.payload.expiresAt) app.expiresAt = action.payload.expiresAt;
				app.connected = true;
			}
		},
	},
});

export const {
	increment,
	setUser,
	setApps,
	setStep,
	updateStep,
	removeStep,
	setStagedApp,
	addOrUpdateStagedApp,
	removeStagedApp,
	updateAppTokens,
} = appSlice.actions;

export default appSlice.reducer;
