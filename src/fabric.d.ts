import type { OrderedList } from 'carbon-components-svelte';

export type TRoll = {
	id: string;
	originalLength?: number;
	returned?: boolean;
	glenRavenId?: string;
	cuts: TCut[];
};

export type TStyleColour = {
	id: string;
	swatchUrl?: string;
	colour?: string;
	style?: string;
	remaining?: number;
	holdsLength?: number;
	incomingLength?: number;
	standbyLength?: number;
	glenRavenName?: string;
	rolls?: TRoll[];
	incoming?: TIncoming[];
};

export type TCut = {
	rollId: string;
	length: number;
};

export type TRoll = {
	originalLength: number;
	cuts: TCut[];
};

export type TIncoming = {
	id: string;
	expected: string;
	orderId: string;
	notes: string;
	length: number;
};
