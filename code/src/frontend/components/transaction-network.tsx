"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Wallet, Building2, Users } from "lucide-react";

const WalletNode = ({ data }: { data: any }) => {
  const { label, type, transactions, color, isSelected, onClick } = data;

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
        isSelected ? "ring-2 ring-blue-400 ring-offset-2" : ""
      }`}
      style={{
        backgroundColor: color,
        borderColor: isSelected ? "#3b82f6" : "rgba(255,255,255,0.8)",
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {type === "main" && <Wallet className="w-4 h-4 text-white" />}
        {type === "contract" && <Building2 className="w-4 h-4 text-white" />}
        {type === "external" && <Users className="w-4 h-4 text-white" />}
        <div className="text-white font-medium text-sm">{label}</div>
      </div>
      <div className="text-white/80 text-xs mt-1">
        {transactions} transaction{transactions !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

const TransactionEdge = ({ data }: { data: any }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border text-xs font-medium">
      {data.label}
    </div>
  );
};

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

interface TransactionNetworkProps {
  data: {
    nodes: any[];
    links: any[];
  };
  mainWallet: string;
  contractAddress: string;
  transactions: Transaction[];
}

const nodeTypes: NodeTypes = {
  wallet: WalletNode,
};

const edgeTypes: EdgeTypes = {
  transaction: TransactionEdge,
};

export default function TransactionNetwork({
  data,
  mainWallet,
  contractAddress,
  transactions,
}: TransactionNetworkProps) {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredEdge, setHoveredEdge] = useState<any>(null);

  const processReactFlowData = useCallback(() => {
    const nodeMap = new Map<string, any>();
    const edgeMap = new Map<string, any>();

    // Group transactions by sender-receiver pairs
    const transactionGroups = new Map<string, Transaction[]>();

    transactions.forEach((tx) => {
      const sender = tx.sender || tx.from || "";
      const receiver = tx.receiver || tx.to || "";

      if (sender && receiver) {
        const key = `${sender}-${receiver}`;
        if (!transactionGroups.has(key)) {
          transactionGroups.set(key, []);
        }
        transactionGroups.get(key)!.push(tx);
      }
    });

    // Create nodes with vibrant colors
    const allAddresses = new Set<string>();
    transactions.forEach((tx) => {
      const sender = tx.sender || tx.from;
      const receiver = tx.receiver || tx.to;
      if (sender) allAddresses.add(sender);
      if (receiver) allAddresses.add(receiver);
    });

    const vibrantColors = [
      "#6366f1", // Indigo
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#f97316", // Orange
      "#10b981", // Emerald
      "#3b82f6", // Blue
    ];

    let colorIndex = 0;
    let nodeIndex = 0;

    allAddresses.forEach((address) => {
      const isMain = address === mainWallet;
      const isContract = address === contractAddress;
      const txCount = transactions.filter(
        (tx) =>
          (tx.sender || tx.from) === address ||
          (tx.receiver || tx.to) === address
      ).length;

      let nodeColor: string;
      let nodeType: string;
      let nodeLabel: string;

      if (isContract) {
        nodeColor = "#22c55e"; // Bright green for contract
        nodeType = "contract";
        nodeLabel = "Smart Contract";
      } else if (isMain) {
        nodeColor = "#3b82f6"; // Bright blue for main wallet
        nodeType = "main";
        nodeLabel = "Main Wallet";
      } else {
        nodeColor = vibrantColors[colorIndex % vibrantColors.length];
        nodeType = "external";
        nodeLabel = `${address.substring(0, 8)}...${address.substring(
          address.length - 6
        )}`;
        colorIndex++;
      }

      // Position nodes in a circular layout
      const angle = (nodeIndex / allAddresses.size) * 2 * Math.PI;
      const radius = 300;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      nodeMap.set(address, {
        id: address,
        type: "wallet",
        position: { x, y },
        data: {
          label: nodeLabel,
          type: nodeType,
          transactions: txCount,
          color: nodeColor,
          address: address,
          isSelected: selectedNode?.id === address,
          onClick: () =>
            setSelectedNode({
              id: address,
              address,
              type: nodeType,
              transactions: txCount,
            }),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      nodeIndex++;
    });

    // Create edges for transactions
    transactionGroups.forEach((txs, key) => {
      const [sender, receiver] = key.split("-");
      const edgeId = `${sender}-${receiver}`;

      let edgeLabel: string;
      let edgeColor: string;
      let strokeWidth: number;

      if (txs.length === 1) {
        const tx = txs[0];
        edgeLabel = `${Number.parseFloat(tx.amount).toFixed(2)} ${tx.denom}`;
        edgeColor = "#64748b";
        strokeWidth = 2;
      } else {
        edgeLabel = `${txs.length} transactions`;
        edgeColor = "#f59e0b";
        strokeWidth = 3;
      }

      edgeMap.set(edgeId, {
        id: edgeId,
        source: sender,
        target: receiver,
        type: "transaction", // Use custom edge type so TransactionEdge is rendered
        animated: txs.length > 1,
        style: {
          stroke: edgeColor,
          strokeWidth: strokeWidth,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
        label: edgeLabel,
        labelStyle: {
          fontSize: 12,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: "rgba(255,255,255,0.9)",
          fillOpacity: 0.9,
        },
        data: {
          transactions: txs,
          label: edgeLabel,
        },
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: Array.from(edgeMap.values()),
    };
  }, [transactions, mainWallet, contractAddress, selectedNode]);

  const { nodes: initialNodes, edges: initialEdges } = processReactFlowData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes } = processReactFlowData();
    setNodes(newNodes);
  }, [processReactFlowData, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 8
    )}`;
  };

  const getTransactionsForNode = (address: string) => {
    return transactions.filter(
      (tx) =>
        (tx.sender || tx.from) === address || (tx.receiver || tx.to) === address
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Transaction Network Explorer
          </h3>
          <p className="text-sm text-muted-foreground">
            Interactive graph showing transaction flows between wallets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { nodes: resetNodes, edges: resetEdges } =
                processReactFlowData();
              setNodes(resetNodes);
              setEdges(resetEdges);
              setSelectedNode(null);
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div style={{ width: "100%", height: "600px" }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  attributionPosition="bottom-left"
                  className="rounded-lg"
                >
                  <Controls className="bg-white/80 backdrop-blur-sm" />
                  <MiniMap
                    className="bg-white/80 backdrop-blur-sm"
                    nodeColor={(node) => node.data.color}
                    maskColor="rgba(255,255,255,0.2)"
                  />
                  <Background
                    variant="dots"
                    gap={20}
                    size={1}
                    color="#e5e7eb"
                  />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Node Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-mono text-xs break-all">
                    {selectedNode.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant="outline" className="text-xs">
                    {selectedNode.type === "main"
                      ? "Main Wallet"
                      : selectedNode.type === "contract"
                      ? "Smart Contract"
                      : "External Wallet"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="font-semibold">{selectedNode.transactions}</p>
                </div>
                {selectedNode.address && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Recent Activity
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getTransactionsForNode(selectedNode.address)
                        .slice(0, 5)
                        .map((tx, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-muted rounded text-xs"
                          >
                            <p className="font-mono">
                              {tx.hash.substring(0, 16)}...
                            </p>
                            <p>
                              {Number.parseFloat(tx.amount).toFixed(4)}{" "}
                              {tx.denom}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <Wallet className="w-2 h-2 text-white" />
                </div>
                <span className="text-xs">Main Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Building2 className="w-2 h-2 text-white" />
                </div>
                <span className="text-xs">Smart Contract</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                  <Users className="w-2 h-2 text-white" />
                </div>
                <span className="text-xs">External Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-500 rounded"></div>
                <span className="text-xs">Single Transaction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500 rounded animate-pulse"></div>
                <span className="text-xs">Multiple Transactions</span>
              </div>
            </CardContent>
          </Card>

          {/* Network Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Network Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Nodes:</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Edges:</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Transactions:</span>
                <span className="font-medium">{transactions.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
