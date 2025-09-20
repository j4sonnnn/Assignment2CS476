THE SCREENSHOTS ARE IN ISSUES

Start a local Hardhat node:

npx hardhat node


In another tab, deploy the contract:

npx hardhat run scripts/deploy.ts --network localhost


Run the interact script:

npx hardhat run scripts/interact.ts --network localhost


Finally, analyze transactions:

npx hardhat run scripts/analyze.ts --network localhost
