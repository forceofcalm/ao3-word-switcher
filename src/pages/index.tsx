import type { FC, ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { format } from 'prettier';
import HTMLPlugins from 'prettier/plugins/html';
import CSSPlugins from 'prettier/plugins/postcss';

interface WordSwitch {
  original: string;
  switchedTo: string;
}

// todo: generate on change
// text change, word being added/removed

const Main: FC = () => {
  const [rawText, setRawText] = useState<string>('');
  const [formattedText, setFormattedText] = useState<string>('');
  const [switchedWords, setSwitchedWords] = useState<WordSwitch[]>([
    {
      original: '',
      switchedTo: '',
    },
  ]);
  const [generatedCSS, setGeneratedCSS] = useState<string>('');

  const addNewSwitchedWord = () => {
    let newSwitchedWords: WordSwitch[] = [...switchedWords];
    newSwitchedWords.push({ original: '', switchedTo: '' });

    setSwitchedWords(newSwitchedWords);
  };

  const removeSwitchedWord = (index: number) => {
    let newSwitchedWords: WordSwitch[] = [...switchedWords];
    newSwitchedWords.splice(index, 1);

    if (newSwitchedWords.length === 0) {
      newSwitchedWords.push({ original: '', switchedTo: '' });
    }

    setSwitchedWords(newSwitchedWords);
  };

  const createFormattedText = async () => {
    // formatted text
    let rawTextCopy: string = rawText;

    switchedWords.forEach((wordSwitch: WordSwitch, index: number) => {
      if (wordSwitch.original && wordSwitch.switchedTo) {
        const regex = new RegExp(String.raw`\b${wordSwitch.original}\b`, 'gm');
        rawTextCopy = rawTextCopy.replace(
          regex,
          `<span class="${wordSwitch.original
            .toLowerCase()
            .split(' ')
            .join('-')}">${wordSwitch.original}</span>`
        );
      }
    });

    // split text and new lines and wrap in <p> tags
    let paragraphedText: string = rawTextCopy
      .split('\n')
      .filter((paragraph) => paragraph)
      .reduce((accumulator, paragraph) => {
        console.log('para', paragraph);
        return (accumulator += `<p>${paragraph}</p>`);
      }, '');

    let formattedHTML: string = await format(paragraphedText, {
      parser: 'html',
      plugins: [HTMLPlugins],
      htmlWhitespaceSensitivity: 'ignore',
    });

    console.log(formattedHTML);

    setFormattedText(formattedHTML);
  };

  const createGeneratedCSS = async () => {
    let cssString: string = '';

    switchedWords.forEach((wordSwitch: WordSwitch, index: number) => {
      if (wordSwitch.original && wordSwitch.switchedTo) {
        cssString += `span.${wordSwitch.original
          .toLowerCase()
          .split(' ')
          .join('-')} {
            visibility: hidden;
            font-size: 1px;
            letter-spacing: -1px;
            speak: never;
        }
        span.${wordSwitch.original.toLowerCase().split(' ').join('-')}:before {
            content: '${wordSwitch.switchedTo}';
            visibility: visible;
            font-size: 1rem;
            letter-spacing: normal;
            speak: always;
        }`;
      }
    });

    const formattedCSS = await format(cssString, {
      parser: 'css',
      plugins: [CSSPlugins],
    });

    setGeneratedCSS(formattedCSS);
  };

  const copyTextToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);

    alert('Copied to clipboard!');
  };

  useEffect(() => {
    createFormattedText();
    createGeneratedCSS();
  }, [rawText, switchedWords]);

  return (
    <main>
      <style>{generatedCSS}</style>

      <h1>AO3 Skin: Word Switcher</h1>

      <div className="word-switcher-inputs">
        {switchedWords.map((wordSwitch: WordSwitch, index: number) => {
          return (
            <div className="word-switcher-input">
              <input
                type="text"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  let newSwitchedWords: WordSwitch[] = [...switchedWords];
                  newSwitchedWords[index].original = event?.target?.value;

                  setSwitchedWords(newSwitchedWords);
                }}
                placeholder="Original Word"
                value={wordSwitch.original}
              />

              <input
                type="text"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  let newSwitchedWords: WordSwitch[] = [...switchedWords];
                  newSwitchedWords[index].switchedTo = event?.target?.value;

                  setSwitchedWords(newSwitchedWords);
                }}
                placeholder="Switched Word"
                value={wordSwitch.switchedTo}
              />

              <button
                onClick={() => removeSwitchedWord(index)}
                disabled={!(switchedWords.length > 1)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={addNewSwitchedWord}>Add New Switched Word</button>

      <div className="textarea-container">
        <textarea
          className="raw"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setRawText(event?.target?.value);
          }}
          placeholder="Paste your AO3 work text here"
        />

        {/* <textarea
          className="formatted"
          placeholder="Formatted HTML will appear here"
          value={formattedText}
        />

        <textarea
          className="css"
          placeholder="Generated CSS will appear here"
          value={generatedCSS}
        /> */}
      </div>

      {/* <button
        onClick={() => {
          createFormattedText();
          createGeneratedCSS();
        }}
      >
        Generate Formatted Text
      </button> */}
      <button onClick={() => copyTextToClipboard(formattedText)}>
        Copy Formatted Text to Clipboard
      </button>
      <button onClick={() => copyTextToClipboard(generatedCSS)}>
        Copy Generated Work Skin to Clipboard
      </button>

      <div className="preview">
        <div>
          <h2>Original</h2>

          <h3>(skin off)</h3>

          <div
            className="preview-original"
            dangerouslySetInnerHTML={{
              __html: rawText
                .split('\n')
                .filter((paragraph) => paragraph)
                .reduce((accumulator, paragraph) => {
                  console.log('para', paragraph);
                  return (accumulator += `<p>${paragraph}</p>`);
                }, ''),
            }}
          />
        </div>

        <div>
          <h2>Switched</h2>

          <h3>(skin on)</h3>

          <div
            className="preview-formatted"
            dangerouslySetInnerHTML={{
              __html: formattedText,
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default Main;
