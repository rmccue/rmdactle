import { eng } from 'stopword';
import { tokenize as baseTokenize } from 'string-punctuation-tokenizer';

import { Guesses } from './types';

export const indexWords = ( words: string[] ) => words.reduce<Guesses>( ( indexed, word ) => ( { ...indexed, [ word ]: true } ), {} );
export const indexedStops = indexWords( eng );

export const isStopword = ( word: string ) => !! indexedStops[ word ];

export function tokenize( content: string ) {
	return baseTokenize( {
		text: content,
		includeWords: true,
		includeNumbers: true,
		includePunctuation: true,
		includeWhitespace: true,
		includeUnknown: true,
		greedy: true,
		verbose: true,
	} );
}

export function isValidGuess( guess: string ) {
	const tokens = tokenize( guess );
	if ( tokens.length !== 1 ) {
		return false;
	}

	return tokens[0].type === 'word';
}
