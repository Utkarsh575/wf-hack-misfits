import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { OracleClient } from "./sdk/Oracle.client";
import { fromHex, toUtf8 } from "@cosmjs/encoding";
import { sha256, Secp256k1 } from "@cosmjs/crypto";
import * as dotenv from "dotenv";
dotenv.config();

const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ORACLE_PRIVKEY = process.env.ORACLE_PRIVKEY!;
const CHARLIE_PRIVKEY = process.env.CHARLIE_PRIVKEY!; // hex key for Charlie
const ORACLE_ADDR = "wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5";

async function main() {
  // 1️⃣ Setup Charlie wallet
  const charlieWallet = await DirectSecp256k1Wallet.fromKey(
    fromHex(CHARLIE_PRIVKEY),
    "wasm"
  );
  const charlieAddr = (await charlieWallet.getAccounts())[0].address;
  const clientCharlie = await SigningCosmWasmClient.connectWithSigner(
    RPC_URL,
    charlieWallet,
    { gasPrice: GasPrice.fromString("0ustake") }
  );

  // 2️⃣ Oracle client (for later signing)
  const oracleWallet = await DirectSecp256k1Wallet.fromKey(
    fromHex(ORACLE_PRIVKEY),
    "wasm"
  );
  const oracleAddr = (await oracleWallet.getAccounts())[0].address;
  const oracleClient = new OracleClient(
    clientCharlie,
    oracleAddr,
    CONTRACT_ADDRESS
  );

  // 3️⃣ Charlie sends coins to Oracle
  const sendAmount = [{ denom: "ustake", amount: "1000000" }]; // 1 token
  console.log(`Sending ${sendAmount[0].amount}ustake from Charlie -> Oracle`);
  const sendResult = await clientCharlie.execute(
    charlieAddr,
    ORACLE_ADDR,
    { send: { recipient: ORACLE_ADDR } },
    "auto",
    "Funding Oracle",
    sendAmount
  );
  console.log("Send Tx Result:", sendResult);

  // 4️⃣ Oracle simulates AML check
  const txId = `tx-${Date.now()}`;
  const dataToSign = txId;
  const hash = sha256(toUtf8(dataToSign));
  const signature = await Secp256k1.createSignature(
    hash,
    fromHex(ORACLE_PRIVKEY)
  );
  const rs = signature.toFixedLength().slice(0, 64);
  const signatureBase64 = Buffer.from(rs).toString("base64");

  console.log("Oracle submits callback for tx:", txId);
  await oracleClient.oracleDataUpdate({
    data: dataToSign,
    signature: signatureBase64,
  });

  console.log("✅ Demo completed. Check Oracle account for funds.");
}

main().catch(console.error);
