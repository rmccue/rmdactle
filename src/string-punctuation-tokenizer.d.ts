declare module 'string-punctuation-tokenizer' {
	interface TokenizeOptions {
		text: string,
		includeWords?: boolean,
		includeNumbers?: boolean,
		includePunctuation?: boolean,
		includeWhitespace?: boolean,
		includeUnknown?: boolean,
		greedy?: boolean,
		verbose?: boolean,
		occurrences?: boolean,
		parsers?: {
			word: any,
			greedyWord: any,
			whitespace: any,
			punctuation: any,
			number: any,
		},
		nomalize?: boolean,
		norrmalizers?: any[],
	}
	interface Token {
		token: string,
		type: 'word' | 'punctuation' | 'whitespace' | 'number',
	};
	function tokenize( options: TokenizeOptions ): Token[];
}
