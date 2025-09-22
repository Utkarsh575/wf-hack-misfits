"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";
import TransactionNetwork, {
  TransactionNetworkData,
} from "@/components/transaction-network";

const CONTRACT_ADDR =
  "wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d";

export default function VisualizePage() {
  const { address } = useParams();
  const [graphData, setGraphData] = useState<TransactionNetworkData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080";
        const res = await axios.get(`${apiUrl}/transactions/${address}`);
        const txs = Array.isArray(res.data.transactions)
          ? res.data.transactions
          : [];
        // Build nodes and links for the entire transaction table as a network
        const nodes: any[] = [];
        const links: any[] = [];
        const nodeSet = new Set();
        txs.forEach((tx: any) => {
          if (!nodeSet.has(tx.from)) {
            nodes.push({
              id: tx.from,
              color: tx.from === CONTRACT_ADDR ? "#22c55e" : "#64748b",
              size: tx.from === address ? 800 : 400,
            });
            nodeSet.add(tx.from);
          }
          if (!nodeSet.has(tx.to)) {
            nodes.push({
              id: tx.to,
              color: tx.to === CONTRACT_ADDR ? "#22c55e" : "#64748b",
              size: tx.to === address ? 800 : 400,
            });
            nodeSet.add(tx.to);
          }
          links.push({
            source: tx.from,
            target: tx.to,
            color:
              (tx.from === address && tx.to === CONTRACT_ADDR) ||
              (tx.to === address && tx.from === CONTRACT_ADDR)
                ? "#22c55e"
                : "#64748b",
            label: `Hash: ${tx.hash}\nAmount: ${tx.amount} ${
              tx.denom
            }\nDate: ${new Date(tx.timestamp).toLocaleString()}`,
          });
        });
        setGraphData({ nodes, links });
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }
    if (address) fetchData();
  }, [address]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Transaction Graph Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <span className="text-muted-foreground">Loading graph...</span>
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-10">{error}</div>
          ) : graphData ? (
            <div className="h-[600px] w-full rounded-lg border bg-white">
              <TransactionNetwork
                data={graphData}
                mainWallet={address as string}
                contractAddress={CONTRACT_ADDR}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
