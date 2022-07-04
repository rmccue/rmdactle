import random from 'random/dist/cjs/index';
import React, { useEffect } from 'react';
import seedrandom from 'seedrandom';

import { Article, Block, Guesses, Text } from './types';
import { indexedStops, indexWords } from './util';

import './Content.css';

type BlockProps = {
	guesses: Guesses,
	rng: () => number,
	selected: string | null,
	selectedIndex: number,
	solved: boolean,
	block: Block,
};

function BlockComponent( props: BlockProps ) {
	const children = props.block.children.map( ( part, i ) => {
		if ( part.type === 'block' ) {
			return (
				<BlockComponent
					key={ i }
					block={ part }
					guesses={ props.guesses }
					rng={ props.rng }
					selected={ props.selected }
					selectedIndex={ props.selectedIndex }
					solved={ props.solved }
				/>
			);
		}

		if ( part.element === 'whitespace' ) {
			return part.text;
		}

		const num = props.rng();
		if ( part.element === 'punctuation' ) {
			return (
				<span
					key={ i }
					className="Content__punct"
				>
					{ part.text }
				</span>
			)
		}
		if ( indexedStops[ part.normalized ] || props.solved ) {
			return (
				<span
					key={ i }
					className="Content__revealed"
				>
					{ part.text }
				</span>
			)
		}
		if ( props.guesses[ part.normalized ] ) {
			return (
				<span
					key={ i }
					className={ [
						'Content__revealed',
						part.normalized === props.selected && 'Content__selected',
						( part.normalized === props.selected && part.occurance === props.selectedIndex ) && 'Content__highlighted'
					].filter( Boolean ).join( ' ' ) }
					id={ `Content__word-${ part.normalized }-${ part.occurance }` }
				>
					{ part.text }
				</span>
			);
		}

		return (
			<span
				key={ i }
				className="Content__redacted"
			>
				{ '\u2588'.repeat( num ) }
			</span>
		);
	} );

	return React.createElement(
		props.block.element.toLowerCase(),
		{},
		children,
	);
}

interface Props {
	article: Article,
	guesses: string[],
	selected: string | null,
	selectedIndex: number,
	solved: boolean,
}

export default function Content( props: Props ) {
	const rng = random.clone( seedrandom( props.article.title ) ).poisson( 6.94 );
	const indexedGuesses = indexWords( props.guesses );

	useEffect( () => {
		const id = `Content__word-${ props.selected }-${ props.selectedIndex }`;
		const el = document.getElementById( id );
		el?.scrollIntoView( {
			behavior: 'smooth',
			block: 'center',
			inline: 'end',
		} );

	}, [ props.selected, props.selectedIndex ] );

	return (
		<article
			className="Content"
			id="Content"
		>
			{ props.solved ? (
				<h1>
					<a
						href={ props.article.url }
						target="_blank"
					>
						{ props.article.title }
					</a>
				</h1>
			) : (
				<BlockComponent
					block={ {
						element: 'H1',
						children: props.article.titleParts,
						type: 'block'
					} }
					guesses={ indexedGuesses }
					rng={ rng }
					selected={ props.selected }
					selectedIndex={ props.selectedIndex }
					solved={ props.solved }
				/>
			) }
			{ props.article.contentParts.map( ( item, i ) => (
				item.type === 'block' ? (
					<BlockComponent
						key={ i }
						block={ item }
						guesses={ indexedGuesses }
						rng={ rng }
						selected={ props.selected }
						selectedIndex={ props.selectedIndex }
						solved={ props.solved }
					/>
				) : (
					<span key={ i } />
				)
			) ) }
		</article>
	)
}
