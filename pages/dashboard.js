import React, { useState, useEffect } from "react";
import faunadb, { query as q } from "faunadb";

/**
 * Before the dashboard loads a hidden input field is presented. To log in we
 * paste the Fauna secret key. Once pasted the Dashboard will be initialised
 * and connects to Fauna with that secret. A hacky little way to securely
 * connect to Fauna without revealing the secret.
 */
export default function Authentication() {
  const [faunaSecret, setFaunaSecret] = useState("");

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
  const [guesses, setGuesses] = useState([]);
  const addGuess = guess => setGuesses(prevGuesses => [guess, ...prevGuesses]);

  const onFaunaEvent = event => {
    console.log("New stream event:")
    console.log(event);

    // event is a number when the stream starts, after that it is an object
    const readyToProcessEvents = typeof(event) !== "number";

    if (readyToProcessEvents) {
      const [player, guess] = event.index.values;

      console.log(`Player: ${player}`);
      console.log(`Guess: ${guess}`);

      addGuess(guess);
    }
  }

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
  }, [])

  return (
    <main className="text-center mx-5 my-10">
      <p className="text-3xl font-bold">Dashboard</p>
      <p>Guesses:</p>
      <ul>
        {guesses.map(guess => <li key={Math.random()}>{guess}</li>)}
      </ul>
    </main>
  );
}