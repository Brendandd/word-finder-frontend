import logo from './logo.png';
import './App.css';
import React, { useState, useEffect } from 'react';

export default function WordFinderApp() {
  const [currentView, setCurrentView] = useState('landing');
  const [rows, setRows] = useState(15);
  const [columns, setColumns] = useState(15);
  const [words, setWords] = useState('');

  const handleButtonClick = (viewName) => {
    setCurrentView(viewName);
  };

  return (
    <div className="App-header">
      {currentView === 'landing' && (
        <LandingPage onButtonClick={handleButtonClick} />
      )}
      {currentView === 'configuration' && (
        <ConfigurationPage
          onButtonClick={handleButtonClick}
          rows={rows}
          setRows={setRows}
          columns={columns}
          setColumns={setColumns}
          words={words}
          setWords={setWords}
        />
      )}
      {currentView === 'generate' && (
        <WordFinderPage
          onButtonClick={handleButtonClick}
          rows={rows}
          columns={columns}
          words={words}
        />
      )}
    </div>
  );
}

// The landing page
function LandingPage({ onButtonClick }) {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Word Finder</h1>
      <StartButton onClick={() => onButtonClick('configuration')} />
    </header>
  );
}

// The configuration page
function ConfigurationPage({ onButtonClick, rows, setRows, columns, setColumns, words, setWords }) {
  return (
    <div className="configuration-container">
      <WordInput value={words} onChange={(e) => setWords(e.target.value)} />
      <RowsInput value={rows} onChange={(e) => setRows(e.target.value)} />
      <ColumnsInput value={columns} onChange={(e) => setColumns(e.target.value)} />
      <GenerateButton onClick={() => onButtonClick('generate')} />
    </div>
  );
}

// The word finder page. Displays the grid and words to find.
function WordFinderPage({ onButtonClick, rows, columns, words }) {
  const [gridData, setGridData] = useState([]);
  const [placedWords, setPlacedWords] = useState({});

  useEffect(() => {
    const wordsArray = words.split('\n').map((word) => word.trim()).filter((word) => word !== '');

    const requestData = {
      rows: parseInt(rows, 10),
      columns: parseInt(columns, 10),
      words: wordsArray,
    };

    const postData = async (url = '', data = {}) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    };

    postData('http://localhost:8080/wordfinder', requestData).then((data) => {
      const gridArray = JSON.parse(data.theGrid);
      setGridData(gridArray);
      setPlacedWords(data.placedWords);
    });
  }, [rows, columns, words]);

  return (
    <div className="configuration-container">
      <PlacedWords words={placedWords} />
      <div className="grid-container">
        <Grid grid={gridData} />
      </div>
      <BackButton onClick={() => onButtonClick('configuration')} />
    </div>
  );
}

// The grid component
function Grid({ grid }) {
  return (
    <table>
      <tbody>
        {grid.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// A start button
function StartButton({ onClick }) {
  return (
    <button className="button startButton" onClick={onClick}>
      Start
    </button>
  );
}

// A button to generate the word finder grid
function GenerateButton({ onClick }) {
  return (
    <button className="button generateButton" onClick={onClick}>
      Generate Word Finder Grid
    </button>
  );
}

// A button to go back to the configuration screen
function BackButton({ onClick }) {
  return (
    <button className="button generateButton" onClick={onClick}>
      Back to Configuration
    </button>
  );
}

// Word input component
function WordInput({ value, onChange }) {
  return (
    <div>
      <h2>Words</h2>
      <textarea
        placeholder="Enter words here. Each word on a new line"
        rows="20"
        cols="50"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// Rows input component
function RowsInput({ value, onChange }) {
  return (
    <div className="App">
      <h2>Number of Rows</h2>
      <input
        type="number"
        min="5"
        max="30"
        step="1"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// Columns input component
function ColumnsInput({ value, onChange }) {
  return (
    <div className="App">
      <h2>Number of Columns</h2>
      <input
        type="number"
        min="5"
        max="30"
        step="1"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// Placed words component
function PlacedWords({ words }) {
  const wordList = Object.keys(words);

  return (
    <div className="word-list">
      <h3>Words to Find:</h3>
      <p>{wordList.join(', ')}</p>
    </div>
  );
}
