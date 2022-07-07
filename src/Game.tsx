import deburr from 'lodash/deburr';
import { useEffect, useState } from 'react';

import Content from './Content';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Article, Game, GameStats } from './types';
import { isStopword, isValidGuess } from './util';

interface Props {
	article: Article | null,
	game: Game,
	guesses: string[],
	onSetGuesses( guesses: string[] ): void,
	onSolve( stats: GameStats ): void,
}

export default function GameComponent( props: Props ) {
	const { article, guesses, onSolve } = props;
	const [ selectedGuess, setSelectedGuess ] = useState<string | null>( null );
	const [ selectedGuessIndex, setSelectedGuessIndex ] = useState<number>( 0 );

	const detectSolved = article?.titleParts.reduce( ( solved, part ) => {
		if ( part.element !== 'text' ) {
			return solved;
		}
		if ( isStopword( part.normalized ) ) {
			return solved;
		}

		return solved && guesses.indexOf( part.normalized ) >= 0;
	}, true ) || false;

	useEffect( () => {
		if ( ! detectSolved || ! article ) {
			return;
		}

		const found = guesses.reduce( ( hits, guess ) => article.stats[ guess ] > 0 ? hits + 1 : hits, 0 );
		const accuracy = found / guesses.length;
		onSolve( {
			accuracy,
			guesses: guesses.length,
			solved: true,
		} );
	}, [ article, detectSolved, guesses, onSolve ] );

	const onSelectGuess = ( guess: string ) => {
		if ( ! article ) {
			return;
		}

		if ( guess !== selectedGuess ) {
			setSelectedGuess( guess );
			setSelectedGuessIndex( 1 );
			return;
		}

		const maxIndex = article.stats[ guess ];
		const nextIndex = selectedGuessIndex + 1;
		if ( nextIndex > maxIndex ) {
			setSelectedGuessIndex( 1 );
		} else {
			setSelectedGuessIndex( nextIndex );
		}

	};

	const onSubmit = ( nextGuess: string, clear: () => void ) => {
		if ( detectSolved ) {
			return;
		}

		if ( nextGuess === '' && selectedGuess ) {
			// Special-case, jump to next selected.
			onSelectGuess( selectedGuess );
			return;
		}

		const normGuess = deburr( nextGuess.trim() ).toLowerCase();
		if ( ! isValidGuess( normGuess ) ) {
			alert( 'Invalid guess; you can only guess one word at once.' );
			return;
		}

		// Clear input.
		clear();

		if ( isStopword( normGuess ) ) {
			alert( 'Stopword; no need to guess this!' );
			return;
		}

		// Have we already guessed this?
		if ( guesses.indexOf( normGuess ) >= 0 ) {
			onSelectGuess( normGuess );
			return;
		}

		// Add to guesses.
		props.onSetGuesses( [ ...guesses, normGuess ] );
		onSelectGuess( normGuess );
	};

	return (
		<div className="Game">
			{ article ? (
				<Content
					article={ article }
					guesses={ guesses }
					selected={ selectedGuess }
					selectedIndex={ selectedGuessIndex }
					solved={ detectSolved }
				/>
			) : (
				<p>Loading…</p>
			) }

			<Sidebar
				article={ article }
				guesses={ guesses }
				selected={ selectedGuess }
				onSelectGuess={ onSelectGuess }
			/>

			<Footer
				solved={ detectSolved }
				onSubmit={ onSubmit }
			/>
		</div>
	);
}
