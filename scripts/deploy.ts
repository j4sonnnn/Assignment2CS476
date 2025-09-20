import "dotenv/config";
import { artifacts } from "hardhat";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");

async function main() {
  if (!RPC_URL || !CHAIN_ID || !PRIVATE_KEY) {
    throw new Error("Missing RPC_URL / CHAIN_ID / PRIVATE_KEY in .env");
  }

  // Load the new CampusCredit contract (Assignment 2 version)
  const { abi, bytecode } = await artifacts.readArtifact("CampusCredit");

  const chain = {
    id: CHAIN_ID,
    name: `didlab-${CHAIN_ID}`,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  } as const;

  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
  const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

  // Assignment 2 requires constructor(initialSupply)
  const supply = parseUnits("1000000", 18); // 1 million CAMP

  console.log("Deploying CampusCredit...");
  const hash = await wallet.deployContract({
    abi,
    bytecode,
    args: [supply],   // constructor argument
  });

  console.log("Deploy tx:", hash);
  const rcpt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Deployed at:", rcpt.contractAddress);
  console.log("Block:", rcpt.blockNumber);

  console.log(`\nAdd this to .env:\nTOKEN_ADDRESS=${rcpt.contractAddress}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
