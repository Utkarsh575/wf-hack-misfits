import {
  Secp256k1,
  sha256,
  Slip10,
  Slip10Curve,
  EnglishMnemonic,
  Bip39,
  Slip10RawIndex,
} from "@cosmjs/crypto";
import { toHex } from "@cosmjs/encoding";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { coins, GasPrice } from "@cosmjs/stargate";

export class OracleService {
  static async getPrivkeyFromMnemonic(mnemonic: string) {
    const hdPath = [
      Slip10RawIndex.hardened(44),
      Slip10RawIndex.hardened(118),
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.normal(0),
      Slip10RawIndex.normal(0),
    ];
    const seed = await Bip39.mnemonicToSeed(new EnglishMnemonic(mnemonic));
    const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, hdPath);
    return privkey;
  }

  static async signReceive({
    sender,
    amount,
    nonce,
    mnemonic,
    contractAddr,
  }: {
    sender: string;
    amount: string;
    nonce: string;
    mnemonic: string;
    contractAddr: string;
  }) {
    const privkey = await OracleService.getPrivkeyFromMnemonic(mnemonic);
    const message = `${sender}|${amount}|${contractAddr}|${nonce}`;
    const messageHash = sha256(Buffer.from(message));
    const signatureObj = await Secp256k1.createSignature(messageHash, privkey);
    const signature = signatureObj.toFixedLength().slice(0, 64);
    const keypair = await Secp256k1.makeKeypair(privkey);
    const pubkey = keypair.pubkey;
    return {
      message,
      messageHash: toHex(messageHash),
      signature: Buffer.from(signature).toString("base64"),
      signature_hex: toHex(signature),
      pubkey: Buffer.from(pubkey).toString("base64"),
      pubkey_hex: toHex(pubkey),
    };
  }

  static async executeContract({
    mnemonic,
    contract,
    msg,
    amount,
    denom,
    rpcUrl,
  }: {
    mnemonic: string;
    contract: string;
    msg: any;
    amount: string;
    denom: string;
    rpcUrl: string;
  }) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "wasm",
    });
    const [account] = await wallet.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcUrl,
      wallet,
      { gasPrice: GasPrice.fromString("0.025ustake") }
    );
    const result = await client.execute(
      account.address,
      contract,
      msg,
      "auto",
      undefined,
      coins(amount, denom)
    );
    // Recursively convert all BigInt values to string
    function convertBigInts(obj: any): any {
      if (typeof obj === "bigint") return obj.toString();
      if (Array.isArray(obj)) return obj.map(convertBigInts);
      if (obj && typeof obj === "object") {
        const res: any = {};
        for (const key of Object.keys(obj)) {
          res[key] = convertBigInts(obj[key]);
        }
        return res;
      }
      return obj;
    }
    return convertBigInts(result);
  }
}
