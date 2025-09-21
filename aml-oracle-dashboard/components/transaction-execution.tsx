"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  Wallet,
  Key,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { wallets } from "@/lib/utils";

interface SignatureResponse {
  signature: string;
  pubkey: string;
  nonce: string;
}

interface ExecutionStep {
  step: number;
  title: string;
  status: "pending" | "loading" | "success" | "error";
  description: string;
  data?: any;
}

export default function TransactionExecution() {
  const [selectedWallet, setSelectedWallet] = useState("Alice");
  const [contractAddress, setContractAddress] = useState(
    "wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d"
  );
  // senderAddress is always the address of the selected wallet
  const selectedWalletData = useMemo(
    () => wallets.find((w) => w.label === selectedWallet),
    [selectedWallet]
  );
  const senderAddress = selectedWalletData ? selectedWalletData.address : "";
  const [amount, setAmount] = useState("");
  const [nonce, setNonce] = useState("");
  const [denom, setDenom] = useState("ustake");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [signatureData, setSignatureData] = useState<SignatureResponse | null>(
    null
  );
  const { toast } = useToast();

  const initializeSteps = (): ExecutionStep[] => [
    {
      step: 1,
      title: "Get Oracle Signature",
      status: "pending",
      description: "Request signature from oracle for receive transaction",
    },
    {
      step: 2,
      title: "Execute Transaction",
      status: "pending",
      description: "Execute the contract message with oracle signature",
    },
  ];

  const updateStepStatus = (
    stepNumber: number,
    status: ExecutionStep["status"],
    data?: any
  ) => {
    setExecutionSteps((prev) =>
      prev.map((step) =>
        step.step === stepNumber ? { ...step, status, data } : step
      )
    );
  };

  const getOracleSignature = async () => {
    try {
      updateStepStatus(1, "loading");
      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080"
        }/oracle/sign-receive`,
        {
          sender: senderAddress,
          amount: amount,
          nonce: nonce,
        }
      );
      console.log(response);

      const data = response.data;
      setSignatureData(data);
      updateStepStatus(1, "success", data);
      return data;
    } catch (error) {
      updateStepStatus(1, "error");
      throw error;
    }
  };

  const executeTransaction = async (signature: SignatureResponse) => {
    try {
      updateStepStatus(2, "loading");

      const selectedWalletData = wallets.find(
        (w) => w.label === selectedWallet
      );
      if (!selectedWalletData) {
        throw new Error("Selected wallet not found");
      }

      const executeMsg = {
        receive_with_approval: {
          sender: senderAddress,
          amount: amount,
          signature: signature.signature,
          nonce: nonce,
        },
      };

      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080"
        }/execute`,
        {
          mnemonic: selectedWalletData.mnemonic,
          contract: contractAddress,
          msg: executeMsg,
          amount: amount,
          denom: denom,
        }
      );
      const data = response.data;
      updateStepStatus(2, "success", data);
      return data;
    } catch (error) {
      updateStepStatus(2, "error");
      throw error;
    }
  };

  const handleExecute = async () => {
    if (!contractAddress || !senderAddress || !amount || !nonce) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    setExecutionSteps(initializeSteps());
    setSignatureData(null);

    try {
      // Step 1: Get oracle signature
      const signature = await getOracleSignature();

      // Step 2: Execute transaction
      const result = await executeTransaction(signature);

      toast({
        title: "Transaction Executed",
        description: "Transaction completed successfully!",
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getStepIcon = (status: ExecutionStep["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
        );
    }
  };

  const generateNonce = () => {
    setNonce(Math.floor(Math.random() * 1000000).toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Transaction Execution
        </h2>
        <p className="text-muted-foreground">
          Execute oracle transactions with two-step signature verification
          process
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Transaction Details
            </CardTitle>
            <CardDescription>
              Configure transaction parameters for oracle execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-select">Executing Wallet</Label>
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.label} value={wallet.label}>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        <span>{wallet.label}</span>
                        {wallet.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selected:{" "}
                {wallets
                  .find((w) => w.label === selectedWallet)
                  ?.address.slice(0, 30)}
                ...
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-address">Contract Address *</Label>
              <Input
                id="contract-address"
                placeholder="wasm1contractaddress..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-address">Sender Address *</Label>
              <Input
                id="sender-address"
                placeholder="wasm1senderaddress..."
                value={senderAddress}
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="denom">Denomination</Label>
                <Input
                  id="denom"
                  value={denom}
                  onChange={(e) => setDenom(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nonce">Nonce *</Label>
              <div className="flex gap-2">
                <Input
                  id="nonce"
                  placeholder="12345"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                />
                <Button variant="outline" onClick={generateNonce} type="button">
                  Generate
                </Button>
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleExecute}
              disabled={
                isExecuting ||
                !contractAddress ||
                !senderAddress ||
                !amount ||
                !nonce
              }
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Transaction
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Execution Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Execution Progress
            </CardTitle>
            <CardDescription>
              Two-step oracle transaction execution process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {executionSteps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click "Execute Transaction" to begin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {executionSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          Step {step.step}: {step.title}
                        </span>
                        <Badge
                          variant={
                            step.status === "success"
                              ? "default"
                              : step.status === "error"
                              ? "destructive"
                              : step.status === "loading"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      {step.data && (
                        <div className="bg-muted p-2 rounded text-xs font-mono">
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signature Data Display */}
      {signatureData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Oracle Signature Data
            </CardTitle>
            <CardDescription>
              Generated signature for transaction execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Signature
                </Label>
                <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                  {signatureData.signature}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Public Key
                </Label>
                <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                  {signatureData.pubkey}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Nonce
                </Label>
                <div className="bg-muted p-3 rounded font-mono text-xs">
                  {signatureData.nonce}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
