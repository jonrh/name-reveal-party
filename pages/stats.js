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

  if (faunaSecret !== "") return <Stats faunaSecret={faunaSecret} />;

  return (
    <input
      type="password"
      value={faunaSecret}
      onChange={event => setFaunaSecret(event.target.value)}
    />
  );
}

function Stats(props) {
  const { faunaSecret } = props;
  const [guesses, setGuesses] = useState([]);

  /** Fetch existing data and stream subscription */
  useEffect(() => {
    const faunaClient = new faunadb.Client({
      secret: faunaSecret,
      domain: "db.eu.fauna.com",
    });

    const allDocuments = q.Paginate(
      q.Documents(q.Collection("guesses")), { size: 100000 }
    );

    faunaClient.query(
      q.Map(
        allDocuments,
        q.Lambda(x => q.Get(x))
      )
    ).then(resp => {
      const ascSort = (a, b) => a.ts > b.ts ? 1 : -1;
      const faunaGuesses = resp.data.map(guess => ({
        ts: guess.ts,
        player: guess.data.player,
        guess: guess.data.guess,

        // Divide by 1000 because Fauna uses unix time stamp in
        // microseconds, Date() expects the time in milliseconds.
        datetime: new Date(guess.ts / 1000),
      })).sort(ascSort);

      setGuesses(faunaGuesses);
    });

  }, []);

  return (
    <main className="">
      {guesses.map(guess =>
        <p>{guess.datetime.toISOString() +" "+ guess.guess +" - "+ guess.player}</p>
      )}
    </main>
  );
}
