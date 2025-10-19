import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Step = { stepId: string; stepType: string; appName?: string };

export type StagedApp = {
	stepId: string;
	appName: string;
	connected?: boolean;
	expired?: boolean; // for reauth app in case of expiry
	hasUser?: boolean; //has user is for initial render that tells where to show signin or connected/reauth
};

export type CardState = {
	stepId: string;
	stepType: string;
};

export type userApps = {
	appName: string;
	connected?: boolean;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: number;
};

export type User = {
	id: string;
	email: string;
	userApp?: userApps[];
};

type AppState = {
	counter: number;
	user: any;
	apps: any[];
	steps: Step[]; // or more specific type
	stagedApp: StagedApp[];
	cardStatus: boolean;
	cardState: CardState;
};

export const appSlice = createSlice({
	name: "app",
	initialState: {
		counter: 0,
		user: null,
		apps: [],
		steps: [{ stepId: "1", stepType: "trigger" }],
		stagedApp: [],
		cardStatus: false,
		cardState: { stepId: "", stepType: "" },
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
			const { stepId, appName, connected, expired, hasUser } = action.payload;
			const app = state.stagedApp.find((a) => a.stepId === stepId);

			if (app) {
				app.appName = appName;
				app.connected = connected;
				app.expired = expired;
				app.hasUser = hasUser;
			} else {
				state.stagedApp.push(action.payload);
			}
		},

		removeStagedApp: (state, action: PayloadAction<StagedApp>) => {
			const { stepId, appName } = action.payload;
			state.stagedApp = state.stagedApp.filter((a) => a.stepId !== stepId);
		},

		setCardEnabled: (state, action: PayloadAction<boolean>) => {
			state.cardStatus = action.payload;
		},

		setCardState: (state, action: PayloadAction<CardState>) => {
			state.cardState = action.payload;
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
	removeStagedApp,
	setCardEnabled,
	setCardState,
} = appSlice.actions;

export default appSlice.reducer;
