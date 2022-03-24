import React, {useState} from "react";
import Head from "next/head";

const inputStyle =
  "m-3 px-4 py-2 " +
  "border border-gray-300 " +
  "text-3xl text-center rounded " +
  "form-control rounded transition ease-in-out";

const buttonStyle = "bg-gray-300 mx-5 py-2 px-4 rounded text-3xl w-full";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <Head>
        <title>Nafnaveisla 🎉</title>
      </Head>

      <main className="text-center my-16">
        <p className="text-6xl font-bold">Hvað heitir þú?</p>

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