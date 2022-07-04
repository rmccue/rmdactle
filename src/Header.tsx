import { useState } from 'react';

import { Game } from './types';

import './Header.css';

interface Props {
	game: Game | null,
	onChangeGame(): void,
}

export default function Header( props: Props ) {
	const [ reveal, setReveal ] = useState<boolean>( false );
	return (
		<header className="Header">
			<p onClick={ () => setReveal( ! reveal ) }>
				{ reveal ? (
					'Rmdactle'
				) : (
					'R\u2588dactle'
				) }
			</p>
			{ props.game && (
				<p>
					<button
						className="Header__selector"
						type="button"
						onClick={ props.onChangeGame }
					>
						#{ props.game.number } ({ props.game.date })
					</button>
				</p>
			) }
		</header>
	);
}
