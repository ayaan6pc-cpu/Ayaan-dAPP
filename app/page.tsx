"use client";

import { useEffect, useState } from "react";
import { publicClient } from "../utils/client";
import abi from "../utils/abi.json";
// 1. Import the necessary types from viem
import { createWalletClient, custom, WalletClient, Address, EIP1193Provider } from "viem";
import { sepolia } from "viem/chains";

const CONTRACT_ADDRESS = "0xbd5d1419E9920a2269c89d7b07dff9457fF625c8";

// 2. Define a type for the window.ethereum object to avoid using 'any'
interface CustomWindow extends Window {
  ethereum?: EIP1193Provider;
}

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  // 3. Use the specific 'Address' type for the wallet address
  const [walletAddress, setWalletAddress] = useState<Address | "">("");
  // 4. Use the specific 'WalletClient' type instead of 'any'
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getMessage",
        });
        setMessage(result as string);
      } catch (err) {
        console.error("Error reading contract:", err);
      }
    }
    fetchMessage();
  }, []);

  async function connectWallet() {
    const customWindow = window as CustomWindow;
    if (typeof customWindow.ethereum === "undefined") {
      return alert("MetaMask not found!");
    }

    try {
      const [account] = await customWindow.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(account);

      const client = createWalletClient({
        account,
        chain: sepolia,
        transport: custom(customWindow.ethereum),
      });
      setWalletClient(client);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  }

  async function updateMessage() {
    if (!walletClient || !walletAddress) {
      return alert("Please connect your wallet first!");
    }

    try {
      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "setMessage",
        args: [newMessage],
        account: walletAddress,
        chain: undefined
      });

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getMessage",
      });
      setMessage(result as string);
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