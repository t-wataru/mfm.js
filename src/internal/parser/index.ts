import { mergeText } from '../util';
import { BOLD, MfmInline, MfmNode, MfmPlainNode } from '../../node';
import { choice, fail, MatcherContext, MatcherResult, repetition, success } from '../matcher';

export function parseFull(input: string): MfmNode[] {
	const ctx = {
		input: input
	};

	const matcher = repetition(0, choice([
		matchInline
		// TODO
	]));
	const result = matcher(ctx, 0);

	return mergeText(result.data);
}

export function parsePlain(input: string): MfmPlainNode[] {
	const ctx = {
		input: input
	};

	const matcher = repetition(0, choice([
		// TODO
		matchText
	]));
	const result = matcher(ctx, 0);

	return mergeText(result.data) as MfmPlainNode[];
}

function matchInline(ctx: MatcherContext, pos: number): MatcherResult {
	const matcher = choice([
		matchBold,
		matchText
	]);
	return matcher(ctx, pos);
}

/*
 * bold = "**" (!"**" inline)+ "**"
*/
function matchBold(ctx: MatcherContext, pos: number): MatcherResult {
	let offset = 0;

	if (ctx.input.substr(pos + offset, 2) != '**') {
		return fail();
	}
	offset += 2;

	const contentMatcher = repetition(1, (_, p) => {
		if (ctx.input.substr(p, 2) == '**') return fail();
		return matchInline(ctx, p);
	});
	const contentResult = contentMatcher(ctx, pos + offset);
	if (!contentResult.success) return fail();
	offset += contentResult.length;

	if (ctx.input.substr(pos + offset, 2) != '**') {
		return fail();
	}
	offset += 2;

	return success(offset, BOLD(mergeText(contentResult.data) as MfmInline[]));
}

/*
 * text = .
*/
function matchText(ctx: MatcherContext, pos: number): MatcherResult {
	const c = ctx.input.substr(pos, 1);
	if (c.length == 0) {
		return fail();
	}

	return success(1, c);
}
