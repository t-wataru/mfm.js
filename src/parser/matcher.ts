export type MatcherContext = {
	input: string;
};

export type MatcherSuccess<T> = {
	success: true;
	length: number;
	data: T;
};

export type MatcherFail = {
	success: false;
};

export function success<T>(length: number, data: T): MatcherSuccess<T> {
	return {
		success: true,
		length: length,
		data: data
	};
}

const failObject: MatcherFail = {
	success: false
};
export function fail(): MatcherFail {
	return failObject;
}
