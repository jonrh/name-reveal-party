/**
 * Returns the name of the child if the correct Fauna secret is provided.
 * Endpoint that expects a JSON of the form { "secret": "..." } and returns
 * { "answer": "name" }.
 */
export default async (req, res) => {
  const correctSecret = req.body["secret"] === process.env.FAUNA_SECRET_SERVER;
  const answer = correctSecret ? process.env.NAME2 : "incorrect secret";

  res.status(200).json({ answer: answer });
}