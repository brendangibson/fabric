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
	weight?: number;
	thickness?: number;
	remaining?: number;
	holdsLength?: number;
	incomingLength?: number;
	standbyLength?: number;
	glenRavenName?: string;
	rolls?: TRoll[];
	incoming?: TIncoming[];
	holds?: THold[];
	standby: TStandby[];
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

export type THold = {
	id: string;
	timestamp: string;
	expires: string;
	reason: string;
	owner: string;
	noted: string;
	pending: boolean;
	notes: string;
	length: number;
	orderId: string;
};

export type TStandby = {
	id: string;
	length: number;
};

export type TShipment = {
	id: string;
	name: string;
};
