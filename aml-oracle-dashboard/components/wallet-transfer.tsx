"use client";
import { useState } from "react";
import { wallets } from "@/lib/utils";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Loader2 } from "lucide-react";

export default function WalletTransfer() {
  const [sender, setSender] = useState(wallets[0].label);
  const [recipient, setRecipient] = useState(wallets[1].label);
  const [amount, setAmount] = useState("");
  const [denom, setDenom] = useState("ustake");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Use the actual backend endpoint, not the Next.js API route
  const handleTransfer = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Use relative path for proxy in dev, or absolute in prod if needed
      // You may need to set NEXT_PUBLIC_ORACLE_API_URL in your .env for prod
      const backendUrl =
        process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080";
      const res = await axios.post(
        `${backendUrl}/wallet-transfer`,
        {
          senderLabel: sender,
          recipientLabel: recipient,
          amount,
          denom,
        },
        {
          // Allow CORS if needed
          headers: { "Content-Type": "application/json" },
        }
      );
      setResult(res.data);
    } catch (err: any) {
      setResult({ error: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle>Wallet to Wallet Transfer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Sender</label>
            <Select value={sender} onValueChange={setSender}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.label} value={wallet.label}>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      {wallet.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Recipient</label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter((w) => w.label !== sender)
                  .map((wallet) => (
                    <SelectItem key={wallet.label} value={wallet.label}>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        {wallet.label}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Amount</label>
            <input
              className="w-full border rounded p-2"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Denom</label>
            <input
              className="w-full border rounded p-2"
              value={denom}
              onChange={(e) => setDenom(e.target.value)}
              placeholder="ustake"
            />
          </div>
          <Button className="w-full" onClick={handleTransfer} disabled={loading || !amount}>
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />{" "}
                Transferring...
              </>
            ) : (
              "Transfer"
            )}
          </Button>
          {result && (
            <div className="mt-4 text-xs text-center">
              {result.success ? (
                <div className="    text-green-800 font-medium ">
                  <span className="font-semibold">Transfer successful!</span>
                  <br />
                  TxHash:{" "}
                  <span className="font-mono">
                    {result.tx?.transactionHash || result.tx?.hash}
                  </span>
                </div>
              ) : (
                <div className="inline-block px-4 py-2 rounded bg-red-100 text-red-700 font-medium shadow-sm">
                  Error: {result.error}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
