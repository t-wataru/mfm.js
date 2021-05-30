import { BOLD, MfmBold, MfmInline, MfmNode, MfmPlainNode } from '../node';
import { mergeText } from '../util';
import { fail, MatcherContext, MatcherFail, MatcherSuccess, success } from './matcher';

export function parseFull(input: string): MfmNode[] {
	const ctx = {
		input: input
	};
	let offset = 0;

	const content = [] as (MfmNode | string)[];
	while (true) {
		const inlineResult = matchInline(ctx, offset);
		if (inlineResult.success) {
			content.push(inlineResult.data);
			offset += inlineResult.length;
			continue;
		}

		break;
	}

	return mergeText(content);
}

export function parsePlain(input: string): MfmPlainNode[] {
	// TODO
	return [];
}

function matchInline(ctx: MatcherContext, offset: number) {
	const boldResult = matchBold(ctx, offset);
	if (boldResult.success) return boldResult;

	const textResult = matchText(ctx, offset);
	if (textResult.success) return textResult;

	return fail();
}

/*
 * bold = "**" (!"**" inline)+ "**"
*/
function matchBold(ctx: MatcherContext, pos: number): MatcherSuccess<MfmBold> | MatcherFail {
	let offset = 0;
	if (ctx.input.substr(pos + offset, 2) != '**') {
		return fail();
	}
	offset += 2;

	let count = 0;
	const children = [] as (MfmInline | string)[];
	while (ctx.input.substr(pos + offset, 2) != '**') {
		const i = matchInline(ctx, pos + offset);
		if (!i.success) break;
		children.push(i.data);
		offset += i.length;
		count++;
	}
	if (count == 0) return fail();

	if (ctx.input.substr(pos + offset, 2) != '**') {
		return fail();
	}
	offset += 2;

	return success(offset, BOLD(mergeText(children) as MfmInline[]));
}

function matchText(ctx: MatcherContext, pos: number): MatcherSuccess<string> | MatcherFail {
	const c = ctx.input.substr(pos, 1);
	if (c.length == 0) {
		return fail();
	}
	return success(1, c);
}
