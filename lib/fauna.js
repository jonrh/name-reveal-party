import faunadb, { query as q } from "faunadb";
const { Paginate, Documents, Collection, Lambda, Map, Get } = q;

export function createFaunaClient(secret) {
  return new faunadb.Client({
    secret: secret,

    // For this project the EU region was chosen. If it is switched
    // to global the following domain attribute can be removed.
    domain: "db.eu.fauna.com",
  });
}

export function getAllGuesses(secret) {
  return new Promise((resolve, reject) => {
    const allGuessesDocuments = Paginate(
      Documents(Collection("guesses")), { size: 100000 }
    );

    createFaunaClient(secret).query(
      Map(
        allGuessesDocuments,
        Lambda(x => Get(x))
      ))
      .then(resp => {
        const ascSort = (a, b) => a.ts > b.ts ? 1 : -1;
        const faunaGuesses = resp.data.map(guess => ({
          ts: guess.ts,
          player: guess.data.player,
          guess: guess.data.guess,

          // Divide by 1000 because Fauna uses unix time stamp in
          // microseconds, Date() expects the time in milliseconds.
          datetime: new Date(guess.ts / 1000),
        })).sort(ascSort);

        resolve(faunaGuesses);
      })
      .catch(error => reject(error));
  });
}