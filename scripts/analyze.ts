import "dotenv/config";
import { artifacts } from "hardhat";
import {
  createPublicClient,
  http,
  decodeEventLog,
  formatUnits,
} from "viem";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const TOKEN = process.env.TOKEN_ADDRESS as `0x${string}`;

// Paste your tx hashes here
const txHashes = [
  "0x46adbf92aba1dbcbdd91ad5fbb221334852a32c905541ac4a2c6173cf7549a66",
  "0x90d5f1707f11e7a3ace2d5417ba08a00bc6959905b14baa891de16a43ca4fb2c",
  "0x7c470aa25229632b6cd51e2611080a2564821ed7f89fd7679e4579bb633a90c1",
];

async function main() {
  const { abi } = await artifacts.readArtifact("CampusCredit");

  const chain = {
    id: CHAIN_ID,
    name: `didlab-${CHAIN_ID}`,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  } as const;

  const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

  for (const hash of txHashes) {
    console.log("\n--- Analyzing tx:", hash, "---");

    const tx = await publicClient.getTransaction({ hash });
    const rcpt = await publicClient.getTransactionReceipt({ hash });
    const blk = await publicClient.getBlock({ blockNumber: rcpt.blockNumber });

    console.log("Nonce:", tx.nonce);
    console.log("Gas Limit:", tx.gas);
    console.log("Gas Used:", rcpt.gasUsed.toString());
    console.log("Base Fee Per Gas:", blk.baseFeePerGas?.toString());
    console.log("Max Fee Per Gas:", tx.maxFeePerGas?.toString());
    console.log("Max Priority Fee Per Gas:", tx.maxPriorityFeePerGas?.toString());
    console.log("Effective Gas Price:", rcpt.effectiveGasPrice.toString());

    const totalFee = rcpt.gasUsed * rcpt.effectiveGasPrice;
    console.log("Total Fee (wei):", totalFee.toString());

    for (const log of rcpt.logs) {
      try {
        const ev = decodeEventLog({ abi, data: log.data, topics: log.topics });
        console.log("Event:", ev.eventName, ev.args);

        if (ev.eventName === "Transfer" || ev.eventName === "Approval") {
          console.log(
            "Human value:",
            formatUnits(ev.args.value as bigint, 18),
            "CAMP"
          );
        }
      } catch {
        // skip unrelated logs
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
