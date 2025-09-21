export const wallets = [
  {
    label: "Alice",
    address: "wasm18thxpksjlupr6szqctcjvj0mmhkr0suj5t3xnj",
    mnemonic:
      "pony swap next infant awkward sheriff first ridge light away net shadow ankle meat copy various spell timber aerobic name atom excuse just gossip",
    isDefault: true,
  },
  {
    label: "Bob",
    address: "wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz",
    mnemonic:
      "mesh admit blade produce equip humor cluster chair arch loud like grant extend believe avocado hover dream market resist tobacco mass copper tide inherit",
    isDefault: false,
  },
  {
    label: "Charlie",
    address: "wasm1ga4d4tsxrk6na6ehttwvdfmn2ejy4gwfxpt2m7",
    mnemonic:
      "artist still shield fit embark same follow lounge model dumb valid half snake deposit divorce develop color glory liberty elder flight silly swing audit",
    isDefault: false,
  },
  {
    label: "Admin",
    address: "wasm1sse6pdmn5s7epjycxadjzku4qfgs604cgur6me",
    mnemonic:
      "enemy flower party waste put south clip march victory breeze oxygen cram hospital march enlist black october surprise across wage bomb spawn describe heavy",
    isDefault: false,
  },
  {
    label: "Oracle",
    address: "wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5",
    mnemonic:
      "leopard run palm busy weasel comfort maze turkey canyon rural response predict ball scale coil tape organ dizzy paddle mystery fluid flight capital thing",
    isDefault: false,
  },
];
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";

const RPC_URL = process.env.RPC_URL || "http://localhost:26657";
const CHAIN_ID = process.env.CHAIN_ID || "localnet";

export class WalletTransferService {
  static async transfer({
    senderLabel,
    recipientLabel,
    amount,
    denom,
  }: {
    senderLabel: string;
    recipientLabel: string;
    amount: string;
    denom: string;
  }) {
    const sender = wallets.find((w) => w.label === senderLabel);
    const recipient = wallets.find((w) => w.label === recipientLabel);
    if (!sender || !recipient) throw new Error("Invalid sender or recipient");
    if (sender.address === recipient.address)
      throw new Error("Sender and recipient cannot be the same");

    // Create wallet from mnemonic
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(sender.mnemonic, {
      prefix: "wasm",
    });
    const [account] = await wallet.getAccounts();
    const gasPrice = GasPrice.fromString("0.025ustake"); // adjust denom/rate as needed
    const client = await SigningStargateClient.connectWithSigner(
      RPC_URL.replace(/^http/, "ws"),
      wallet,
      { gasPrice }
    );

    // Send tokens
    const result = await client.sendTokens(
      account.address,
      recipient.address,
      [{ denom, amount }],
      "auto"
    );
    return { success: true, tx: result };
  }
}
