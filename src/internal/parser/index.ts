import { mergeText } from '../util';
import { BOLD, FN, MfmInline, MfmNode, MfmPlainNode } from '../../node';
import { choice, define, ParserContext, ParserResult, repetition } from './lib';

export function parseFull(input: string): MfmNode[] {
	const ctx = new ParserContext(input);

	const parser = repetition(0, choice([
		quoteParser, // block
		codeBlockParser, // block
		mathBlockParser, // block
		centerParser, // block
		emojiCodeParser,
		unicodeEmojiParser,
		bigParser,
		boldParser,
		smallParser,
		italicParser,
		strikeParser,
		inlineCodeParser,
		mathInlineParser,
		mentionParser,
		hashtagParser,
		urlParser,
		fnVer2Parser,
		linkParser,
		fnVer1Parser,
		searchParser, // block
		textParser
	]));

	if (!parser(ctx)) {
		throw new Error('parsing error');
	}

	return mergeText(ctx.result);
}

export function parsePlain(input: string): MfmPlainNode[] {
	const ctx = new ParserContext(input);

	const parser = repetition(0, choice([
		emojiCodeParser,
		unicodeEmojiParser,
		textParser
	]));
	if (!parser(ctx)) {
		throw new Error('parsing error');
	}

	return mergeText(ctx.result) as MfmPlainNode[];
}

const inlineParser = define((ctx) => {
	const parser = choice([
		emojiCodeParser,
		unicodeEmojiParser,
		bigParser,
		boldParser,
		smallParser,
		italicParser,
		strikeParser,
		inlineCodeParser,
		mathInlineParser,
		mentionParser,
		hashtagParser,
		urlParser,
		fnVer2Parser,
		linkParser,
		fnVer1Parser,
		textParser
	]);
	return parser(ctx);
});

//
// blocks
//

const quoteParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const searchParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const codeBlockParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const mathBlockParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const centerParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const emojiCodeParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const unicodeEmojiParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const bigParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

/*
 * bold = "**" (!"**" inline)+ "**"
*/
const boldParser = define((ctx) => {
	if (ctx.read(2) != '**') {
		return ctx.fail();
	}

	const content: any[] = [];
	while (ctx.seek(2) != '**') {
		if (!inlineParser(ctx)) break;
		content.push(ctx.result);
	}
	if (content.length < 1) {
		return ctx.fail();
	}

	if (ctx.read(2) != '**') {
		return ctx.fail();
	}
	return ctx.ok(BOLD(mergeText(content) as MfmInline[]));
});

const smallParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const italicParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const strikeParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const inlineCodeParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const mathInlineParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const mentionParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const hashtagParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const urlParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

const linkParser = define((ctx) => {
	// TODO
	return ctx.fail();
});

/**
 * fnVer1 = "[" name:$([a-z0-9_]i)+ args:fnArgs? _ content:fnContentPart+ "]"
 * fnArgs = "." head:fnArg tails:("," arg:fnArg { return arg; })*
 * fnArg
 * 	= k:$([a-z0-9_]i)+ "=" v:$([a-z0-9_.]i)+
 * 	/ k:$([a-z0-9_]i)+
 * fnContentPart = !("]") i:inlineWithoutFn { return i; }
 * 
*/
function fnVer1Parser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

const fnVer2Parser = define((ctx) => {
	// TODO
	return ctx.fail();
});

/*
 * text = .
*/
const textParser = define((ctx) => {
	const c = ctx.read(1);
	if (c.length == 0) {
		return ctx.fail();
	}

	return ctx.ok(c);
});
