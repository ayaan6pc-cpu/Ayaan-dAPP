import { publicClient } from "../utils/client";
import contractAbi from './abi.json'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`

export async function readSomething() {
  const data = await publicClient.readContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'yourFunctionName',
  })
  console.log("✨ Contract says:", data)
}