"use client";

import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export interface TransactionGraphNode {
  id: string;
  label: string;
  type: "wallet" | "contract" | "other";
  x: number;
  y: number;
}

export interface TransactionGraphLink {
  source: string;
  target: string;
  hash: string;
  amount: string;
  denom: string;
  timestamp: string;
  color: string;
}

export interface TransactionGraphData {
  nodes: TransactionGraphNode[];
  links: TransactionGraphLink[];
}

interface Props {
  data: TransactionGraphData;
  mainWallet: string;
  contractAddress: string;
}

const nodeColor = (node: TransactionGraphNode, contractAddress: string) => {
  if (node.id === contractAddress) return "#22c55e"; // green
  if (node.type === "wallet") return "#fbbf24"; // amber
  return "#64748b"; // neutral
};

export default function TransactionGraph({
  data,
  mainWallet,
  contractAddress,
}: Props) {
  // Map nodes to Scatter points
  const scatterData = data.nodes.map((node) => ({
    ...node,
    fill: nodeColor(node, contractAddress),
    r: node.id === mainWallet ? 24 : 16,
  }));

  return (
    <ResponsiveContainer width="100%" height={600}>
      <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
        <CartesianGrid />
        <XAxis dataKey="x" name="X" type="number" />
        <YAxis dataKey="y" name="Y" type="number" />
        <ZAxis dataKey="r" range={[16, 32]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter
          name="Wallets & Contracts"
          data={scatterData}
          fill="#8884d8"
          shape="circle"
        />
        {/* Draw links as lines */}
        {data.links.map((link, idx) => {
          const source = data.nodes.find((n) => n.id === link.source);
          const target = data.nodes.find((n) => n.id === link.target);
          if (!source || !target) return null;
          return (
            <line
              key={link.hash}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={link.color}
              strokeWidth={2}
              opacity={0.7}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
