import deburr from 'lodash/deburr';

import { Article, Block, Children, Text, WordStats } from './types';
import { tokenize } from './util';

const stripElements = [
	'style',
	'[rel="mw-deduplicated-inline-style"]',
	'[title="Name at birth"]',
	'[aria-labelledby="micro-periodic-table-title"]',
	'.barbox',
	'.wikitable',
	'.clade',
	'.Expand_section',
	'.nowrap',
	'.IPA',
	'.thumb',
	'.mw-empty-elt',
	'.mw-editsection',
	'.nounderlines',
	'.nomobile',
	'.searchaux',
	'#toc',
	'.sidebar',
	'.sistersitebox',
	'.noexcerpt',
	'#External_links',
	'#Further_reading',
	'.hatnote',
	'.haudio',
	'.portalbox',
	'.mw-references-wrap',
	'.infobox',
	'.unsolved',
	'.navbox',
	'.metadata',
	'.refbegin',
	'.reflist',
	'.mw-stack',
	'#Notes',
	'#References',
	'.reference',
	'.quotebox',
	'.collapsible',
	'.uncollapsed',
	'.mw-collapsible',
	'.mw-made-collapsible',
	'.mbox-small',
	'.mbox',
	'#coordinates',
	'.succession-box',
	'.noprint',
	'.mwe-math-element',
	'.cs1-ws-icon',
].join( ', ');

function parseContent( text: string, stats: WordStats ) {
	// Strip some elements.
	let cleaned = text.replace( /<style.*<\/style>/g, '' );
	// en dash
	cleaned = text.replace( '\u2013', '-' );
	// em dash
	cleaned = text.replace( '\u2014', '-' );

	// Use DOM to parse the rest.
	const container = document.createElement( 'div' );
	container.innerHTML = cleaned;

	// Strip bad elements.
	const remove = container.querySelectorAll( stripElements );
	remove.forEach( el => {
		el.remove();
	} );

	// Recursively enumerate into text.
	return parseNode( container, stats );
}

function parseText( content: string, stats: WordStats ) : Text[] {
	const tokenized = tokenize( content );
	return tokenized.map<Text>( token => {
		switch ( token.type ) {
			case 'punctuation':
				return {
					type: 'text',
					element: 'punctuation',
					text: token.token,
					normalized: token.token,
				};

			case 'whitespace':
				return {
					type: 'text',
					element: 'whitespace',
					text: token.token,
					normalized: token.token,
				};

			case 'number':
			case 'word': {
				const normalized = deburr( token.token ).toLowerCase();
				if ( stats[ normalized ] ) {
					stats[ normalized ]++;
				} else {
					stats[ normalized ] = 1;
				}

				return {
					type: 'text',
					element: 'text',
					text: token.token,
					normalized,
					occurance: stats[ normalized ],
				};
			}

			default:
				console.log( token );
				return {
					type: 'text',
					element: 'text',
					text: token.token,
					normalized: token.token,
				};
		}
	} );
}

function parseNode( node: Node, stats: WordStats ): ( Text | Block )[] {
	if ( node.nodeType === Node.TEXT_NODE ) {
		return parseText( node.nodeValue || '', stats );
	}

	// Ignore other node types.
	if ( node.nodeType !== Node.ELEMENT_NODE ) {
		return [];
	}

	const children = Array.from( node.childNodes ).reduce( ( parts: Children, node ) => [ ...parts, ...parseNode( node, stats ) ], [] );
	switch ( ( node as Element ).tagName ) {
		case 'DIV':
		case 'SPAN':
		case 'I':
		case 'B':
		case 'A':
		case 'SMALL':
			// Strip.
			return children;

		case 'P':
		case 'H1':
		case 'H2':
		case 'H3':
		case 'H4':
		case 'H5':
		case 'H6':
		case 'OL':
		case 'UL':
		case 'LI':
			return [
				{
					type: 'block',
					element: ( node as Element ).tagName as Block['element'],
					children,
				}
			];

		default:
			console.log( ( node as Element ).tagName );
			return [];
	}
}

type ParsedData = {
	parse: {
		pageid: number,
		text: string,
		title: string,
	},
};

export async function fetchArticle( title: string ) : Promise<Article> {
	const base = 'https://en.wikipedia.org/w/api.php?';
	const params = new URLSearchParams( {
		action: 'parse',
		format: 'json',
		formatversion: '2',
		origin: '*',
		page: title,
		prop: 'text',
	} );
	const url = base + params.toString();

	const res = await fetch( url );
	const data: ParsedData = await res.json();

	const stats: WordStats = {};
	const titleParts = parseText( data.parse.title, stats );
	const contentParts = parseContent( data.parse.text, stats );

	return {
		title: data.parse.title,
		titleParts,
		url: '',
		content: '',
		contentParts,
		stats,
	};
}
