import faunadb, {
  Paginate,
  Documents,
  Collection,
  Lambda,
  Map,
  Get,
  Delete
} from "faunadb";

const allGuessesDocuments = Paginate(
  // 100.000 is the max Fauna page size. It is just a lazy way to get all
  // documents. It is known it will never be a large number. Likely 5-100.
  Documents(Collection("guesses")), { size: 100000 }
);

/**
 * Convenience function to instantiate a Fauna client.
 *
 * @param secret string, Fauna secret
 * @returns an instance of a Fauna client
 */
export function createFaunaClient(secret) {
  return new faunadb.Client({
    secret: secret,

    // For this project the EU region was chosen. If it is switched
    // to global the following domain attribute can be removed.
    domain: "db.eu.fauna.com",
  });
}

/**
 * Returns a promise of an array of guess objects.
 *
 * @param secret Fauna secret
 * @returns {Promise<[{ts: number, player: string, datetime: Date}]>}
 */
export function getAllGuesses(secret) {
  return new Promise((resolve, reject) => {
    createFaunaClient(secret).query(
      Map(allGuessesDocuments, Lambda(x => Get(x)))
    )
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

export function deleteAllGuesses(secret) {
  return new Promise((resolve, reject) => {
    createFaunaClient(secret).query(
      Map(allGuessesDocuments, Lambda(x => Delete(x)))
    )
      .then(results => resolve(results))
      .catch(error => reject(error));
  });
}