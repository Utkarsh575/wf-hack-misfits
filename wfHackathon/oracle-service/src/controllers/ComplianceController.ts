import { Request, Response } from "express";

import { ComplianceService } from "../services/ComplianceService";
import axios from "axios";
  
const complianceService = new ComplianceService();

export class ComplianceController {
  static async isTransactionCompliant(address: string): Promise<boolean> {
    try {
      const response = await axios.get("http://127.0.0.1:8000/compute-risk/", {
        params: { wallet_address: address },
      });
      const riskScore = response.data.risk_score;
      // Define your risk threshold
      return riskScore < 70; // Example: only allow if risk score is below 70
    } catch (error) {
      // Log error and treat as non-compliant
      return false;
    }
  }

  static async getRiskScore(req: Request, res: Response) {
    const address = req.params.address;
    if (!address) {
      return res.status(400).json({ error: "Address is required." });
    }
    try {
      // Adjust the URL if your Django server runs elsewhere or on a different port
      const response = await axios.get("http://127.0.0.1:8000/compute-risk/", {
        params: { wallet_address: address },
      });
      // Adjust 'risk_score' if your Django response uses a different key
      res.json({ address, risk_score: response.data.risk_score });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch risk score", details: error.message });
    }
  }



  static getAllSanctioned(req: Request, res: Response) {
    // Merge all high-risk addresses into one list
    const allSanctioned = [
      ...complianceService.sanctionedWallets,
      ...complianceService.mixerWallets,
      ...complianceService.darknetWallets
    ];
    // Remove duplicates if any
    const uniqueSanctioned = Array.from(new Set(allSanctioned));
    res.json({ sanctioned: uniqueSanctioned });
  }
  static getAllMixers(req: Request, res: Response) {
    res.json({ mixers: complianceService.mixerWallets });
  }
  static getAllDarknet(req: Request, res: Response) {
    res.json({ darknet: complianceService.darknetWallets });
  }
  static checkSanctioned(req: Request, res: Response) {
    const address = req.params.address;
    res.json({ address, sanctioned: complianceService.isSanctioned(address) });
  }
  static addSanctioned(req: Request, res: Response) {
    const { address } = req.body;
    if (!address)
      return res.status(400).json({ error: "Address is required." });
    if (!complianceService.addSanctioned(address))
      return res.status(409).json({ error: "Address already on list." });
    res
      .status(201)
      .json({ message: "Address added to sanctioned list.", address });
  }
  static checkMixer(req: Request, res: Response) {
    const address = req.params.address;
    res.json({ address, mixer: complianceService.isMixer(address) });
  }
  static addMixer(req: Request, res: Response) {
    const { address } = req.body;
    if (!address)
      return res.status(400).json({ error: "Address is required." });
    if (!complianceService.addMixer(address))
      return res.status(409).json({ error: "Address already on list." });
    res.status(201).json({ message: "Address added to mixer list.", address });
  }
  static checkDarknet(req: Request, res: Response) {
    const address = req.params.address;
    res.json({ address, darknet: complianceService.isDarknet(address) });
  }
  static addDarknet(req: Request, res: Response) {
    const { address } = req.body;
    if (!address)
      return res.status(400).json({ error: "Address is required." });
    if (!complianceService.addDarknet(address))
      return res.status(409).json({ error: "Address already on list." });
    res
      .status(201)
      .json({ message: "Address added to darknet list.", address });
  }
}
