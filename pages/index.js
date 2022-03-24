import React, {useState} from "react";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <p>Hvað heitir þú?</p>
      <input
        type="text"
        value={name}
        autoFocus={true}
        placeholder="Jón Jónsson"
        onChange={event => setName(event.target.value)}
      />
      <br />
      <button onClick={() => setReady(true)}>Byrja!</button>
      <br />
      Ready: {ready ? "true" : "false"}
      <br />
      Nafn: {name}
    </>
  )
}