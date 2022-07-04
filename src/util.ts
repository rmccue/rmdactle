import pickBy from 'lodash/pickBy';
import { DateTime } from 'luxon';
import eng from './stopwords.json';
import { tokenize as baseTokenize } from 'string-punctuation-tokenizer';

import _gameData from './data.json';
import { Game, GameMap, Guesses } from './types';

const gameData: GameMap = _gameData;

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

export function getCurrentGame() {
	return DateTime.now().toISODate();
}

export function getGame( id: string ): Game | null {
	return gameData[ id ] || null;
}

/**
 * Get all games which have unlocked.
 */
export function getUnlockedGames() {
	const current = gameData[ getCurrentGame() ];
	if ( ! current ) {
		return {};
	}

	return pickBy( gameData, game => game.number <= current.number );
}
