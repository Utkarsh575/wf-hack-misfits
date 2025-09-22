"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  Activity,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";
import AddressManagement from "@/components/address-management";
import TransactionExecution from "@/components/transaction-execution";
import BalanceMonitoring from "@/components/balance-monitoring";
import TransactionAnalytics from "@/components/transaction-analytics";
import WalletTransfer from "@/components/wallet-transfer";

const wallets = [
  {
    label: "Alice",
    address: "wasm18thxpksjlupr6szqctcjvj0mmhkr0suj5t3xnj",
    mnemonic:
      "pony swap next infant awkward sheriff first ridge light away net shadow ankle meat copy various spell timber aerobic name atom excuse just gossip",
    isDefault: true,
  },
  {
    label: "Bob",
    address: "wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz",
    mnemonic:
      "mesh admit blade produce equip humor cluster chair arch loud like grant extend believe avocado hover dream market resist tobacco mass copper tide inherit",
    isDefault: false,
  },
  {
    label: "Charlie",
    address: "wasm1ga4d4tsxrk6na6ehttwvdfmn2ejy4gwfxpt2m7",
    mnemonic:
      "artist still shield fit embark same follow lounge model dumb valid half snake deposit divorce develop color glory liberty elder flight silly swing audit",
    isDefault: false,
  },
  {
    label: "Admin",
    address: "wasm1sse6pdmn5s7epjycxadjzku4qfgs604cgur6me",
    mnemonic:
      "enemy flower party waste put south clip march victory breeze oxygen cram hospital march enlist black october surprise across wage bomb spawn describe heavy",
    isDefault: false,
  },
  {
    label: "Oracle",
    address: "wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5",
    mnemonic:
      "leopard run palm busy weasel comfort maze turkey canyon rural response predict ball scale coil tape organ dizzy paddle mystery fluid flight capital thing",
    isDefault: false,
  },
];

export default function AMLOracleDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  // Overview state
  const [sanctioned, setSanctioned] = useState(0);
  const [mixers, setMixers] = useState(0);
  const [darknet, setDarknet] = useState(0);
  const [oracleBalance, setOracleBalance] = useState(0);
  const [loadingOverview, setLoadingOverview] = useState(true);
  // Animated counters
  const [displaySanctioned, setDisplaySanctioned] = useState(0);
  const [displayMixers, setDisplayMixers] = useState(0);
  const [displayDarknet, setDisplayDarknet] = useState(0);
  const [displayOracleBalance, setDisplayOracleBalance] = useState(0);

  // Fetch all overview data on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchOverview() {
      setLoadingOverview(true);
      try {
        const api =
          process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8080";
        const [sanctionsRes, mixersRes, darknetRes, oracleBalRes] =
          await Promise.all([
            axios.get(`${api}/sanctions/all`),
            axios.get(`${api}/mixers/all`),
            axios.get(`${api}/darknet/all`),
            axios.get(`${api}/wallet-balance`, {
              params: {
                address: wallets.find((w) => w.label === "Oracle")?.address,
              },
            }),
          ]);
        if (cancelled) return;
        setSanctioned(sanctionsRes.data.sanctioned?.length || 0);
        setMixers(mixersRes.data.mixers?.length || 0);
        setDarknet(darknetRes.data.darknet?.length || 0);
        // Oracle balance: sum all ustake
        const balances = oracleBalRes.data.balances || [];
        const ustake = balances.find((b: any) => b.denom === "ustake");
        setOracleBalance(ustake ? Number(ustake.amount) : 0);
      } catch (e) {
        setSanctioned(0);
        setMixers(0);
        setDarknet(0);
        setOracleBalance(0);
      } finally {
        setLoadingOverview(false);
      }
    }
    fetchOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  // Animate counters
  useEffect(() => {
    if (!loadingOverview) {
      let frame = 0;
      const duration = 600; // ms
      const steps = 30;
      const interval = duration / steps;
      const animate = (target: number, setter: (v: number) => void) => {
        let current = 0;
        const increment = target / steps;
        const id = setInterval(() => {
          current += increment;
          if (current >= target) {
            setter(target);
            clearInterval(id);
          } else {
            setter(Math.floor(current));
          }
        }, interval);
      };
      animate(sanctioned, setDisplaySanctioned);
      animate(mixers, setDisplayMixers);
      animate(darknet, setDisplayDarknet);
      animate(oracleBalance, setDisplayOracleBalance);
    }
  }, [loadingOverview, sanctioned, mixers, darknet, oracleBalance]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-red-600 border-b-4 border-yellow-400">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CUSTODIAL GUARDIAN</h1>
                <p className="text-sm text-yellow-100">
                  Non Custodial Wallet Compliance Manager
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-xs border-yellow-400 text-white bg-secondary-foreground"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                Oracle Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="execute" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Execute
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Balances
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Transfer
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sanctioned Addresses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sanctioned Addresses
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold min-h-[2.5rem] flex items-center justify-center">
                    {loadingOverview ? (
                      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                    ) : (
                      displaySanctioned
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active sanctions
                  </p>
                </CardContent>
              </Card>
              {/* Mixer Addresses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mixer Addresses
                  </CardTitle>
                  <Shield className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold min-h-[2.5rem] flex items-center justify-center">
                    {loadingOverview ? (
                      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                    ) : (
                      displayMixers
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Known mixers</p>
                </CardContent>
              </Card>
              {/* Darknet Addresses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Darknet Addresses
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold min-h-[2.5rem] flex items-center justify-center">
                    {loadingOverview ? (
                      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                    ) : (
                      displayDarknet
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Darknet wallets
                  </p>
                </CardContent>
              </Card>
              {/* Oracle Balance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Oracle Balance
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold min-h-[2.5rem] flex items-center justify-center">
                    {loadingOverview ? (
                      <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                    ) : oracleBalance === 0 ? (
                      "--"
                    ) : (
                      displayOracleBalance.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">USTAKE</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Wallets</CardTitle>
                  <CardDescription>
                    Configured wallets for transaction execution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.label}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{wallet.label}</span>
                            {wallet.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {wallet.address.slice(0, 20)}...
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ready
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest oracle operations and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <AddressManagement />
          </TabsContent>

          <TabsContent value="execute">
            <TransactionExecution />
          </TabsContent>

          <TabsContent value="balances">
            <BalanceMonitoring />
          </TabsContent>

          <TabsContent value="transfer">
            <WalletTransfer />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
