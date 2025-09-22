"use client";

import { useState, useMemo, useEffect } from "react";
import type React from "react";
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
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  Wallet,
  Key,
  Shield,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function parseMaybeJson(str: string) {
  try {
    if (str.trim().startsWith("{") && str.includes(":")) {
      const jsonStr = str.replace(/'/g, '"');
      return JSON.parse(jsonStr);
    }
  } catch {
    // Not JSON
  }
  return str;
}

interface ComplianceFailureProps {
  result: any;
}

const ComplianceFailure: React.FC<ComplianceFailureProps> = ({ result }) => {
  if (!result || result.success !== false) return null;

  const getLatestFailedCheck = () => {
    if (!result.failedChecks || !Array.isArray(result.failedChecks))
      return null;

    // Find the last object-type failed check (not string)
    for (let i = result.failedChecks.length - 1; i >= 0; i--) {
      const check = result.failedChecks[i];
      const parsed = typeof check === "string" ? parseMaybeJson(check) : check;
      if (typeof parsed === "object" && parsed !== null) {
        return parsed;
      }
    }
    return null;
  };

  const latestFailedCheck = getLatestFailedCheck();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-red-500" />
        <span className="font-bold text-red-700 text-xl">
          Transaction Blocked: AML Compliance Failure
        </span>
      </div>

      <div className="mb-4 p-4 bg-red-100 rounded-lg border border-red-300">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-red-800 text-lg">
            Wallet Failed AML Check
          </span>
        </div>
        <p className="text-red-800">
          The wallet did not pass the Anti-Money Laundering (AML) verification
          process. This transaction has been blocked for security and compliance
          reasons.
        </p>
      </div>

      {/* Risk Score Display */}
      {typeof result.riskScore !== "undefined" && (
        <div className="mb-4 p-3 bg-red-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-red-800">Risk Score:</span>
            <Badge
              variant="destructive"
              className="text-lg font-bold px-3 py-1"
            >
              {result.riskScore}/10
            </Badge>
          </div>
          <p className="text-sm text-red-700 mt-1">
            High risk score indicates potential money laundering activities
          </p>
        </div>
      )}

      {/* Main Error Message */}
      {result.error && (
        <div className="mb-4 p-3 bg-red-100 rounded-lg">
          <span className="font-semibold text-red-800">Error Details:</span>
          <p className="text-red-800 mt-1">{result.error}</p>
        </div>
      )}

      {latestFailedCheck && (
        <div className="mb-4">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Latest Compliance Issue
          </h4>
          <div className="bg-red-100 rounded-lg p-4 border border-red-300">
            {latestFailedCheck.type && (
              <div className="mb-2">
                <Badge variant="destructive" className="mb-2">
                  {latestFailedCheck.type.toUpperCase()}
                </Badge>
              </div>
            )}

            {latestFailedCheck.wallet && (
              <div className="mb-2">
                <span className="font-semibold text-red-800">
                  Flagged Wallet:
                </span>
                <div className="font-mono text-sm bg-red-200 p-2 rounded mt-1 break-all">
                  {latestFailedCheck.wallet}
                </div>
              </div>
            )}

            {latestFailedCheck.hop && (
              <div className="mb-2">
                <span className="font-semibold text-red-800">
                  Transaction Hop:
                </span>
                <span className="ml-2 text-red-700">
                  {latestFailedCheck.hop}
                </span>
              </div>
            )}

            {latestFailedCheck.message && (
              <div className="mb-3">
                <span className="font-semibold text-red-800">
                  Issue Description:
                </span>
                <p className="text-red-800 mt-1">{latestFailedCheck.message}</p>
              </div>
            )}

            {latestFailedCheck.transactions &&
              Array.isArray(latestFailedCheck.transactions) &&
              latestFailedCheck.transactions.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-red-800 mb-2 block">
                    Flagged Transactions (
                    {latestFailedCheck.transactions.length}):
                  </span>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {latestFailedCheck.transactions.map(
                      (tx: any, i: number) => (
                        <div key={i} className="bg-red-200 rounded p-3 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {tx.hash && (
                              <div>
                                <span className="font-semibold text-red-900">
                                  Hash:
                                </span>
                                <div className="font-mono text-xs break-all text-red-800 mt-1">
                                  {tx.hash}
                                </div>
                              </div>
                            )}
                            {tx.timestamp && (
                              <div>
                                <span className="font-semibold text-red-900">
                                  Time:
                                </span>
                                <div className="text-red-800 mt-1">
                                  {new Date(tx.timestamp).toLocaleString()}
                                </div>
                              </div>
                            )}
                            {tx.sender && (
                              <div>
                                <span className="font-semibold text-red-900">
                                  From:
                                </span>
                                <div className="font-mono text-xs break-all text-red-800 mt-1">
                                  {tx.sender}
                                </div>
                              </div>
                            )}
                            {tx.receiver && (
                              <div>
                                <span className="font-semibold text-red-900">
                                  To:
                                </span>
                                <div className="font-mono text-xs break-all text-red-800 mt-1">
                                  {tx.receiver}
                                </div>
                              </div>
                            )}
                            {tx.amount && (
                              <div className="md:col-span-2">
                                <span className="font-semibold text-red-900">
                                  Amount:
                                </span>
                                <span className="ml-2 text-red-800 font-mono">
                                  {tx.amount} {tx.denom || ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-red-800 mb-2">
          All Compliance Checks:
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {result.failedChecks?.map((check: any, idx: number) => {
            const parsed =
              typeof check === "string" ? parseMaybeJson(check) : check;
            if (typeof parsed === "string") {
              return (
                <div
                  key={idx}
                  className="bg-red-100 rounded p-2 text-sm text-red-900 border border-red-200"
                >
                  {parsed}
                </div>
              );
            }
            return (
              <div
                key={idx}
                className="bg-red-100 rounded p-2 text-sm text-red-900 border border-red-200"
              >
                <div className="font-semibold">
                  Check #{idx + 1}: {parsed.type || "Compliance Issue"}
                </div>
                {parsed.message && (
                  <div className="mt-1 text-xs">{parsed.message}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
  const [complianceFailure, setComplianceFailure] = useState<any>(null);
  const { toast } = useToast();

  // Clear compliance failure when any input changes
  useEffect(() => {
    setComplianceFailure(null);
  }, [selectedWallet, contractAddress, amount, nonce, denom]);

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
      const data = response.data;
      console.log(data);
      if (data && data.success === false) {
        setComplianceFailure(data);
        updateStepStatus(1, "error", data);
        throw new Error(data.error || "Compliance check failed");
      }
      setSignatureData(data);
      updateStepStatus(1, "success", data);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const { status, data: errData } = error.response;

          // Handle compliance errors for specific HTTP status codes
          if (
            status === 403 ||
            status === 500 ||
            (errData && errData.success === false)
          ) {
            setComplianceFailure(
              errData || {
                success: false,
                error: `HTTP ${status}: ${error.response.statusText}`,
                failedChecks: [
                  `Server returned ${status} status code indicating a compliance or server error.`,
                ],
              }
            );
            updateStepStatus(1, "error", {
              error:
                errData?.error || `Compliance check failed (HTTP ${status})`,
            });
            throw new Error(
              errData?.error || `Compliance check failed (HTTP ${status})`
            );
          }

          // Handle other HTTP errors
          setComplianceFailure(errData);
          updateStepStatus(1, "error", {
            error: errData?.error || "Request failed",
          });
          throw new Error(errData?.error || "Request failed");
        } else if (error.request) {
          // Network error
          updateStepStatus(1, "error", { error: "Network error" });
          throw new Error("Network error - unable to reach server");
        }
      }
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

      if (data && data.success === false) {
        setComplianceFailure(data);
        updateStepStatus(2, "error", data);
        throw new Error(
          data.error || "Transaction execution failed due to compliance issues"
        );
      }

      updateStepStatus(2, "success", data);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        const errData = error.response.data;
        if (errData.success === false) {
          setComplianceFailure(errData);
        }
        updateStepStatus(2, "error", errData);
        throw new Error(errData.error || "Transaction execution failed");
      }
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
    // Do not clear complianceFailure here; clear it only when user changes input

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
      // If complianceFailure is set, don't show generic error toast
      if (!complianceFailure) {
        toast({
          title: "Execution Failed",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      }
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

      {complianceFailure && <ComplianceFailure result={complianceFailure} />}

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
