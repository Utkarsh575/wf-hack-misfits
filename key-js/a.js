const secp256k1 = require("secp256k1");
const { Secp256k1 } = require("@cosmjs/crypto");

const pubkeyHex =
  "04b912bd982bf4ee667aca9a619f3fecb949a9b792b58d7d0c1cd2afe8e677d291a6c83d6cbb8c8602f942d7c3dcb9d3ec8633c33bdd10e28db08e55a3388f294d";
const pubkeyBuf = Buffer.from(pubkeyHex, "hex");
const compressed = Secp256k1.compressPubkey(pubkeyBuf); // Uint8Array

// Output as base64 string
process.stdout.write(Buffer.from(compressed).toString("base64"));
