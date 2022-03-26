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

  const [resetAllData, setResetAllData] = useState(false);
  const toggleResetAllData = () => setResetAllData(prev => !prev);

  const [guesses, setGuesses] = useState([]);
  const addGuess = guess => setGuesses(prevGuesses => [guess, ...prevGuesses]);

  const onFaunaEvent = event => {
    console.log("New stream event:")
    console.log(event);

    // event is a number when the stream starts, after that it is an object
    const readyToProcessEvents = typeof(event) !== "number";
    const notRemoveEvent = event.action !== "remove";

    if (readyToProcessEvents && notRemoveEvent) {
      const [player, guess] = event.index.values;

      // console.log(`Player: ${player}`); // Debug
      // console.log(`Guess: ${guess}`); // Debug

      addGuess(guess);
    }
  }

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
  }, [resetAllData])

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
  }, [])

  return (
    <main className="text-center mx-5">
      {/* Background image */}
      <div className="bgTeddy" />

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