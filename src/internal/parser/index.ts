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
const fnVer1Parser = define((ctx) => {
	// "["
	if (ctx.read(1) != '[') {
		return ctx.fail();
	}

	// name
	let name = '';
	while (/^[a-z0-9_]$/i.test(ctx.seek(1))) {
		name += ctx.read(1);
	}
	if (name.length == 0) return ctx.fail();

	// args (option)
	const args = fnArgsParser(ctx) ? ctx.result as Record<string, any> : { };

	// space
	if (!/^[ 　\t\u00a0]$/.test(ctx.read(1))) {
		return ctx.fail();
	}

	// content
	const content: any[] = [];
	while (ctx.seek(1) != ']') {
		const success = inlineParser(ctx);
		if (!success) break;
		content.push(ctx.result);
	}
	if (content.length < 1) return ctx.fail();

	// "]"
	if (ctx.read(1) != ']') {
		return ctx.fail();
	}

	return ctx.ok(FN(name, args, mergeText(content) as MfmInline[]));
});

const fnArgsParser = define((ctx) => {
	// "."
	if (ctx.read(1) != '.') {
		return ctx.fail();
	}

	if (!fnArgParser(ctx)) return ctx.fail();
	const head = ctx.result;

	const tailsParser = repetition(0, define(c => {
		if (c.read(1) != ',') return c.fail();
		if (!fnArgParser(c)) return c.fail();
		return c.ok(c.result);
	}));
	tailsParser(ctx);
	const tails: any[] = ctx.result;

	const args: Record<string, any> = { };
	for (const pair of [head, ...tails]) {
		args[pair.k] = pair.v;
	}

	return ctx.ok(args);
});

const fnArgParser = define((ctx) => {

	// key
	let key = '';
	while (/^[a-z0-9_]$/i.test(ctx.seek(1))) {
		key += ctx.read(1);
	}
	if (key.length < 1) return ctx.fail();

	const valueParser = define(c => {
		// "="
		if (c.read(1) != '=') {
			return c.fail();
		}

		// value
		let v = '';
		while (/^[a-z0-9_]$/i.test(c.seek(1))) {
			v += c.read(1);
		}
		if (v.length < 1) return c.fail();

		return c.ok(v);
	});

	// value (option)
	const value = valueParser(ctx) ? ctx.result : true;

	return ctx.ok({ k: key, v: value });
});

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
