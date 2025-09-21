"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  RefreshCw,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { wallets } from "@/lib/utils";

interface Balance {
  denom: string;
  amount: string;
}

interface BalanceData {
  address: string;
  balances: Balance[];
  lastUpdated: string;
  isLoading: boolean;
  error?: string;
}

export default function BalanceMonitoring() {
  const [contractAddress, setContractAddress] = useState(
    "wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d"
  );
  const [selectedWallet, setSelectedWallet] = useState("Alice");
  const [contractBalance, setContractBalance] = useState<BalanceData>({
    address: "",
    balances: [],
    lastUpdated: "",
    isLoading: false,
  });
  const [walletBalances, setWalletBalances] = useState<
    Map<string, BalanceData>
  >(new Map());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (contractAddress) {
        fetchContractBalance(contractAddress, false);
      }
      fetchAllWalletBalances(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [contractAddress, autoRefresh]);

  const fetchContractBalance = async (address: string, showToast = true) => {
    if (!address.trim()) return;

    setContractBalance((prev) => ({
      ...prev,
      isLoading: true,
      error: undefined,
    }));

    try {
      // Use backend endpoint as defined in app.ts: /contract-balance?address=...
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080"
        }/contract-balance`,
        { params: { address } }
      );
      const data = response.data;

      setContractBalance({
        address: data.address,
        balances: data.balances || [],
        lastUpdated: new Date().toISOString(),
        isLoading: false,
      });

      if (showToast) {
        toast({
          title: "Contract Balance Updated",
          description: `Fetched balance for ${address.slice(0, 20)}...`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error &&
              (error as any).response &&
              (error as any).response.data &&
              (error as any).response.data.error) ||
            "Unknown error";
      setContractBalance((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      if (showToast) {
        toast({
          title: "Error",
          description: `Failed to fetch contract balance: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  const fetchWalletBalance = async (address: string, showToast = true) => {
    setWalletBalances((prev) => {
      const updated = new Map(prev);
      const current = updated.get(address) || {
        address,
        balances: [],
        lastUpdated: "",
        isLoading: false,
      };
      updated.set(address, { ...current, isLoading: true, error: undefined });
      return updated;
    });

    try {
      // Use backend endpoint as defined in app.ts: /wallet-balance?address=...
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080"
        }/wallet-balance`,
        { params: { address } }
      );
      const data = response.data;

      setWalletBalances((prev) => {
        const updated = new Map(prev);
        updated.set(address, {
          address: data.address,
          balances: data.balances || [],
          lastUpdated: new Date().toISOString(),
          isLoading: false,
        });
        return updated;
      });

      if (showToast) {
        toast({
          title: "Wallet Balance Updated",
          description: `Fetched balance for ${address.slice(0, 20)}...`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error &&
              (error as any).response &&
              (error as any).response.data &&
              (error as any).response.data.error) ||
            "Unknown error";
      setWalletBalances((prev) => {
        const updated = new Map(prev);
        const current = updated.get(address) || {
          address,
          balances: [],
          lastUpdated: "",
          isLoading: false,
        };
        updated.set(address, {
          ...current,
          isLoading: false,
          error: errorMessage,
        });
        return updated;
      });

      if (showToast) {
        toast({
          title: "Error",
          description: `Failed to fetch wallet balance: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
  };

  const fetchAllWalletBalances = async (showToast = true) => {
    for (const wallet of wallets) {
      await fetchWalletBalance(wallet.address, false);
    }

    if (showToast) {
      toast({
        title: "All Balances Updated",
        description: "Refreshed balances for all wallets",
      });
    }
  };

  const formatBalance = (balance: Balance) => {
    const amount = Number.parseFloat(balance.amount);
    if (amount === 0) return "0";
    if (amount < 1000) return amount.toString();
    if (amount < 1000000) return `${(amount / 1000).toFixed(2)}K`;
    return `${(amount / 1000000).toFixed(2)}M`;
  };

  const getTotalBalance = (balances: Balance[]) => {
    return balances.reduce((total, balance) => {
      if (balance.denom === "ustake") {
        return total + Number.parseFloat(balance.amount);
      }
      return total;
    }, 0);
  };

  const BalanceCard = ({
    title,
    data,
    icon: Icon,
    onRefresh,
  }: {
    title: string;
    data: BalanceData;
    icon: any;
    onRefresh: () => void;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={data.isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 ${data.isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {data.error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{data.error}</span>
          </div>
        ) : data.balances.length === 0 && !data.isLoading ? (
          <div className="text-muted-foreground text-sm">No balance data</div>
        ) : (
          <div className="space-y-2">
            {data.balances.map((balance, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase">
                  {balance.denom}
                </span>
                <span className="font-medium">{formatBalance(balance)}</span>
              </div>
            ))}
            {data.balances.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Total (USTAKE)</span>
                  <span>
                    {formatBalance({
                      denom: "ustake",
                      amount: getTotalBalance(data.balances).toString(),
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        {data.lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Balance Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time contract and wallet balance tracking with auto-refresh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh:</span>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "ON" : "OFF"}
            </Button>
          </div>
          <Button
            onClick={() => fetchAllWalletBalances()}
            disabled={
              walletBalances.size > 0 &&
              Array.from(walletBalances.values()).some((b) => b.isLoading)
            }
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Contract Balance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Contract Balance
          </CardTitle>
          <CardDescription>
            Monitor specific contract balance in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter contract address..."
                value={contractAddress}
                defaultValue={
                  "wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d"
                }
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                onKeyDown={(e) =>
                  e.key === "Enter" && fetchContractBalance(contractAddress)
                }
              />
            </div>
            <Button
              onClick={() => fetchContractBalance(contractAddress)}
              disabled={!contractAddress.trim() || contractBalance.isLoading}
            >
              {contractBalance.isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Fetch"
              )}
            </Button>
          </div>

          {contractAddress && (
            <BalanceCard
              title={`Contract: ${contractAddress.slice(0, 20)}...`}
              data={contractBalance}
              icon={DollarSign}
              onRefresh={() => fetchContractBalance(contractAddress)}
            />
          )}
        </CardContent>
      </Card>

      {/* Wallet Balances Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Wallet Balances</h3>
          <Badge variant="outline" className="text-xs">
            Auto-refresh: {autoRefresh ? "Every 3s" : "Disabled"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => {
            const balanceData = walletBalances.get(wallet.address) || {
              address: wallet.address,
              balances: [],
              lastUpdated: "",
              isLoading: false,
            };

            return (
              <BalanceCard
                key={wallet.address}
                title={`${wallet.label} Wallet`}
                data={balanceData}
                icon={Wallet}
                onRefresh={() => fetchWalletBalance(wallet.address)}
              />
            );
          })}
        </div>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Balance Summary
          </CardTitle>
          <CardDescription>
            Aggregated balance statistics across all monitored wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {wallets.length}
              </div>
              <p className="text-sm text-muted-foreground">Monitored Wallets</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {Array.from(walletBalances.values())
                  .reduce(
                    (total, data) => total + getTotalBalance(data.balances),
                    0
                  )
                  .toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total USTAKE</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {contractBalance.balances.length > 0
                  ? getTotalBalance(contractBalance.balances).toLocaleString()
                  : "--"}
              </div>
              <p className="text-sm text-muted-foreground">Contract USTAKE</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
