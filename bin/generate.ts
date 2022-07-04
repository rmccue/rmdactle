import fs from 'fs';
import fetch from 'node-fetch';
import parser from 'node-html-parser';
import { DateTime } from 'luxon';
import seedrandom from 'seedrandom';

import { GameMap } from '../src/types';

const RAND_SEED = 'rmdactle:1';
const START_DATE = '2022-07-01';
const VITAL_CATS = [
	'People',
	'History',
	'Geography',
	'Arts',
	'Philosophy_and_religion',
	'Everyday_life',
	'Society_and_social_sciences',
	'Biology_and_health_sciences',
	'Physical_sciences',
	'Technology',
	'Mathematics',
];

function shuffle<T>( array: T[], rng: () => number ) {
	let m = array.length;
	let t: T;
	let i: number;

	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor( rng() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}

type ParsedData = {
	parse: {
		pageid: number,
		text: string,
		title: string,
	},
};

async function getArticlesForCategory( category: string ) {
	var arts = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=Wikipedia:Vital%20articles&prop=text&formatversion=2&origin=*";

	const base = 'https://en.wikipedia.org/w/api.php?';
	const params = new URLSearchParams( {
		action: 'parse',
		format: 'json',
		formatversion: '2',
		origin: '*',
		page: `Wikipedia:Vital_articles/Level/4/${ category }`,
		prop: 'text',
	} );
	const url = base + params.toString();

	const res = await fetch( url );
	const data = await res.json() as ParsedData;

	const root = parser( data.parse.text );
	const links = root.querySelectorAll( 'a' );

	const articles: string[] = [];
	links.forEach( link => {
		const href = link.attributes.href;
		if ( ! href ) {
			return;
		}

		const title = href.match( /^\/wiki\/([^:]+)$/i );
		if ( ! title ) {
			return;
		}

		articles.push( title[1] );
	} );
	return articles;
}

type Article = {
	category: string,
	title: string,
};

async function generateList() {
	let opts: Article[] = [];
	let total = 0;
	for ( let i = 0; i < VITAL_CATS.length; i++ ) {
		const category = VITAL_CATS[ i ];
		const articles = await getArticlesForCategory( category );
		console.log( `${ category }: ${ articles.length }` );
		total += articles.length;
		opts = [
			...opts,
			...articles.map( title => ( {
				category,
				title,
			} ) ),
		];
	}
	console.log( `Total: ${ total }` );

	return opts;
}

async function generateData() {
	const articles = await generateList();
	const shuffled = shuffle( articles, seedrandom( RAND_SEED ) );

	const start = DateTime.fromISO( START_DATE );
	const indexed: GameMap = shuffled.reduce( ( indexed, article, idx ) => {
		const date = start.plus( { days: idx } ).toISODate();

		return {
			...indexed,
			[ date ]: {
				number: idx + 1,
				date,
				title: Buffer.from( article.title ).toString( 'base64' ),
				category: article.category,
			},
		}
	}, {} );

	console.log( 'Writing data…' );
	const data = JSON.stringify( indexed, null, '\t' );
	fs.writeFileSync( __dirname + '/../src/data.json', data );
	console.log( 'Game created!' );
}

if ( require.main === module ) {
	generateData();
}
