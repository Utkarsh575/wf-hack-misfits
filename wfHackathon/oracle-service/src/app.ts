import cors from "cors";
/**
 * @swagger
 * /execute:
 *   post:
 *     summary: Execute a contract message (dev only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mnemonic:
 *                 type: string
 *               contract:
 *                 type: string
 *               msg:
 *                 type: object
 *               amount:
 *                 type: string
 *               denom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tx:
 *                   type: object
 *                 error:
 *                   type: string
 */
/**
 * @swagger
 * /contract-balance:
 *   get:
 *     summary: Get contract's bank balance
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract address
 *     responses:
 *       200:
 *         description: Contract balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                 balances:
 *                   type: array
 *                   items:
 *                     type: object
 */
/**
 * @swagger
 * /wallet-balance:
 *   get:
 *     summary: Get wallet's bank balance
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet address
 *     responses:
 *       200:
 *         description: Wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                 balances:
 *                   type: array
 *                   items:
 *                     type: object
 */
/**
 * @swagger
 * /sanctions/all:
 *   get:
 *     summary: Get all sanctioned addresses
 *     responses:
 *       200:
 *         description: List of sanctioned addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sanctioned:
 *                   type: array
 *                   items:
 *                     type: string
 */
/**
 * @swagger
 * /mixers/all:
 *   get:
 *     summary: Get all mixer addresses
 *     responses:
 *       200:
 *         description: List of mixer addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mixers:
 *                   type: array
 *                   items:
 *                     type: string
 */
/**
 * @swagger
 * /darknet/all:
 *   get:
 *     summary: Get all darknet addresses
 *     responses:
 *       200:
 *         description: List of darknet addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 darknet:
 *                   type: array
 *                   items:
 *                     type: string
 */
import { setupSwaggerDocs } from "./swagger";
/**
 * @swagger
 * /oracle/sign-receive:
 *   post:
 *     summary: Get a signature for a receive transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *               amount:
 *                 type: string
 *               nonce:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signature and pubkey
 */
/**
 * @swagger
 * /transactions/{address}:
 *   get:
 *     summary: Get transactions for a wallet address
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet address
 *     responses:
 *       200:
 *         description: List of transactions
 */
/**
 * @swagger
 * /sanctions/check/{address}:
 *   get:
 *     summary: Check if an address is sanctioned
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sanction status
 */
/**
 * @swagger
 * /sanctions/add:
 *   post:
 *     summary: Add an address to the sanctions list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added
 */
/**
 * @swagger
 * /mixers/check/{address}:
 *   get:
 *     summary: Check if an address is a mixer
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mixer status
 */
/**
 * @swagger
 * /mixers/add:
 *   post:
 *     summary: Add an address to the mixer list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added
 */
/**
 * @swagger
 * /darknet/check/{address}:
 *   get:
 *     summary: Check if an address is a darknet wallet
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Darknet status
 */
/**
 * @swagger
 * /darknet/add:
 *   post:
 *     summary: Add an address to the darknet list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address added
 */
import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import errorHandler from "./errorMiddleware";
import { OracleController } from "./controllers/OracleController";
import { ComplianceController } from "./controllers/ComplianceController";
import axios from "axios";
import { TxController } from "./controllers/TxController";
import { BalanceController } from "./controllers/BalanceController";
import { WalletTransferController } from "./controllers/WalletTransferController";
// Wallet-to-wallet transfer endpoint
// ...existing code...

// All business logic is now in services, and all route handling in controllers.
dotenv.config();
const CONFIG = {
  MNEMONIC:
    process.env.MNEMONIC ||
    "leopard run palm busy weasel comfort maze turkey canyon rural response predict ball scale coil tape organ dizzy paddle mystery fluid flight capital thing",
  CONTRACT_ADDR:
    process.env.CONTRACT_ADDR ||
    "wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d",
};

const app = express();
// Register body parsers and CORS before all routes
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(errorHandler);
setupSwaggerDocs(app);

// Wallet-to-wallet transfer endpoint (must be after app is declared and after body parsers)
app.post("/wallet-transfer", WalletTransferController.transfer);
const port = process.env.PORT;

// Oracle endpoints
// Modular: compliance check is handled in OracleController
app.post("/oracle/sign-receive", (req, res) =>
  OracleController.signReceive(req, res, CONFIG)
);
app.post("/execute", (req, res) =>
  OracleController.executeContract(req, res, "http://localhost:26657")
);

// Compliance endpoints
app.get("/sanctions/check/:address", ComplianceController.checkSanctioned);
app.post("/sanctions/add", ComplianceController.addSanctioned);
app.get("/sanctions/all", ComplianceController.getAllSanctioned);
app.get("/mixers/check/:address", ComplianceController.checkMixer);
app.post("/mixers/add", ComplianceController.addMixer);
app.get("/mixers/all", ComplianceController.getAllMixers);
app.get("/darknet/check/:address", ComplianceController.checkDarknet);
app.post("/darknet/add", ComplianceController.addDarknet);
app.get("/darknet/all", ComplianceController.getAllDarknet);

// Transaction endpoint
app.get("/transactions/:address", TxController.getTransactions);

// Contract balance endpoint
app.get("/contract-balance", BalanceController.getContractBalance);

// Wallet balance endpoint
app.get("/wallet-balance", BalanceController.getWalletBalance);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
