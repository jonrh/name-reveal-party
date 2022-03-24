import React, {useState} from "react";
import Head from "next/head";

const inputStyle =
  "my-3 px-4 py-2 " +
  "border-2 border-gray-300 " +
  "text-2xl text-center rounded " +
  "form-control rounded transition ease-in-out w-full";

const buttonStyle =
  "bg-gray-300 " +
  "py-2 px-4 rounded text-2x°xl " +
  "w-full";

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
          placeholder="Jón Jónsson"
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