"use client";

import { useState, useEffect } from "react";
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

interface Transaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  denom: string;
  type: string;
  status: "success" | "failed" | "pending";
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

// Mock data for demonstration
const generateMockTransactions = (walletAddress: string): Transaction[] => {
  const mockTxs: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    mockTxs.push({
      hash: `tx_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: date.toISOString(),
      from:
        i % 3 === 0
          ? walletAddress
          : `wasm1${Math.random().toString(36).substr(2, 39)}`,
      to:
        i % 3 === 0
          ? `wasm1${Math.random().toString(36).substr(2, 39)}`
          : walletAddress,
      amount: (Math.random() * 10000).toFixed(0),
      denom: "ustake",
      type: ["send", "receive", "delegate", "undelegate"][
        Math.floor(Math.random() * 4)
      ],
      status: Math.random() > 0.1 ? "success" : "failed",
    });
  }

  return mockTxs;
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

      // In a real implementation, this would call the API
      // const response = await fetch(`/api/transactions/${selectedWalletData.address}`)
      // const data = await response.json()

      // For now, using mock data
      const mockTransactions = generateMockTransactions(
        selectedWalletData.address
      );
      setTransactions(mockTransactions);
      setChartData(generateChartData(mockTransactions));
      setRiskData(generateRiskData(mockTransactions));

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
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
                transactions.reduce(
                  (sum, tx) => sum + Number.parseFloat(tx.amount),
                  0
                )
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

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Latest transactions for {selectedWallet} wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hash</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.hash} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-xs">
                      {tx.hash.slice(0, 12)}...
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">
                      {formatCurrency(Number.parseFloat(tx.amount))}{" "}
                      {tx.denom.toUpperCase()}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          tx.status === "success" ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
