import logo from './logo.png';
import './App.css';
import React, { useState, useEffect } from 'react';

export default function WordFinderApp() {
	
  // The state
  const [pageToDisplay, setPageToDisplay] = useState("landing");
  const [rows, setRows] = useState(15);
  const [columns, setColumns] = useState(15);
  const [words, setWords] = useState("");

  const handleButtonClick = (viewName) => {
    setPageToDisplay(viewName);
  };

  return (
    <div className="App-header">
	
      {pageToDisplay === "landing" && (
        <LandingPage onButtonClick={handleButtonClick} />
      )}
      {pageToDisplay === "configuration" && (
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
      {pageToDisplay === "wordFinder" && (
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
      <StartButton onClick={() => onButtonClick("configuration")} />
    </header>
  );
}


// The configuration page.
function ConfigurationPage({ onButtonClick, rows, setRows, columns, setColumns, words, setWords }) {
  return (
   <div className="configuration-container">
      <h1>Configuration</h1>
      
      <div className="form-group">
        <label htmlFor="words-input">Words</label>
        <textarea
          id="words-input"
          placeholder="Enter words here. Each word on a new line"
          rows="10"
          cols="40"
          value={words}
          onChange={(e) => setWords(e.target.value)}
          className="input-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="rows-input">Number of Rows</label>
        <input
          id="rows-input"
          type="number"
          min="5"
          max="20"
          step="1"
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          className="input-number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="columns-input">Number of Columns</label>
        <input
          id="columns-input"
          type="number"
          min="5"
          max="20"
          step="1"
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          className="input-number"
        />
      </div>

      <div className="button-group">
        <GenerateButton onClick={() => onButtonClick("wordFinder")} />
      </div>
    </div>
  );
}


// The word finder page. Displays the grid and words to find.
function WordFinderPage({ onButtonClick, rows, columns, words }) {
	
  // Word finder state.  
  const [gridData, setGridData] = useState([]);
  const [placedWords, setPlacedWords] = useState({});
  const [selectedCells, setSelectedCells] = useState({});
  const [correctSelectionAttempts, setCorrectSelectionAttempts] = useState(0);
  const [incorrectSelectionAttempts, setIncorrectSelectionAttempts] = useState(0);

  // Handle the clicking of a table cell.  
  const handleClick = (rowIndex, cellIndex, isPartOfWord) => {
    const cellKey = `${rowIndex}.${cellIndex}`;
    setSelectedCells((prev) => ({
      ...prev,
      [cellKey]: !prev[cellKey],
    }));

    if (isPartOfWord) {
      setCorrectSelectionAttempts((prevCount) => prevCount + 1);
    } else {
      setIncorrectSelectionAttempts((prevCount) => prevCount + 1);
    }
  };

  useEffect(() => {
    const wordsArray = words.split("\n").map((word) => word.trim()).filter((word) => word !== "");

    // Create the REST service JSON request.
    const requestData = {
      rows: parseInt(rows),
      columns: parseInt(columns),
      words: wordsArray,
    };


    const postData = async (url = "", data = {}) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    };

    // POST the data.
    postData("http://localhost:8080/wordfinder", requestData).then((data) => {
      const gridArray = JSON.parse(data.theGrid);
      setGridData(gridArray);
      setPlacedWords(data.placedWords);
    });
  }, [rows, columns, words]);

  return (
    <div className="configuration-container">
      <h1>Find Words</h1>
      <PlacedWords words={placedWords} />
      <SelectionAttempts correctSelectionAttempts={correctSelectionAttempts} incorrectSelectionAttempts={incorrectSelectionAttempts} />
      <div className="grid-container">
      <Grid grid={gridData} 
              placedWords={placedWords} 
              handleClick={handleClick} 
              selectedCells={selectedCells} />
      </div>
	  
      <BackButton onClick={() => onButtonClick("configuration")} />
    </div>
  );
}


// The word finder grid.  Each cell is a button which can be toggled on and off.
function Grid({ grid, placedWords, handleClick, selectedCells}) {
  return (
		<table>
		  <tbody>
			{grid.map((row, rowIndex) => (
			  <tr key={rowIndex}>
				{row.map((cell, cellIndex) => {
				  const cellKey = `${rowIndex}.${cellIndex}`;
				  const isSelected = selectedCells[cellKey];

          // Get a list of all the word cells and then determine if the current cell is part of a word
          const allPlacedWordCells = Object.values(placedWords)
            .flat()
            .map(cell => `${cell.row}.${cell.column}`);

          const isPartOfWord = allPlacedWordCells.includes(cellKey);

				  return (
					<td key={cellIndex}>
					  <button
            className={`cell-button ${isSelected ? (isPartOfWord ? "part-of-word-selected" : "not-part-of-word-selected") : ""}`}
						onClick={() => handleClick(rowIndex, cellIndex, isPartOfWord)}
					  >
						{cell}
					  </button>
					</td>
				  );
				})}
			  </tr>
			))}
		  </tbody>
		</table>
  );
}

// A start button.  Used for nagivation from the landing screen to the configuration screen.
function StartButton({ onClick }) {
  return (
    <button className="button startButton" onClick={onClick}>Start</button>
  );
}


// A button to generate the word finder grid
function GenerateButton({ onClick }) {
  return (
    <button className="button generateButton" onClick={onClick}>Generate Word Finder Grid</button>
  );
}


// A button to go back to the configuration screen
function BackButton({ onClick }) {
  return (
    <button className="button generateButton" onClick={onClick}>Back to Configuration</button>
  );
}


// Word input component
function WordInput({ value, onChange }) {
  return (
    <div>
      Words
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
    <div>
      <p>Number of Rows</p>
      <input
        type="number"
        min="5"
        max="20"
        step="1"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}


// Number of columns input component
function ColumnsInput({ value, onChange }) {
  return (
    <div>
      <p>Number of Columns</p>
      <input
        type="number"
        min="5"
        max="20"
        step="1"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}


// Placed words component.  Displays the words placed in the grid as 
// a comma delimited list.
function PlacedWords({ words }) {
  const wordList = Object.keys(words);

  return (
    <div className="word-list">
      <h3>Words to Find:</h3>
      <p>{wordList.join(", ")}</p>
    </div>
  );
}


function SelectionAttempts({ correctSelectionAttempts,incorrectSelectionAttempts }) {
  return (
    <div className="selectionAttempts">
      <h3>Correct:</h3>
      <p>{correctSelectionAttempts}</p>

      <h3>Incorrect:</h3>
      <p>{incorrectSelectionAttempts}</p>
    </div>
  );
}