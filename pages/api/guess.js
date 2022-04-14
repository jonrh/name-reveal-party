import { query as q } from "faunadb";
import { createFaunaClient } from "../../lib/fauna";

/**
 * An API endpoint invoked with every name guess by a player. Expects a JSON
 * POST request with a body like this:
 *
 * {
 *   "player": "Jón Jónsson",
 *   "guess": "Lóa Sif"
 * }
 *
 * "player" is the person making the guess and the guess attribute is the name
 * they are guessing for the child.
 *
 * This endpoint assumes that there are two Vercel environment variables:
 *
 *   + NAME: the correct name of the child
 *   + FAUNA_SECRET_SERVER: secret key for the Fauna database
 */
export default async (req, res) => {
  const faunaClient = createFaunaClient(process.env.FAUNA_SECRET_SERVER);

  const insert = faunaClient.query(
    q.Create(
      q.Collection("guesses"),
      { data: {
        player: req.body["player"],
        guess: req.body["guess"],
      }}
    )
  );

  console.log("Output from Fauna insert: ");
  insert
    .then(resp => console.log(resp))
    .catch(error => console.log(error));

  await insert;
  await faunaClient.close();

  res.status(200).json({ results: "results" });
}