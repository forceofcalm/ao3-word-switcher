import { useState, type FC } from 'react';
// @ts-ignore
// import prettier from 'https://unpkg.com/prettier@2.8.1/esm/standalone.mjs';
// // @ts-ignore
// import parserCSS from 'https://unpkg.com/prettier@2.8.1/esm/parser-postcss.mjs';
import prettier from 'prettier/standalone';
import parserCSS from 'prettier/parser-postcss';
import './App.css';

type WordSwitch = {
  original: string;
  switchedTo: string;
}

const App: FC = () => {
  const [rawText, setRawText] = useState<string>('');
  const [formattedText, setFormattedText] = useState<string>('');
  const [switchedWords, setSwitchedWords] = useState<Array<WordSwitch>>([{original: '', switchedTo: ''}]);
  const [generatedCSS, setGeneratedCSS] = useState<string>('');

  const addNewSwitchedWord = () => {
    let newSwitchedWords: Array<WordSwitch> = [...switchedWords];
    newSwitchedWords.push({original: '', switchedTo: ''});

    setSwitchedWords(newSwitchedWords);
  };

  const removeSwitchedWord = (index: number) => {
    let newSwitchedWords: Array<WordSwitch> = [...switchedWords];
    newSwitchedWords.splice(index, 1);

    setSwitchedWords(newSwitchedWords);
  };

  const createFormattedText = () => {
    let rawTextCopy: string = rawText;
    
    switchedWords.forEach((wordSwitch: WordSwitch, index: number) => {
      if (wordSwitch.original && wordSwitch.switchedTo) {
        const regex = new RegExp(String.raw`\b${wordSwitch.original}\b`, "gm");
        rawTextCopy = rawTextCopy.replace(regex, `<span class="${wordSwitch.original.toLowerCase()}">${wordSwitch.original}</span>`);
      }
    });

    setFormattedText(rawTextCopy);
  };

  const createGeneratedCSS = () => {
    let cssString: string = '';

    switchedWords.forEach((wordSwitch: WordSwitch, index: number) => {
      if (wordSwitch.original && wordSwitch.switchedTo) {
        cssString += `span.${wordSwitch.original.toLowerCase()} {
            visibility: hidden;
            font-size: 1px;
            letter-spacing: -1px;
            speak: never;
        }
        span.${wordSwitch.original.toLowerCase()}:before {
            content: '${wordSwitch.switchedTo}';
            visibility: visible;
            font-size: 1rem;
            letter-spacing: normal;
            speak: always;
        }`;
      }
    });

    const formattedCSS = prettier.format(cssString, {
      parser: 'css',
      plugins: [parserCSS],
    });

    setGeneratedCSS(formattedCSS);
  }

  const copyTextToClipboard = (text: string) => {
    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    if (!navigator.clipboard) {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
    
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
    
      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        alert('Fallback: Copying text command was ' + msg);
      } catch (err) {
        alert('Fallback: Unable to copy text. Please try another browser, or copy the text with keyboard shortcuts.');
      }
    
      document.body.removeChild(textArea);
    }

    navigator.clipboard.writeText(text).then(() => {
      alert('Copying to clipboard was successful!');
    }, function(err) {
      alert('Could not copy text: ' + err);
    });
  };

  return (
    <main>
      <h1>AO3 Skin: Word Switcher</h1>

      <div className="word-switcher-inputs">
        {
          switchedWords.map((wordSwitch: WordSwitch, index: number) => {
            return (
              <div className="word-switcher-input" key={index}>
                <input
                  type="text" 
                  placeholder="Original Word" 
                  value={wordSwitch.original}
                  onChange={(e) => {
                    let newSwitchedWords: Array<WordSwitch> = [...switchedWords];
                    newSwitchedWords[index].original = e.target.value;

                    setSwitchedWords(newSwitchedWords);
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Switched Word" 
                  value={wordSwitch.switchedTo}
                  onChange={(e) => {
                    let newSwitchedWords: Array<WordSwitch> = [...switchedWords];
                    newSwitchedWords[index].switchedTo = e.target.value;

                    setSwitchedWords(newSwitchedWords);
                  }}
                />
                <button onClick={() => removeSwitchedWord(index)}>Remove</button>
              </div>
            );
          })
        }
      </div>

      <button onClick={addNewSwitchedWord}>Add another word</button>

      <div className="textarea-container">
        <textarea 
          className="raw" 
          placeholder="Paste your AO3 work text here."
          onChange={(e) => setRawText(e.target.value)}
        />
        <textarea
          className="formatted"
          placeholder="This will be the formatted AO3 work text."
          value={formattedText}
          readOnly
        />
        <textarea
          className="css"
          placeholder="This will be the generated CSS for the work skin."
          value={generatedCSS}
          readOnly
        />
      </div>

        <div className="button-container">
          <button onClick={() => { createFormattedText(); createGeneratedCSS();}}>Generate Formatted Text</button>
          <button onClick={() => copyTextToClipboard(formattedText)}>Copy Formatted Text to Clipboard</button>
          <button onClick={() => copyTextToClipboard(generatedCSS)}>Copy Generated CSS to Clipboard</button>
        </div>
    </main>
  );
}

export default App;
