"use client";

import { useEffect, useState } from "react";
// import publicClient from "../utils/client"; // adjust if your file is in another path
import { publicClient } from "../utils/client"; // Use named import since there is no default export
import abi from "../utils/abi.json"; // make sure you actually have abi.ts or abi.json

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMessage() {
      try {
        const result = await publicClient.readContract({
          address: "0xbd5d1419E9920a2269c89d7b07dff9457fF625c8", // replace with your deployed contract address
          abi,
          functionName: "getMessage", // e.g. "getMessage" or whatever function exists
        });
        setMessage((result as string | number | bigint).toString());
      } catch (err) {
        console.error("Error reading contract:", err);
      }
    }

    fetchMessage();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold mb-6">Vanderbilt Blockchain DApp 🚀</h1>
      {message ? (
        <p className="text-xl">Contract says: {message}</p>
      ) : (
        <p className="text-gray-500">Loading contract data...</p>
      )}
    </main>
  );
}
