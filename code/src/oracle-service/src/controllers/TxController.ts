import { Request, Response } from "express";
import axios from "axios";

const RPC_URL = "http://localhost:26657";
const REST_URL = "http://localhost:1317";

export function getTransactionDetails(data: any) {
  const results: any[] = [];
  if (data && data.tx && data.tx.body && data.tx.body.messages) {
    const timestamp = data.tx_response.timestamp;
    const hash = data.tx_response.txhash;
    data.tx.body.messages.forEach((message: any) => {
      if (message["@type"] === "/cosmos.bank.v1beta1.MsgSend") {
        const sender = message.from_address;
        const receiver = message.to_address;
        const amount = message.amount[0].amount;
        const denom = message.amount[0].denom;
        results.push({ hash, timestamp, sender, receiver, amount, denom });
      }
    });
  }
  return results;
}

export class TxController {
  static async getTransactions(req: Request, res: Response) {
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
      [...sentTxs, ...receivedTxs].forEach((tx: any) => {
        uniqueTxsMap.set(tx.hash, tx);
      });
      const uniqueTxs = Array.from(uniqueTxsMap.values());
      const processedTransactions: any[] = [];
      for (const tx of uniqueTxs) {
        const txHash = tx.hash;
        const txDetailUrl = `${REST_URL}/cosmos/tx/v1beta1/txs/${txHash}`;
        try {
          const txDetailResp = await axios.get(txDetailUrl);
          const extractedData = getTransactionDetails(txDetailResp.data);
          if (extractedData.length > 0) {
            processedTransactions.push(...extractedData);
          }
        } catch (innerErr: any) {
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
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
}
