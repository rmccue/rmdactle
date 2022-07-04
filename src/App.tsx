import { useEffect, useState } from 'react';

import Game from './Game';
import Header from './Header';
import { Article } from './types';
import { fetchArticle } from './wiki';

import './App.css';

function App() {
	const [ article, setArticle ] = useState<Article | null>( null );

	useEffect( () => {
		fetchArticle( 'Analytical_chemistry' ).then( setArticle );
	}, [] );

	return (
		<div className="App">
			<Header />
			<Game
				article={ article }
			/>
		</div>
	)
}

export default App;
