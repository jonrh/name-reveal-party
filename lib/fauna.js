import faunadb, { query as q } from "faunadb";

export function createFaunaClient(secret) {
  return new faunadb.Client({
    secret: secret,

    // For this project the EU region was chosen. If it is switched
    // to global the following domain attribute can be removed.
    domain: "db.eu.fauna.com",
  });
}