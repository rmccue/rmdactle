import deburr from 'lodash/deburr';
import { FormEvent, useEffect, useState } from 'react';

import Content from './Content';
import Sidebar from './Sidebar';
import { Article } from './types';
import { isStopword, isValidGuess } from './util';

interface Props {
	article: Article | null,
}

export default function Game( props: Props ) {
	const { article } = props;
	const [ guesses, setGuesses ] = useState<string[]>( [] );
	const [ nextGuess, setNextGuess ] = useState<string>( '' );
	const [ selectedGuess, setSelectedGuess ] = useState<string | null>( null );
	const [ selectedGuessIndex, setSelectedGuessIndex ] = useState<number>( 0 );
	const [ isSolved, setIsSolved ] = useState<boolean>( false );

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

		alert( `Solved after ${ guesses.length } guesses` );

		const found = guesses.reduce( ( hits, guess ) => article.stats[ guess ] > 0 ? hits + 1 : hits, 0 );
		const accuracy = ( ( found / guesses.length ) * 100 ).toFixed(2);
		alert( `${ accuracy }% accuracy` );
	}, [ detectSolved ] );

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

	const onSubmit = ( e: FormEvent ) => {
		e.preventDefault();
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
		setNextGuess( '' );

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
		setGuesses( [ ...guesses, normGuess ] );
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

			<form
				className="Footer"
				onSubmit={ onSubmit }
			>
				<button
					type="button"
					onClick={ () => document.getElementById( 'Content' )?.scrollTo( {
						top: 0,
						behavior: 'smooth',
					} ) }
				>▲ Top</button>
				<input
					disabled={ detectSolved }
					type="text"
					value={ nextGuess }
					onChange={ e => setNextGuess( e.target.value ) }
				/>
				<button type="submit">Guess</button>
			</form>
		</div>
	);
}
