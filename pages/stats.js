import React, { useState, useEffect } from "react";
import { query as q } from "faunadb";
import { getAllGuesses } from "../lib/fauna";

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
    getAllGuesses(faunaSecret).then(guesses => setGuesses(guesses));
  }, [])

  return (
    <main className="">
      {guesses.map(guess =>
        <p>{guess.datetime.toISOString() +" "+ guess.guess +" - "+ guess.player}</p>
      )}
    </main>
  );
}
