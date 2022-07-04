
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';

import { Game, Stats } from './types';
import { getCurrentGame, getGame, getUnlockedGames } from './util';

import './Selector.css';

interface Props {
	stats: Stats,
	onSelect( game: Game ): void,
}

const _n = ( single: string, plural: string, num: number ) => num === 1 ? single : plural;

type GameProps = {
	game: Game,
	isToday?: boolean,
	stats: Stats,
	onSelect(): void,
}
const SelectableGame = ( props: GameProps ) => (
	<button
		key={ props.game.number }
		className={ [
			'Selector__game',
			props.isToday && 'Selector__game--today',
			props.stats[ props.game.date ]?.guesses > 0 && 'Selector__game--started',
			props.stats[ props.game.date ]?.solved && 'Selector__game--solved',
		].filter( Boolean ).join( ' ' ) }
		type="button"
		onClick={ props.onSelect }
	>
		<span className="Selector__game-number">#{ props.game.number }</span>
		<span className="Selector__game-date">
			{ props.isToday ? 'Play Today' : props.game.date }
		</span>
		{ props.stats[ props.game.date ] ? (
			<span className="Selector__game-progress">
				{ _n( '1 guess', `${ props.stats[ props.game.date ].guesses } guesses`, props.stats[ props.game.date ].guesses ) }
			</span>
		) : null }
	</button>
);

export default function Selector( props: Props ) {
	const current = getCurrentGame();
	const unlocked = getUnlockedGames();
	const sorted = reverse( sortBy( unlocked, game => game.number ) );
	const today = sorted[0];
	const historical = sorted.slice( 1 );

	return (
		<div className="Selector">
			<SelectableGame
				game={ today }
				isToday
				stats={ props.stats }
				onSelect={ () => props.onSelect( today ) }
			/>

			<div className="Selector__list">
				{ historical.map( game => (
					<SelectableGame
						key={ game.number }
						game={ game }
						stats={ props.stats }
						onSelect={ () => props.onSelect( game ) }
					/>
				) ) }
			</div>
		</div>
	);
}
