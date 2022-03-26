import React, { useState, useEffect } from "react";
import Head from "next/head";

/** Makes a POST request to the API with a guess what the name is. */
function guessApi(player, guess) {
  return fetch(
    "/api/guess",
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player: player,
        guess: guess,
      })
    }
  );
}

const labelStyle = `pt-10 text-3xl font-bold`;

const inputStyle = `
  my-3 py-2 px-4
  border-2 border-gray-300
  text-2xl text-center rounded
  form-control transition ease-in-out w-full
`;

const buttonStyle = `
  py-4 px-4
  text-2xl
  bg-teddy-dark hover:bg-teddy
  rounded w-full
`;

export default function Index() {
  const [ready, setReady] = useState(false);
  const [player, setPlayer] = useState("");
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, []);

  // A hacky way to re-use the input and submit button UI instead
  // of creating re-usable components and pass down props and such.
  const label = ready ? "Systir Nóa heitir:" : "Hvað heitir þú?";
  const placeholder = ready ? "nafn (án eftirnafns)" : "Dæmi: Jón Jónsson";
  const buttonLabel = ready ? "Giska" : "Áfram!";
  const inputValue = ready ? guess : player;

  const onInput = (event) => {
    ready ? setGuess(event.target.value) : setPlayer(event.target.value);
  };

  const onSubmit = () => {
    if (ready) {
      guessApi(player, guess).then(response => console.log(response));

      setGuesses(prevState => [guess, ...prevState]);
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

      {/* Background image */}
      <div className="bgTeddy" />

      <main className="text-center mx-5 my-0">
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
        <p className="mt-5">Þú heitir: {player}</p>
        <p>Þín gisk: {guesses.join(", ")}</p>
      </main>
    </>
  )
}

