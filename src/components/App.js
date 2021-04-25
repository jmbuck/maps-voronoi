import '../css/App.css';
import Header from './Header';
import Footer from './Footer'
import Main from './Main';

import React from 'react'

function App() {

  return (
    <>
    <Header />
    <div className="App">
        <Main />
    </div>
    <Footer />
    </>
  );
}

export default App;
