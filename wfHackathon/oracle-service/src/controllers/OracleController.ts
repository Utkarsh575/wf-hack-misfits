import { Request, Response } from "express";
import { OracleService } from "../services/OracleService";
import { ComplianceController } from "./ComplianceController";

export class OracleController {
  static async signReceive(req: Request, res: Response, config: any) {
    try {
      const { sender, amount, nonce } = req.body;
      if (!sender || !amount || !nonce) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }
      if (!config.MNEMONIC) {
        return res
          .status(500)
          .json({ success: false, error: "Oracle mnemonic not configured" });
      }
      if (!config.CONTRACT_ADDR) {
        return res
          .status(500)
          .json({
            success: false,
            error: "Oracle contract address not configured",
          });
      }

      // Compliance check before signature validation
      const isCompliant = await ComplianceController.isTransactionCompliant(sender);
      if (!isCompliant) {
        return res.status(403).json({ success: false, error: "Transaction failed compliance check." });
      }

      const result = await OracleService.signReceive({
        sender,
        amount,
        nonce,
        mnemonic: config.MNEMONIC,
        contractAddr: config.CONTRACT_ADDR,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static async executeContract(req: Request, res: Response, rpcUrl: string) {
    try {
      const { mnemonic, contract, msg, amount, denom } = req.body;
      if (!mnemonic || !contract || !msg || !amount || !denom) {
        return res
          .status(400)
          .json({ error: "mnemonic, contract, msg, amount, denom required" });
      }
      const result = await OracleService.executeContract({
        mnemonic,
        contract,
        msg,
        amount,
        denom,
        rpcUrl,
      });
      res.json({ success: true, tx: result });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  }
}
