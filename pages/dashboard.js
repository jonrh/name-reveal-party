import React, { useState, useEffect } from "react";
import faunadb, { query as q } from "faunadb";

export default function Dashboard() {
  const [guesses, setGuesses] = useState([]);
  const addGuess = guess => setGuesses(prevGuesses => [...prevGuesses, guess]);

  const report = event => {
    console.log("New stream event:")
    console.log(event);

    // event is a number when the stream starts, after that an object
    if (typeof(event) !== "number") {
      const [player, guess] = event.index.values;

      console.log(`Player: ${player}`);
      console.log(`Guess: ${guess}`);

      addGuess(guess);
    }
  }

  useEffect(() => {
    const faunaClient = new faunadb.Client({
      // Todo: figure out a better way to expose the Fauna secret. Hardcoded
      //  for now. May need to use password protection that decodes the value.
      //  One simple way would be to present an input before the dashboard
      //  loads which would be the Fauna secret. Probably the simplest.
      secret: "replace me",
      domain: "db.eu.fauna.com",
    });

    const collectionRef = q.Documents(q.Collection("guesses"));
    const indexRef = q.Match(q.Index("all_guesses"));
    const streamOptions = { fields: ["action", "document", "index"]};

    const stream = faunaClient.stream(indexRef, streamOptions)
      .on("start", start => report(start))
      .on("set", set => report(set))
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