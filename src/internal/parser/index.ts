import { mergeText } from '../util';
import { BOLD, MfmInline, MfmNode, MfmPlainNode } from '../../node';
import { choice, fail, MatcherContext, MatcherResult, repetition, success } from '../matcher';

export function parseFull(input: string): MfmNode[] {
	const ctx = {
		input: input
	};

	const matcher = repetition(0, choice([
		matchQuote, // block
		matchCodeBlock, // block
		matchMathBlock, // block
		matchCenter, // block
		matchEmojiCode,
		matchUnicodeEmoji,
		matchBig,
		matchBold,
		matchSmall,
		matchItalic,
		matchStrike,
		matchInlineCode,
		matchMathInline,
		matchMention,
		matchHashtag,
		matchUrl,
		matchFnVer2,
		matchLink,
		matchFnVer1,
		matchSearch, // block
		matchText
	]));
	const result = matcher(ctx, 0);

	return mergeText(result.data);
}

export function parsePlain(input: string): MfmPlainNode[] {
	const ctx = {
		input: input
	};

	const matcher = repetition(0, choice([
		matchEmojiCode,
		matchUnicodeEmoji,
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

//
// blocks
//

function matchQuote(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchSearch(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchCodeBlock(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchMathBlock(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchCenter(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchEmojiCode(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchUnicodeEmoji(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchBig(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
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

function matchSmall(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchItalic(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchStrike(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchInlineCode(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchMathInline(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchMention(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchHashtag(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchUrl(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchLink(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchFnVer1(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
}

function matchFnVer2(ctx: MatcherContext, pos: number): MatcherResult {
	// TODO
	return fail();
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
