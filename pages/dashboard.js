import React, { useState, useEffect } from "react";
import faunadb, { query as q } from "faunadb";
import Confetti from "react-confetti";

/** Makes a POST request to the API with a guess what the name is. */
function getCorrectName(secret) {
  return fetch(
    "/api/answer",
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secret,
      })
    }
  );
}

function Winner({ winner }) {
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

  // Winner has not been declared yet
  if (winner === "") return null;

  console.log("We have a winner!!!" + winner);

  return (
    <>
      <Confetti width={windowSize.width} height={windowSize.height} />
    </>
  );
}

/**
 * Before the dashboard loads a hidden input field is presented. To log in we
 * paste the Fauna secret key. Once pasted the Dashboard will be initialised
 * and connects to Fauna with that secret. A hacky little way to securely
 * connect to Fauna without revealing the secret.
 */
export default function Authentication() {
  const [faunaSecret, setFaunaSecret] = useState("");

  /** Checks if the secret is stored in localStorage */
  useEffect(() => {
    const localSecret = localStorage.getItem("secret");
    if (localSecret) setFaunaSecret(localSecret);
  }, []);

  /** Persist the secret to localStorage, enables manual refresh if needed */
  useEffect(() => {
    if (faunaSecret && faunaSecret !== "") {
      localStorage.setItem("secret", faunaSecret);
    }
  }, [faunaSecret]);

  if (faunaSecret !== "") return <Dashboard faunaSecret={faunaSecret} />;

  return (
    <input
      type="password"
      value={faunaSecret}
      onChange={event => setFaunaSecret(event.target.value)}
    />
  );
}

function Dashboard(props) {
  const { faunaSecret } = props;

  const [correctName, setCorrectName] = useState("");
  const [winner, setWinner] = useState("");

  const [resetAllData, setResetAllData] = useState(false);
  const toggleResetAllData = () => setResetAllData(prev => !prev);

  const [guesses, setGuesses] = useState([]);
  const addGuess = guess => setGuesses(prevGuesses => [guess, ...prevGuesses]);

  const onFaunaEvent = event => {
    // console.log("New stream event:")
    // console.log(event);

    // event is a number when the stream starts, after that it is an object
    const readyToProcessEvents = typeof(event) !== "number";
    const notRemoveEvent = event.action !== "remove";

    if (readyToProcessEvents && notRemoveEvent) {
      const [player, guess] = event.index.values;

      // console.log(`Player: ${player}`); // Debug
      // console.log(`Guess: ${guess}`); // Debug

      addGuess(guess);

      console.log("guess: "+ guess);
      console.log("correctName: "+ correctName);

      if (guess === correctName) {
        setWinner(player);
        console.log("correct name guessed");
      }
    }
  }

  /** Fetches and sets the correct name of the child */
  useEffect(() => {
    getCorrectName(faunaSecret).then(response => {
      response.json().then(resp => {
        setCorrectName(resp.answer);
        console.log(resp);
        console.log(resp.answer);
      });
    })
  }, []);

  /** Deletes all guesses in Fauna */
  useEffect(() => {
    if (resetAllData) {
      const faunaClient = new faunadb.Client({
        secret: faunaSecret,
        domain: "db.eu.fauna.com",
      });

      faunaClient.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection("guesses")),
            { size: 100000 }
          ),
          q.Lambda(
           ["ref"],
            q.Delete(q.Var("ref"))
          )
        )
      ).then(results => {
          console.log("All guesses in Fauna deleted");
          console.log(results);
          setGuesses([]);
        }).catch(error => {
          console.log("Error attempting to delete all guesses in Fauna");
          console.log(error);
      })
    }
  }, [resetAllData]);

  /** Fetch existing data and stream subscription */
  useEffect(() => {
    const faunaClient = new faunadb.Client({
      secret: faunaSecret,
      domain: "db.eu.fauna.com",
    });

    const allGuessesRef = q.Match(q.Index("all_guesses"));
    const streamOptions = { fields: ["action", "document", "index"]};

    // Fetch all existing guesses. Just in case we need to refresh.
    faunaClient.query(
      q.Paginate(allGuessesRef, { size: 100000})
    ).then(response => {
      // Todo: add entries in one go instead of one at a time. By
      //  iterating we cause a lot of re-renders that are not needed.
      response.data.forEach(entry => {
        const player = entry[0];
        const guess = entry[1];

        addGuess(guess);
      })
    })

    // Subscribe to guess updates sent by Fauna to keep a live update
    const stream = faunaClient.stream(allGuessesRef, streamOptions)
      .on("start", start => onFaunaEvent(start))
      .on("set", set => onFaunaEvent(set))
      .on("error", error => {
        console.log("Error: ", error);
        stream.close;
      })
      .start();

    return () => stream.close(); // cleanup
  }, [correctName]);

  console.log("Winner state: " + winner);
  console.log("correctName: "+ correctName);

  return (
    <main className="text-center">
      {/* Background image */}
      <div className="bgTeddy" />

      <Winner winner={winner} />

      <button
        className="opacity-0 hover:opacity-100"
        onClick={toggleResetAllData}
      >
        delete all data
      </button>

      <p className="text-8xl">❤️</p>
      <h1 className="text-8xl font-bold">Nafnaveisla</h1>
      <p className="mt-20 text-8xl">Gisk: {guesses.length}</p>
      <ul className="mt-20">
        {guesses.slice(0, 5).map(guess =>
          <li className="text-6xl mt-5" key={Math.random()}>{guess}</li>
        )}
      </ul>
    </main>
  );
}