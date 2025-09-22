import { Request, Response } from "express";
import { WalletTransferService } from "../services/WalletTransferService";

export class WalletTransferController {
  static async transfer(req: Request, res: Response) {
    try {
      const { senderLabel, recipientLabel, amount, denom } = req.body;
      if (!senderLabel || !recipientLabel || !amount || !denom) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const result = await WalletTransferService.transfer({
        senderLabel,
        recipientLabel,
        amount,
        denom,
      });
      // Safely serialize BigInt values
      res.setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify(result, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      );
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
}
