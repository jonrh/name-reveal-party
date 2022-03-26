/** Performs an HTTP POST request to the Vercel serverless API. */
function post(route, data) {
  return fetch(
    route,
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    }
  );
}

/** Makes a POST request to the API with a guess what the name is. */
export function getCorrectName(secret) {
  return post("/api/answer", { secret: secret});
}

/** Makes a POST request to the API with a guess what the name is. */
export function guessApi(player, guess) {
  return post("/api/guess", {
    player: player,
    guess: guess,
  });
}