import React, { useState, useEffect } from "react";
import { query as q } from "faunadb";
import Confetti from "react-confetti";
import { getCorrectName} from "../lib/api";
import { createFaunaClient, deleteAllGuesses } from "../lib/fauna";

function Winner({ winner, correctName }) {
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

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={1000}
      />

      <p className="text-6xl py-20">Systir Nóa heitir:</p>
      <p className="text-9xl">{correctName}</p>
      <p className="text-5xl mt-20">Sigurvegari:</p>
      <p className="text-5xl mt-10 mb-20">{winner}</p>
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

function Top10List(props) {
  const { names } = props; // Either guesses or players

  const count = {};

  for (const name of names) {
    if (count[name.toLowerCase()]) {
      count[name.toLowerCase()] += 1;
    } else {
      count[name.toLowerCase()] = 1;
    }
  }

  const descSort = (a, b) => a[1] < b[1] ? 1 : -1;
  const capitaliseFirstLetters = str =>
    str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  // Example [["Jón", 10], ["Rúnar", 7], ...]
  const sorted = Object.entries(count)
    .sort(descSort)
    .slice(0, 10); // only pick top ten

  console.log("Top10");
  console.log(sorted);

  return (
    <ul className="mt-20">
      {sorted.map(([name, count]) =>
        <li className="text-6xl mt-5" key={name}>
          {count +": "+ capitaliseFirstLetters(name)}
        </li>
      )}
    </ul>
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

  // On every guess the player name is added, used later for frequency
  const [players, setPlayers] = useState([]);

  /** Manage state when a new guess document is received */
  const onFaunaEvent = event => {
    // console.log("New stream event:");
    // console.log(event);

    const [player, guess] = event.index.values;
    const newGuessAdded = event.action === "add";
    const nobodyHasWonYet = winner === "";
    const correctGuess = guess.toLowerCase() === correctName.toLowerCase();

    if (newGuessAdded && nobodyHasWonYet) {
      addGuess(guess);
      setPlayers(prevState => [player, ...prevState]);
    }

    if (newGuessAdded && correctGuess) setWinner(player);
  }

  /** Fetches and sets the correct name of the child */
  useEffect(() => {
    getCorrectName(faunaSecret).then(response => {
      response.json().then(resp => {
        setCorrectName(resp.answer);
      });
    })
  }, []);

  /** Deletes all guesses in Fauna */
  useEffect(() => {
    if (resetAllData) {
      deleteAllGuesses(faunaSecret)
        .then(results => {
          console.log("All guesses in Fauna deleted");
          setGuesses([]);
          setPlayers([]);
        })
        .catch(error => {
          console.log("Error attempting to delete all guesses in Fauna");
          console.log(error);
        });
    }
  }, [resetAllData]);

  /** Fetch existing data and stream subscription */
  useEffect(() => {
    const faunaClient = createFaunaClient(faunaSecret);

    const allGuessesRef = q.Match(q.Index("all_guesses"));
    const streamOptions = { fields: ["action", "index"]};

    // Fetch all existing guesses. Just in case we need to refresh.
    faunaClient.query(q.Paginate(allGuessesRef, { size: 100000}))
      .then(resp => {
        setGuesses(resp.data.reverse().map(entry => entry[1]));
        setPlayers(resp.data.reverse().map(entry => entry[0]));
      });

    // Subscribe to guess updates sent by Fauna to keep a live update
    const stream = faunaClient.stream(allGuessesRef, streamOptions)
      .on("set", set => onFaunaEvent(set))
      .on("error", error => {
        console.log("Error: ", error);
        stream.close();
      })
      .start();

    return () => stream.close(); // cleanup
  }, [correctName, winner]);

  return (
    <main className="text-center">
      {/* Background image */}
      <div className="bgTeddy" />

      <Winner winner={winner} correctName={correctName} />

      <button
        className="opacity-0 hover:opacity-100"
        onClick={toggleResetAllData}
      >
        delete all data
      </button>

      <p className="text-8xl">❤️️ nafn.jonrh.is ❤️️</p>

      <div className="grid grid-cols-3">
        <div className="mt-10">
          <p className="mt-10 text-8xl">Oftast</p>
          <Top10List names={guesses} />
        </div>

        <div className="mt-10">
          <p className="mt-10 text-8xl">Gisk: {guesses.length}</p>
          <ul className="mt-20">
            {guesses.map(guess =>
              <li className="text-6xl mt-5" key={Math.random()}>{guess}</li>
            )}
          </ul>
        </div>

        <div className="mt-10">
          <p className="mt-10 text-8xl">Spilarar</p>
          <Top10List names={players} />
        </div>
      </div>

    </main>
  );
}
