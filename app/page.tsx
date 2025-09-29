"use client";

import { useEffect, useState } from "react";
import { publicClient } from "../utils/client";
import abi from "../utils/abi.json";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

const CONTRACT_ADDRESS = "0xbd5d1419E9920a2269c89d7b07dff9457fF625c8"; // replace with your deployed contract address

// Wallet client for writes (MetaMask)
let walletClient: any;
if (typeof window !== "undefined" && (window as any).ethereum) {
  walletClient = createWalletClient({
    chain: sepolia,
    transport: custom((window as any).ethereum),
  });
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  // Read contract on page load
  useEffect(() => {
    async function fetchMessage() {
      try {
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getMessage",
        });
        setMessage((result as string).toString());
      } catch (err) {
        console.error("Error reading contract:", err);
      }
    }

    fetchMessage();
  }, []);

  // Connect MetaMask
  async function connectWallet() {
    if (!(window as any).ethereum) return alert("MetaMask not found!");
    const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    setWalletAddress(accounts[0]);
  }

  // Write new message
  async function updateMessage() {
    if (!walletClient) return alert("Wallet not connected!");

    try {
      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "setMessage",
        args: [newMessage],
        account: walletAddress as `0x${string}`,
      });

      // Refresh after update
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getMessage",
      });
      setMessage((result as string).toString());
      setNewMessage("");
    } catch (err) {
      console.error("Error writing to contract:", err);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-12 space-y-6">
      <h1 className="text-4xl font-bold">StringStore DApp</h1>

      <p className="text-xl">Contract says: {message}</p>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col space-y-4 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter a new message"
            className="border p-2 rounded-lg w-80"
          />
          <button
            onClick={updateMessage}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Update Message
          </button>
          <p className="text-sm text-gray-500">Connected as {walletAddress}</p>
        </div>
      )}
    </main>
  );
}
