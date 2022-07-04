import React, { useState } from "react";

interface Props {
	solved: boolean,
	onSubmit( guess: string, clear: () => void ): void,
}

export default function Footer( props: Props ) {
	const [ nextGuess, setNextGuess ] = useState<string>( '' );

	const onSubmit = ( e: React.FormEvent<HTMLFormElement> ) => {
		e.preventDefault();

		props.onSubmit( nextGuess, () => setNextGuess( '' ) );
	};

	return (
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
				disabled={ props.solved }
				type="text"
				value={ nextGuess }
				onChange={ e => setNextGuess( e.target.value ) }
				onFocus={ () => {
					window.scrollTo( 0, 0 );
					document.body.scrollTop = 0;
				} }
			/>
			<button type="submit">Guess</button>
		</form>
	);
}