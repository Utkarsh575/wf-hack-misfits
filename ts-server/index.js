import express from "express";
import axios from "axios";

const app = express();
const PORT = 3000;

// Configurable node endpoints
const RPC_URL = "http://localhost:26657";
const REST_URL = "http://localhost:1317";

// In-memory list of sanctioned wallet addresses
const sanctionedWallets = [
  "wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5",
  "sanctioned_wallet_2",
  "sanctioned_wallet_3",
];

// Middleware to parse JSON bodies for the POST request
app.use(express.json());

/**
 * Extracts sender, receiver, timestamp, amount, and denomination from a transaction object.
 * @param {object} data The transaction data object.
 * @returns {Array<object>} An array of objects with transaction details.
 */
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
          timestamp: timestamp,
          sender: sender,
          receiver: receiver,
          amount: amount,
          denom: denom,
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
    const txSearchUrl = `${RPC_URL}/tx_search?query=%22transfer.recipient='${address}'%22&page=1&per_page=20`;
    const txSearchResp = await axios.get(txSearchUrl);
    const txs = txSearchResp.data.result.txs || [];

    const processedTransactions = [];

    // Process each transaction to extract the required details
    for (const tx of txs) {
      const txHash = tx.hash;
      const txDetailUrl = `${REST_URL}/cosmos/tx/v1beta1/txs/${txHash}`;

      try {
        const txDetailResp = await axios.get(txDetailUrl);
        const extractedData = getTransactionDetails(txDetailResp.data);

        // Add the extracted data to our results array
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
      address: address,
      count: processedTransactions.length,
      transactions: processedTransactions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /sanctions/check/:address - Checks the sanction status of a single wallet address.
app.get("/sanctions/check/:address", (req, res) => {
  const address = req.params.address;
  const isSanctioned = sanctionedWallets.includes(address);
  res.json({ address, sanctioned: isSanctioned });
});

// POST /sanctions/add - Adds a new wallet address to the sanctioned list.
app.post("/sanctions/add", (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res
      .status(400)
      .json({ error: "Address is required in the request body." });
  }

  if (sanctionedWallets.includes(address)) {
    return res
      .status(409)
      .json({ error: "Address is already on the sanctioned list." });
  }

  sanctionedWallets.push(address);
  res
    .status(201)
    .json({ message: "Address added to sanctioned list.", address });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
