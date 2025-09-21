"use client";

import { useState } from "react";
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
                <h1 className="text-xl font-bold text-white">AML Oracle</h1>
                <p className="text-sm text-yellow-100">
                  Blockchain Compliance Detection
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
              <Button
                variant="outline"
                size="sm"
                className="text-white hover:bg-yellow-400 hover:text-red-600 bg-transparent border-[rgba(252,199,-68,0)]"
              >
                <Settings className="w-4 h-4 mr-2" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-settings w-4 h-4 mr-2"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </Button>
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
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sanctioned Addresses
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Active sanctions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mixer Addresses
                  </CardTitle>
                  <Shield className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Known mixers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Darknet Addresses
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Darknet wallets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Oracle Balance
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
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

          <TabsContent value="analytics">
            <TransactionAnalytics />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
