export type TRoll {
	id: string;
	originalLength?: number;
	returned?: boolean;
	glenRavenId?: string;
	cuts: TCut[]
}

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
	rolls?: TRoll[]
};

export type TCut = {
	rollId: string;
	length: number;
};

export type TRoll = {
	originalLength: number;
	cuts: TCut[];
};
