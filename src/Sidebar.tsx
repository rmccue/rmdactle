import reverse from 'lodash/reverse';
import { useEffect } from 'react';

import { Article } from './types';

interface Props {
	article: Article | null,
	guesses: string[],
	selected: string | null,
	onSelectGuess( guess: string ): void,
}

export default function Sidebar( props: Props ) {
	useEffect( () => {
		const id = `Sidebar__guess-${ props.selected }`;
		const el = document.getElementById( id );
		el?.scrollIntoView( {
			behavior: 'smooth',
			block: 'center',
			inline: 'end',
		} );
	}, [ props.selected ] );
	return (
		<div className="Sidebar">
			<table className="Sidebar__guesses">
				<thead>
					<tr>
						<th>#</th>
						<th>Guess</th>
						<th>Hits</th>
					</tr>
				</thead>
				<tbody>
					{ props.article && (
						reverse( [ ...props.guesses ] ).map( ( guess, i ) => (
							<tr
								key={ guess }
								className={ guess === props.selected ? 'Sidebar__guess-selected' : '' }
								id={ `Sidebar__guess-${ guess }` }
								onClick={ () => props.onSelectGuess( guess ) }
							>
								<td>{ props.guesses.length - i }</td>
								<td>{ guess }</td>
								<td>
									{ props.article!.stats[ guess ] || 0 }
								</td>
							</tr>
						) )
					) }
				</tbody>
			</table>
		</div>
	);
}