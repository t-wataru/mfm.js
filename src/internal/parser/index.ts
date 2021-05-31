import { mergeText } from '../util';
import { BOLD, FN, MfmInline, MfmNode, MfmPlainNode } from '../../node';
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

/**
 * fnVer1 = "[" name:$([a-z0-9_]i)+ args:fnArgs? _ content:fnContentPart+ "]"
 * fnArgs = "." head:fnArg tails:("," arg:fnArg { return arg; })*
 * fnArg
 * 	= k:$([a-z0-9_]i)+ "=" v:$([a-z0-9_.]i)+
 * 	/ k:$([a-z0-9_]i)+
 * fnContentPart = !("]") i:inlineWithoutFn { return i; }
 * 
*/
function matchFnVer1(ctx: MatcherContext, pos: number): MatcherResult {
	let offset = 0;

	// "["
	if (ctx.input[pos + offset] != '[') {
		return fail();
	}
	offset += 1;

	// name
	let name = '';
	while (/^[a-z0-9_]$/i.test(ctx.input[pos + offset])) {
		name += ctx.input[pos + offset];
		offset++;
	}
	if (name.length == 0) {
		return fail();
	}

	// args (option)
	const argsResult = matchFnArgs(ctx, pos + offset);
	if (argsResult.success) {
		offset += argsResult.length;
		console.log('argsResult.length:', argsResult.length);
	}
	const args = argsResult.success ? argsResult.data : { };

	// _
	if (!/^[ 　\t\u00a0]$/.test(ctx.input[pos + offset])) {
		console.log('_ fail');
		return fail();
	}
	offset++;

	// content
	const contentMatcher = repetition(1, (_, p) => {
		if (ctx.input[p] == ']') return fail();
		return matchInline(ctx, p);
	});
	const contentResult = contentMatcher(ctx, pos + offset);
	if (!contentResult.success) return contentResult;
	offset += contentResult.length;
	const content = mergeText(contentResult.data) as MfmInline[];

	// "]"
	if (ctx.input[pos + offset] != ']') {
		console.log('] fail');
		return fail();
	}
	offset += 1;

	console.log('success matchFnVer1');

	return success(offset, FN(name, args, content));
}

function matchFnArgs(ctx: MatcherContext, pos: number): MatcherResult {
	let mainOffset = 0;

	console.log('enter matchFnArgs');

	if (ctx.input[pos + mainOffset] != '.') return fail();
	mainOffset++;

	const head = matchFnArg(ctx, pos + mainOffset);
	if (!head.success) {
		console.log('head fail');
		return fail();
	}
	mainOffset += head.length;

	const tailsMatcher = repetition(0, (_, p) => {
		let offset = 0;
		if (ctx.input[p + offset] != ',') {
			console.log(', fail');
			return fail();
		}
		offset++;
		const tail = matchFnArg(ctx, p + offset);
		if (!tail.success) return fail();
		offset += tail.length;
		console.log('tails offset', offset);
		return success(offset, tail.data);
	});
	const tails = tailsMatcher(ctx, pos + mainOffset);
	if (!tails.success) return fail();
	mainOffset += tails.length;

	console.log('success matchFnArgs');

	return success(mainOffset, [head.data, ...tails.data]);
};

function matchFnArg(ctx: MatcherContext, pos: number): MatcherResult {
	let mainOffset = 0;

	console.log('enter matchFnArg');

	const kResult = /^[a-z0-9_]+/i.exec(ctx.input.substr(pos + mainOffset));
	if (kResult == null) {
		console.log('kResult fail');
		return fail();
	}
	const key = kResult[0];
	mainOffset += key.length;

	function valueMatcher(_: MatcherContext, p: number): MatcherResult {
		let offset = 0;
		console.log('enter valueMatcher');

		if (ctx.input[p + offset] != '=') {
			console.log('= fail');
			return fail();
		}
		offset++;

		const vResult = /^[a-z0-9_]+/i.exec(ctx.input.substr(p + offset));
		if (vResult == null) {
			console.log('v fail');
			return fail();
		}
		const v = vResult[0];
		offset += v.length;

		console.log('valueMatcher success');
		return success(offset, v);
	}
	const valueResult = valueMatcher(ctx, pos + mainOffset);
	const value = valueResult.success ? valueResult.data : true;
	if (valueResult.success) {
		mainOffset += valueResult.length;
	}

	console.log('success matchFnArg');
	console.log('matchFnArg length:', mainOffset);

	return success(mainOffset, { k: key, v: value });
};

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
