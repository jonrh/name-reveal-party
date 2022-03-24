import React, {useState} from "react";
import Head from "next/head";

const inputStyle =
  "my-3 py-2 px-4 " +
  "border-2 border-gray-300 " +
  "text-2xl text-center rounded " +
  "form-control transition ease-in-out w-full";

const buttonStyle =
  "py-4 px-4 " +
  "text-2xl " +
  "bg-gray-300 " +
  "rounded w-full";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <Head>
        <title>Nafnaveisla 🎉</title>
      </Head>

      <main className="text-center mx-5 my-16">
        <p className="text-3xl font-bold">Hvað heitir þú?</p>

        <input
          type="text"
          value={name}
          autoFocus={true}
          placeholder="Dæmi: Jón Jónsson"
          className={inputStyle}
          onChange={event => setName(event.target.value)}
        />

        <div>
          <button
            type="button"
            className={buttonStyle}
            onClick={() => setReady(true)}
          >
            Byrja!
          </button>
        </div>

        {/* Debug: */}
        {/*<p className="mt-5">Ready: {ready ? "true" : "false"}</p>*/}
        {/*<p>Nafn: {name}</p>*/}
      </main>
    </>
  )
}