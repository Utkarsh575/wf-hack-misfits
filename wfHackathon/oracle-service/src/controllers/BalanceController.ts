import { Request, Response } from "express";
import axios from "axios";

export class BalanceController {
  static async getWalletBalance(req: Request, res: Response) {
    const address = req.query.address as string;
    if (!address) {
      return res.status(400).json({ error: "address query param required" });
    }
    try {
      const url = `http://localhost:1317/cosmos/bank/v1beta1/balances/${address}`;
      const response = await axios.get(url);
      res.json({ address, balances: response.data.balances });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
  static async getContractBalance(req: Request, res: Response) {
    const address = req.query.address as string;
    if (!address) {
      return res.status(400).json({ error: "address query param required" });
    }
    try {
      const url = `http://localhost:1317/cosmos/bank/v1beta1/balances/${address}`;
      const response = await axios.get(url);
      res.json({ address, balances: response.data.balances });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}
