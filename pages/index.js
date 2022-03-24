import React, { useState } from "react";
import Head from "next/head";

const labelStyle = `text-3xl font-bold`;

const inputStyle = `
  my-3 py-2 px-4
  border-2 border-gray-300
  text-2xl text-center rounded
  form-control transition ease-in-out w-full
`;

const buttonStyle = `
  py-4 px-4
  text-2xl
  bg-gray-300
  rounded w-full
`;

export default function Index() {
  const [ready, setReady] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);

  const label = ready ? "Systir Nóa heitir:" : "Hvað heitir þú?";
  const placeholder = ready ? "nafn" : "Dæmi: Jón Jónsson";
  const buttonLabel = ready ? "Giska️" : "Áfram!";
  const inputValue = ready ? guess : playerName;

  const onInput = (event) => {
    ready ? setGuess(event.target.value) : setPlayerName(event.target.value);
  };

  const onSubmit = () => {
    if (ready) {
      setGuesses(prevState => [...prevState, guess]);
      setGuess("");
    } else {
      setReady(true);
    }
  };

  return (
    <>
      <Head>
        <title>Nafnaveisla 🎉</title>
      </Head>

      <main className="text-center mx-5 my-10">
        <p className={labelStyle}>{label}</p>

        <input
          type="text"
          value={inputValue}
          autoFocus={true}
          placeholder={placeholder}
          className={inputStyle}
          onChange={onInput}
        />

        <div>
          <button
            type="button"
            className={buttonStyle}
            onClick={onSubmit}
          >
            {buttonLabel}
          </button>
        </div>

        {/* Debug: */}
        <p className="mt-5">Ready: {ready.toString()}</p>
        <p>Player name: {playerName}</p>
        <p>Guesses: {guesses.join(", ")}</p>
      </main>
    </>
  )
}