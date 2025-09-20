import "dotenv/config";
import { artifacts } from "hardhat";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  getAddress
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const TOKEN = process.env.TOKEN_ADDRESS as `0x${string}`;

async function main() {
  const { abi } = await artifacts.readArtifact("CampusCredit");

  const chain = {
    id: CHAIN_ID,
    name: `didlab-${CHAIN_ID}`,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  } as const;

  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
  const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

  const me = getAddress(account.address);
  const you = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // second Hardhat account

  // Transfer 1
  const tx1 = await wallet.writeContract({
    address: TOKEN,
    abi,
    functionName: "transfer",
    args: [you, parseUnits("100", 18)],
    maxPriorityFeePerGas: 1_000_000_000n,
    maxFeePerGas: 10_000_000_000n,
  });
  console.log("tx1 transfer hash:", tx1);

  // Transfer 2
  const tx2 = await wallet.writeContract({
    address: TOKEN,
    abi,
    functionName: "transfer",
    args: [you, parseUnits("200", 18)],
    maxPriorityFeePerGas: 2_000_000_000n,
    maxFeePerGas: 12_000_000_000n,
  });
  console.log("tx2 transfer hash:", tx2);

  // Approval
  const tx3 = await wallet.writeContract({
    address: TOKEN,
    abi,
    functionName: "approve",
    args: [you, parseUnits("50", 18)],
    maxPriorityFeePerGas: 3_000_000_000n,
    maxFeePerGas: 15_000_000_000n,
  });
  console.log("tx3 approve hash:", tx3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
