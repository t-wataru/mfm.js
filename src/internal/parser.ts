import { Parser } from 'jison';
import { promises as fs }  from 'fs';
import { MfmNode, MfmPlainNode } from '../node';

const grammar = {
	lex: {
		rules: [
			["\\s+", ""],
			["\\*{2,3}", "return yyleng == 2 ? '**' : '***';"],
			[".", "return 'CHAR';"],
		]
	},
	operators: [
		["left", "CHAR"],
		["left", "STR"],
		["left", "***"],
		["left", "**"],
		["left", "BOLD"],
		["left", "BIG"],
	],
	//tokens: "** *** CHAR",
	startSymbol: "Inlines",
	bnf: {
		Inlines: [
			["Inlines Inline", "return $$ = [...$1, $2];"],
			["Inline", "return $$ = $1;"]
		],
		Inline: [
			["** Inlines **", "$$ = { type: 'bold', value: $2 }", { prec: "BOLD" }],
			["*** Inlines ***", "$$ = { type: 'big', value: $2 }", { prec: "BIG" }],
			["Str", "$$ = $1", { prec: "STR" }],
			//["CHAR", "$$ = $1"]
		],
		Str: [
			["Str CHAR", "$$ = $1+$2"],
			["CHAR", "$$ = $1"]
		]
	}
};

export function parseFull(input: string): MfmNode[] {
	const parser = new Parser(grammar, /*{ type: 'slr' }*/);
	const src = parser.generate();
	//fs.writeFile('parser.js', src);
	const result = parser.parse(input);
	console.log('result:', result);

	return [];
}

export function parsePlain(input: string): MfmPlainNode[] {
	return [];
}
