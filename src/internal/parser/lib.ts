export type ParserResult = boolean;

export type ParserHnadler = (ctx: ParserContext) => ParserResult;

export class ParserContext {
	input: string;
	pos: number;
	result: any;

	constructor(input: string) {
		this.input = input;
		this.pos = 0;
	}

	seek(length: number, offset: number = 0) {
		return this.input.substr(this.pos + offset, length);
	}

	read(length: number) {
		const slice = this.input.substr(this.pos, length);
		this.pos += slice.length;
		return slice;
	}

	move(offset: number) {
		if (this.pos + offset < 0) {
			this.pos = 0;
		}
		else if (this.pos + offset < this.input.length) {
			this.pos += offset;
		}
		else {
			this.pos = this.input.length;
		}
	}

	ok(result: any): true {
		this.result = result;
		return true;
	}

	fail(): false {
		return false;
	}
}

export function define(handler: ParserHnadler) {
	return (ctx: ParserContext) => {
		const originalPos = ctx.pos;
		const success = handler(ctx);
		if (!success) {
			// backtrack
			ctx.pos = originalPos;
		}
		return success;
	};
}

/**
 * Generates a new parser of repetition matching.
*/
export function repetition(atLeast: number, handler: ParserHnadler): ParserHnadler {
	return (ctx: ParserContext) => {
		let count = 0;
		const content: any[] = [];
		while (true) {
			const success = handler(ctx);
			if (!success) break;
			content.push(ctx.result);
			count++;
		}
		if (count < atLeast) return ctx.fail();
		return ctx.ok(content);
	};
}

/**
 * Generates a new parser of prioritized choice.
*/
export function choice(handlers: ParserHnadler[]): ParserHnadler {
	return (ctx: ParserContext) => {
		for (const handler of handlers) {
			if (handler(ctx)) return true;
		}
		return false;
	};
}
