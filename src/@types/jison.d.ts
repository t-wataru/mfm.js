declare module 'jison' {
	export class Parser {
		constructor(grammar: Record<string, any>, opt?: Record<string, any>);
		generate(): string;
		parse(input: string): any;
	}
}
