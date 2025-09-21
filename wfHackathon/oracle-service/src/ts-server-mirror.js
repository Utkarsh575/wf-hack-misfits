import express from "express";
import axios from "axios";

const app = express();
const PORT = 3000;

// Configurable node endpoints
const RPC_URL = "http://localhost:26657";
const REST_URL = "http://localhost:1317";

// In-memory lists
const sanctionedWallets = ["wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5"];
const mixerWallets = [];
const darknetWallets = [];

app.use(express.json());

function getTransactionDetails(data) {
  const results = [];
  if (data && data.tx && data.tx.body && data.tx.body.messages) {
    const timestamp = data.tx_response.timestamp;
    data.tx.body.messages.forEach((message) => {
      if (message["@type"] === "/cosmos.bank.v1beta1.MsgSend") {
        const sender = message.from_address;
        const receiver = message.to_address;
        const amount = message.amount[0].amount;
        const denom = message.amount[0].denom;
        results.push({
          timestamp,
          sender,
          receiver,
          amount,
          denom,
        });
      }
    });
  }
  return results;
}

// GET /transactions/:address - Fetches and processes transaction data for a given address.
app.get("/transactions/:address", async (req, res) => {
  const address = req.params.address;
  try {
    const sentTxSearchUrl = `${RPC_URL}/tx_search?query=%22message.sender='${address}'%22&page=1&per_page=20`;
    const receivedTxSearchUrl = `${RPC_URL}/tx_search?query=%22transfer.recipient='${address}'%22&page=1&per_page=20`;
    const [sentTxSearchResp, receivedTxSearchResp] = await Promise.all([
      axios.get(sentTxSearchUrl),
      axios.get(receivedTxSearchUrl),
    ]);
    const sentTxs = sentTxSearchResp.data.result.txs || [];
    const receivedTxs = receivedTxSearchResp.data.result.txs || [];
    const uniqueTxsMap = new Map();
    [...sentTxs, ...receivedTxs].forEach((tx) => {
      uniqueTxsMap.set(tx.hash, tx);
    });
    const uniqueTxs = Array.from(uniqueTxsMap.values());
    const processedTransactions = [];
    for (const tx of uniqueTxs) {
      const txHash = tx.hash;
      const txDetailUrl = `${REST_URL}/cosmos/tx/v1beta1/txs/${txHash}`;
      try {
        const txDetailResp = await axios.get(txDetailUrl);
        const extractedData = getTransactionDetails(txDetailResp.data);
        if (extractedData.length > 0) {
          processedTransactions.push(...extractedData);
        }
      } catch (innerErr) {
        console.error(
          `Failed to fetch details for tx hash ${txHash}: ${innerErr.message}`
        );
      }
    }
    res.json({
      address,
      count: processedTransactions.length,
      transactions: processedTransactions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Sanctions endpoints
app.get("/sanctions/check/:address", (req, res) => {
  const address = req.params.address;
  const isSanctioned = sanctionedWallets.includes(address);
  res.json({ address, sanctioned: isSanctioned });
});
app.post("/sanctions/add", (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required." });
  if (sanctionedWallets.includes(address))
    return res.status(409).json({ error: "Address already on list." });
  sanctionedWallets.push(address);
  res
    .status(201)
    .json({ message: "Address added to sanctioned list.", address });
});

// Mixer endpoints
app.get("/mixers/check/:address", (req, res) => {
  const address = req.params.address;
  const isMixer = mixerWallets.includes(address);
  res.json({ address, mixer: isMixer });
});
app.post("/mixers/add", (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required." });
  if (mixerWallets.includes(address))
    return res.status(409).json({ error: "Address already on list." });
  mixerWallets.push(address);
  res.status(201).json({ message: "Address added to mixer list.", address });
});

// Darknet endpoints
app.get("/darknet/check/:address", (req, res) => {
  const address = req.params.address;
  const isDarknet = darknetWallets.includes(address);
  res.json({ address, darknet: isDarknet });
});
app.post("/darknet/add", (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required." });
  if (darknetWallets.includes(address))
    return res.status(409).json({ error: "Address already on list." });
  darknetWallets.push(address);
  res.status(201).json({ message: "Address added to darknet list.", address });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
