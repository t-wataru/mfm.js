export type MatcherContext = {
	input: string;
};

export type MatcherResultSuccess = {
	success: true;
	length: number;
	data: any;
};

export type MatcherResultFail = {
	success: false;
};

export type MatcherResult = MatcherResultSuccess | MatcherResultFail;

export type SuccessMatcher = (ctx: MatcherContext, pos: number) => MatcherResultSuccess;

export type Matcher = (ctx: MatcherContext, pos: number) => MatcherResult;

export function success(length: number, data?: any): MatcherResultSuccess {
	return {
		success: true,
		length: length,
		data: data
	};
}

const failObject: MatcherResultFail = {
	success: false
};
export function fail(): MatcherResultFail {
	return failObject;
}

export function repetition(atLeast: 0, matcher: Matcher): SuccessMatcher
export function repetition(atLeast: number, matcher: Matcher): Matcher
export function repetition(atLeast: number, matcher: Matcher) {
	return (ctx: MatcherContext, pos: number) => {
		let count = 0;
		let offset = 0;
		const content: any[] = [];
		while (true) {
			const result = matcher(ctx, pos + offset);
			if (!result.success) break;
			content.push(result.data);
			offset += result.length;
			count++;
		}
		if (count < atLeast) return fail();
		return success(offset, content);
	};
}

export function choice(matchers: Matcher[]): Matcher {
	return (ctx: MatcherContext, pos: number) => {
		for (const matcher of matchers) {
			const result = matcher(ctx, pos);
			if (result.success) return result;
		}
		return fail();
	};
}
