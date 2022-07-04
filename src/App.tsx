import { useEffect, useState } from 'react';

import GameComponent from './Game';
import Header from './Header';
import { Article, Game } from './types';
import { fetchArticle } from './wiki';

import './App.css';
import Selector from './Selector';

const PROGRESS_KEY = 'rmdactle_progress';
const STATS_KEY = 'rmdactle_stats';

type GameStats = {
	solved: boolean,
	guesses: number,
	accuracy: number,
}

type Stats = {
	[ id: string ]: GameStats,
}

type Progress = {
	[ id: string ]: {
		guesses: string[],
	}
}

function App() {
	const [ article, setArticle ] = useState<Article | null>( null );
	const [ game, setGame ] = useState<Game | null>( null );
	const [ progress, setProgress ] = useState<Progress>( {} );
	const [ didLoad, setDidLoad ] = useState<boolean>( false );
	const [ stats, setStats ] = useState<Stats>( {} );

	useEffect( () => {
		if ( didLoad ) {
			return;
		}

		setDidLoad( true );

		// Load progress.
		const savedProgressData = window.localStorage.getItem( PROGRESS_KEY );
		if ( savedProgressData ) {
			const savedProgress = JSON.parse( savedProgressData );
			setProgress( savedProgress );
		}

		// Load stats.
		const savedStatsData = window.localStorage.getItem( STATS_KEY );
		if ( savedStatsData ) {
			const savedStats = JSON.parse( savedStatsData );
			setStats( savedStats );
		}
	}, [ didLoad ] );

	// const game = getGame( gameId );

	useEffect( () => {
		if ( ! game ) {
			return;
		}

		const title = atob( game.title );
		fetchArticle( title ).then( setArticle );
	}, [ game ] );

	useEffect( () => {
		if ( ! stats ) {
			return;
		}


	}, [ stats ] );

	const onSelect = ( game: Game ) => {
		setGame( game );
		setArticle( null );
	};

	const onSetGuesses = ( guesses: string[] ) => {
		if ( ! game ) {
			return;
		}

		const nextProgress = {
			...progress,
			[ game.date ]: {
				guesses,
			},
		};
		setProgress( nextProgress );

		// Mark as started for stats.
		const nextStats = {
			...stats,
			[ game.date ]: {
				guesses: guesses.length,
				accuracy: 0,
				solved: false,
			},
		};
		setStats( nextStats );

		// Sync to local storage.
		window.localStorage.setItem( PROGRESS_KEY, JSON.stringify( nextProgress ) );
		window.localStorage.setItem( STATS_KEY, JSON.stringify( nextStats ) );
	};

	const onSolve = ( gameStats: GameStats ) => {
		if ( ! game ) {
			return;
		}

		const nextStats: Stats = {
			...stats,
			[ game.date ]: {
				...gameStats,
				solved: true,
			},
		};
		setStats( stats );

		alert( `Solved after ${ gameStats.guesses } guesses` );

		alert( `${ ( gameStats.accuracy * 100 ).toFixed( 2 ) }% accuracy` );

		window.localStorage.setItem( STATS_KEY, JSON.stringify( nextStats ) );
	};

	return (
		<div className="App">
			<Header
				game={ game }
				onChangeGame={ () => setGame( null ) }
			/>
			{ ! game ? (
				<Selector
					stats={ stats }
					onSelect={ onSelect }
				/>
			) : (
				<GameComponent
					article={ article }
					game={ game }
					guesses={ progress[ game.date ]?.guesses || [] }
					onSetGuesses={ onSetGuesses }
					onSolve={ onSolve }
				/>
			) }
		</div>
	)
}

export default App;
