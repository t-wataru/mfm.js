import { mergeText } from '../util';
import { BOLD, FN, MfmInline, MfmNode, MfmPlainNode } from '../../node';
import { choice, ParserContext, ParserResult, repetition } from './lib';

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

	if (!ctx.call(parser)) {
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
	if (!ctx.call(parser)) {
		throw new Error('parsing error');
	}

	return mergeText(ctx.result) as MfmPlainNode[];
}

function inlineParser(ctx: ParserContext): ParserResult {
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
	return ctx.call(parser);
}

//
// blocks
//

function quoteParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function searchParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function codeBlockParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function mathBlockParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function centerParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function emojiCodeParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function unicodeEmojiParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function bigParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

/*
 * bold = "**" (!"**" inline)+ "**"
*/
function boldParser(ctx: ParserContext): ParserResult {
	if (ctx.read(2) != '**') {
		return ctx.fail();
	}

	const content: any[] = [];
	while (ctx.seek(2) != '**') {
		if (!ctx.call(inlineParser)) break;
		content.push(ctx.result);
	}
	if (content.length < 1) {
		return ctx.fail();
	}

	if (ctx.read(2) != '**') {
		return ctx.fail();
	}
	return ctx.ok(BOLD(mergeText(content) as MfmInline[]));
}


function smallParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function italicParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function strikeParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function inlineCodeParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function mathInlineParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function mentionParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function hashtagParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function urlParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function linkParser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
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
function fnVer1Parser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

function fnVer2Parser(ctx: ParserContext): ParserResult {
	// TODO
	return ctx.fail();
}

/*
 * text = .
*/
function textParser(ctx: ParserContext): ParserResult {
	const c = ctx.read(1);
	if (c.length == 0) {
		return ctx.fail();
	}

	return ctx.ok(c);
}
