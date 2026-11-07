// Regenerates the TypeScript bindings in src/contracts/generated/ from a deployed
// treasury contract, using the Stellar CLI.
//
//   npm run bindings -- <CONTRACT_ID> [network]
//
// The contract ID defaults to NEXT_PUBLIC_TREASURY_CONTRACT_ID and the network to
// "testnet". The generated file is never edited by hand: run this again instead.

import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const contractId = process.argv[2] ?? process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID;
const network = process.argv[3] ?? "testnet";

if (!contractId || !/^C[A-Z2-7]{55}$/.test(contractId)) {
  console.error("Pass a valid contract ID (starts with C): npm run bindings -- <CONTRACT_ID> [network]");
  process.exit(1);
}

// The CLI requires the folder name to be a valid npm package name: lowercase only.
const workDir = join(tmpdir(), `quintti-bindings-${Date.now().toString(36)}`);
mkdirSync(workDir, { recursive: true });
try {
  const result = spawnSync(
    "stellar",
    [
      "contract",
      "bindings",
      "typescript",
      "--contract-id",
      contractId,
      "--network",
      network,
      "--output-dir",
      workDir,
      "--overwrite",
    ],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  if (result.status !== 0) {
    console.error("The Stellar CLI failed. Is it installed (`stellar --version`) and is the contract deployed?");
    process.exit(result.status ?? 1);
  }

  const target = fileURLToPath(new URL("../src/contracts/generated/", import.meta.url));
  mkdirSync(target, { recursive: true });
  copyFileSync(join(workDir, "src", "index.ts"), join(target, "index.ts"));
  console.log(`Bindings written to src/contracts/generated/index.ts (contract ${contractId}, ${network})`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
