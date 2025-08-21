export type TCut = {
	id: string;
	rollId: string;
	length: number;
	notes: string;
	reason: string;
	orderId: string;
	timestamp: string;
};

export type THold = {
	id: string;
	styleColourId: string;
	timestamp: string;
	expires: string;
	reason: string;
	owner: string;
	noted: string;
	pending: boolean;
	notes: string;
	length: number;
	orderId: string;
	styleColour?: TStyleColour;
};

export type TIncoming = {
	id: string;
	expected: string;
	orderId: string;
	notes: string;
	length: number;
};

export type TRoll = {
	id: string;
	originalLength?: number;
	returned?: boolean;
	glenRavenId?: string;
	cuts: TCut[];
	styleColour?: TStyleColour;
	shipment?: TShipment;
	notes?: string;
};

export type TShipment = {
	id: string;
	name: string;
	dateReceived: string;
	dateSent: string;
	glenRavenId: string;
};

export type TStandby = {
	id: string;
	length: number;
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
	rate?: number;
	styleId: string;
	sku?: string;
};

export type StockQuery = {
	style?: string;
	colour?: string;
	sku?: string;
	minStock?: number;
	maxStock?: number;
	includeHolds?: boolean;
	includeIncoming?: boolean;
	includeStandby?: boolean;
	asOfDate?: string;
};

export type StockResponse = {
	timestamp: string;
	query: StockQuery;
	results: TStyleColour[];
	summary: {
		totalItems: number;
		totalStock: number;
		totalHolds: number;
		totalIncoming: number;
		totalStandby: number;
	};
};
