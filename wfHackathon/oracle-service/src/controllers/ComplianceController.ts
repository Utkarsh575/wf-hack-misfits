import { Request, Response } from "express";
import { ComplianceService } from "../services/ComplianceService";

const complianceService = new ComplianceService();

export class ComplianceController {
  static getAllSanctioned(req: Request, res: Response) {
    res.json({ sanctioned: complianceService.sanctionedWallets });
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
