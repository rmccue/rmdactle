export interface Text {
	type: 'text',
	element: 'punctuation' | 'text' | 'whitespace',
	text: string,
	normalized: string,
	occurance?: number,
}

export interface Block {
	type: 'block',
	element: 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'P' | 'UL' | 'OL' | 'LI',
	children: Children,
}

export type Children = ( Text | Block )[];

export interface Article {
	title: string,
	titleParts: Text[],
	url: string,
	content: string,
	contentParts: Children,
	stats: Stats,
}

export type Stats = {
	[ word: string ]: number,
}

export type Guesses = {
	[ word: string ]: true,
};
