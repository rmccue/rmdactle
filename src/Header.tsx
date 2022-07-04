import { Game } from './types';

import './Header.css';

interface Props {
	game: Game | null,
	onChangeGame(): void,
}

export default function Header( props: Props ) {
	return (
		<header className="Header">
			<p>
				Rmdactle
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
