import { ast, Config, GrammarError, LocationRange, OutputFormatAmdCommonjsEs, ParserBuildOptions } from 'peggy';

export function use(config: Config, options: OutputFormatAmdCommonjsEs) {

	function reportTest(ast: ast.Grammar, options: ParserBuildOptions): void {
		throw new GrammarError('test');
	};
	config.passes.check.push(reportTest);

	//console.log(config);
	//console.log(options);
}
