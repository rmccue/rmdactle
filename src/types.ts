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
	stats: WordStats,
}

export type GameStats = {
	solved: boolean,
	guesses: number,
	accuracy: number,
}

export type Stats = {
	[ id: string ]: GameStats,
}

export type WordStats = {
	[ word: string ]: number,
}

export type Guesses = {
	[ word: string ]: true,
};

export interface Game {
	number: number,
	date: string,
	title: string,
	category: string,
};

export type GameMap = {
	[ date: string ]: Game,
};
