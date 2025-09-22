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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Activity,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  RefreshCw,
  Calendar,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { wallets } from "@/lib/utils";

import TransactionNetwork from "@/components/transaction-network";

interface Transaction {
  hash: string;
  timestamp: string;
  from?: string;
  to?: string;
  sender?: string;
  receiver?: string;
  amount: string;
  denom: string;
  type?: string;
  status?: "success" | "failed" | "pending";
}

interface ChartData {
  date: string;
  transactions: number;
  volume: number;
  fees: number;
}

interface RiskData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

// Fetch transactions from backend API
const fetchTransactionsFromApi = async (walletAddress: string) => {
  const apiUrl =
    process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080";
  const response = await axios.get(`${apiUrl}/transactions/${walletAddress}`);
  // You may need to adjust this mapping based on your backend's response format
  // Here we assume response.data is an array of transactions
  return response.data;
};

const generateChartData = (transactions: Transaction[]): ChartData[] => {
  const dataMap = new Map<string, ChartData>();

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp).toISOString().split("T")[0];
    const existing = dataMap.get(date) || {
      date,
      transactions: 0,
      volume: 0,
      fees: 0,
    };

    existing.transactions += 1;
    existing.volume += Number.parseFloat(tx.amount);
    existing.fees += Math.random() * 100; // Mock fee calculation

    dataMap.set(date, existing);
  });

  return Array.from(dataMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
};

const generateRiskData = (transactions: Transaction[]): RiskData[] => {
  const total = transactions.length;
  return [
    {
      category: "Low Risk",
      count: Math.floor(total * 0.7),
      percentage: 70,
      color: "#22c55e",
    },
    {
      category: "Medium Risk",
      count: Math.floor(total * 0.2),
      percentage: 20,
      color: "#f59e0b",
    },
    {
      category: "High Risk",
      count: Math.floor(total * 0.08),
      percentage: 8,
      color: "#ef4444",
    },
    {
      category: "Sanctioned",
      count: Math.floor(total * 0.02),
      percentage: 2,
      color: "#dc2626",
    },
  ];
};

export default function TransactionAnalytics() {
  const [selectedWallet, setSelectedWallet] = useState("Alice");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactionData();
  }, [selectedWallet]);

  const fetchTransactionData = async () => {
    setIsLoading(true);
    try {
      const selectedWalletData = wallets.find(
        (w) => w.label === selectedWallet
      );
      if (!selectedWalletData) return;

      // Fetch real transactions from backend
      const txs = await fetchTransactionsFromApi(selectedWalletData.address);

      // Support backend response as { transactions: [...] }
      const txArray = Array.isArray(txs.transactions) ? txs.transactions : [];
      setTransactions(txArray);
      setChartData(generateChartData(txArray));
      setRiskData(generateRiskData(txArray));

      toast({
        title: "Analytics Updated",
        description: `Loaded transaction data for ${selectedWallet}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transaction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      dataKey: string;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${
                entry.dataKey === "volume"
                  ? formatCurrency(entry.value)
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartConfig = {
      transactions: {
        label: "Transactions",
        color: "hsl(var(--chart-1))",
      },
      volume: {
        label: "Volume (USTAKE)",
        color: "hsl(var(--chart-2))",
      },
      fees: {
        label: "Fees",
        color: "hsl(var(--chart-3))",
      },
    };

    switch (chartType) {
      case "area":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stackId="1"
                  stroke="var(--color-transactions)"
                  fill="var(--color-transactions)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stackId="2"
                  stroke="var(--color-volume)"
                  fill="var(--color-volume)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      case "bar":
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="transactions" fill="var(--color-transactions)" />
                <Bar dataKey="volume" fill="var(--color-volume)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      default:
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="var(--color-transactions)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--color-volume)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
    }
  };

  const processTransactionsToGraphData = (transactions: Transaction[]) => {
    const nodeMap = new Map<
      string,
      { id: string; label: string; type: string; transactions: Transaction[] }
    >();
    const links: Array<{
      source: string;
      target: string;
      transactions: Transaction[];
    }> = [];

    // Create nodes for unique addresses
    transactions.forEach((tx) => {
      const sender = tx.sender || tx.from || "";
      const receiver = tx.receiver || tx.to || "";

      if (sender && !nodeMap.has(sender)) {
        nodeMap.set(sender, {
          id: sender,
          label: sender.substring(0, 8) + "...",
          type: "wallet",
          transactions: [],
        });
      }

      if (receiver && !nodeMap.has(receiver)) {
        nodeMap.set(receiver, {
          id: receiver,
          label: receiver.substring(0, 8) + "...",
          type: "wallet",
          transactions: [],
        });
      }

      // Add transaction to sender and receiver nodes
      if (sender) nodeMap.get(sender)?.transactions.push(tx);
      if (receiver) nodeMap.get(receiver)?.transactions.push(tx);
    });

    // Create links between nodes
    const linkMap = new Map<string, Transaction[]>();
    transactions.forEach((tx) => {
      const sender = tx.sender || tx.from || "";
      const receiver = tx.receiver || tx.to || "";

      if (sender && receiver) {
        const linkKey = `${sender}-${receiver}`;
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, []);
        }
        linkMap.get(linkKey)?.push(tx);
      }
    });

    linkMap.forEach((txs, linkKey) => {
      const [source, target] = linkKey.split("-");
      links.push({
        source,
        target,
        transactions: txs,
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Transaction Analytics
          </h2>
          <p className="text-muted-foreground">
            Interactive charts and transaction analysis for wallet monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger className="w-32">
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
          <Button onClick={fetchTransactionData} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest transactions for{" "}
            <span className="font-bold">{selectedWallet}s</span> wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hash</th>
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">To</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(transactions)
                  ? transactions.slice(0, 10).map((tx) => (
                      <tr key={tx.hash} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">
                          {tx.hash.substring(0, 16)}...
                        </td>
                        <td className="p-2 font-mono text-xs">
                          {tx.sender?.substring(0, 8)}...
                        </td>
                        <td className="p-2 font-mono text-xs">
                          {tx.receiver?.substring(0, 8)}...
                        </td>
                        <td className="p-2 font-medium">
                          {formatCurrency(Number.parseFloat(tx.amount))}{" "}
                          {tx.denom.toUpperCase()}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={"outline"}
                            className="text-white text-xs bg-teal-700"
                          >
                            {"success"}
                          </Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
            {Array.isArray(transactions) && transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Network Graph Visualization */}
      {Array.isArray(transactions) && transactions.length > 0 && (
        <TransactionNetwork
          data={processTransactionsToGraphData(transactions)}
          mainWallet={
            wallets.find((w) => w.label === selectedWallet)?.address || ""
          }
          contractAddress="wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d"
          transactions={transactions}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                Array.isArray(transactions)
                  ? transactions.reduce((sum, tx) => {
                      const amt = Number.parseFloat(tx.amount);
                      return sum + (isNaN(amt) ? 0 : amt);
                    }, 0)
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">USTAKE</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.length > 0
                ? (
                    (transactions.filter((tx) => tx.status === "success")
                      .length /
                      transactions.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Daily Volume
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0
                ? formatCurrency(
                    chartData.reduce((sum, day) => sum + day.volume, 0) /
                      chartData.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">USTAKE per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Transaction Volume Over Time
                </CardTitle>
                <CardDescription>
                  Daily transaction count and volume for {selectedWallet}
                </CardDescription>
              </div>
              <Select
                value={chartType}
                onValueChange={(value: "line" | "area" | "bar") =>
                  setChartType(value)
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              renderChart()
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transaction data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Risk Analysis
            </CardTitle>
            <CardDescription>Transaction risk distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {riskData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
