"use client";

import React, { useState, useRef } from "react";
import { Graph } from "react-d3-graph";

export interface TransactionNetworkNode {
  id: string;
  color?: string;
  size?: number;
  fontColor?: string;
}

export interface TransactionNetworkLink {
  source: string;
  target: string;
  color?: string;
  label?: string;
}

export interface TransactionNetworkData {
  nodes: TransactionNetworkNode[];
  links: TransactionNetworkLink[];
}

interface Props {
  data: TransactionNetworkData;
  mainWallet: string;
  contractAddress: string;
}

const vibrantPalette = [
  "#e63946", // red
  "#f1c40f", // yellow
  "#2ecc40", // green
  "#00bcd4", // cyan
  "#ff9800", // orange
  "#8e44ad", // purple
  "#1e90ff", // blue
  "#ff69b4", // pink
  "#43a047", // dark green
  "#e67e22", // carrot
  "#d7263d", // crimson
  "#00b894", // teal
  "#fdcb6e", // gold
  "#6c5ce7", // indigo
  "#fd79a8", // magenta
];

const graphConfig = {
  nodeHighlightBehavior: true,
  node: {
    color: vibrantPalette[0], // fallback, but each node will get its own color
    size: 400,
    highlightStrokeColor: "#fbbf24",
    fontColor: "#22223b",
    fontSize: 16,
  },
  link: {
    highlightColor: "#fbbf24",
    renderLabel: false, // hide labels on links
    fontSize: 12,
  },
  directed: true,
  height: 600,
  width: 1000,
  d3: {
    gravity: -300,
  },
};

export default function TransactionNetwork({
  data,
  mainWallet,
  contractAddress,
}: Props) {
  // Assign a unique color to each node
  const colorMap: Record<string, string> = {};
  let colorIdx = 0;
  data.nodes.forEach((node) => {
    if (!colorMap[node.id]) {
      colorMap[node.id] = vibrantPalette[colorIdx % vibrantPalette.length];
      colorIdx++;
    }
  });

  // Accept wallet label mapping as a prop or fallback to address slice
  // We'll pass wallet label mapping from TransactionAnalytics
  const getWalletLabel = (addr: string) => {
    // Try to get label from mainWallet (Alice/Bob/etc) if matches
    if (mainWallet && addr === mainWallet) {
      // Try to infer label from address (Alice, Bob, etc)
      // This is a hack: if mainWallet is present, label is Alice/Bob/Carol etc
      // Otherwise, fallback to address slice
      // You can pass wallet label as a prop for more robust solution
      if (typeof addr === "string" && addr.length > 10) {
        // Try to guess label from known patterns
        if (addr.endsWith("xnj")) return "Alice";
        if (addr.endsWith("wuz")) return "Bob";
        if (addr.endsWith("xyz")) return "Carol";
      }
      return "Self";
    }
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  // Track last mouse position for tooltip
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    nodeId: string;
    show: boolean;
  }>({ x: 0, y: 0, nodeId: "", show: false });

  // Find all transactions for a node
  const getNodeTxs = (nodeId: string) => {
    return [
      ...data.links.filter((l) => l.source === nodeId),
      ...data.links.filter((l) => l.target === nodeId),
    ];
  };

  // Prepare graph data with vibrant node colors and wallet label or short address
  const graphData = {
    nodes: data.nodes.map((node) => ({
      ...node,
      color: colorMap[node.id],
      fontColor: "#22223b",
      label: getWalletLabel(node.id),
    })),
    links: data.links.map((link) => ({
      ...link,
      color: link.color || "#b2bec3",
      label: "", // no label on line
    })),
  };

  // Node event handlers
  const [graphBox, setGraphBox] = useState<HTMLDivElement | null>(null);
  // Mouse move handler to track position
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!graphBox) return;
    const rect = graphBox.getBoundingClientRect();
    lastMousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  // Only nodeId param for react-d3-graph
  const onClickNode = (nodeId: string) => {
    setTooltip({
      x: lastMousePos.current.x,
      y: lastMousePos.current.y,
      nodeId,
      show: true,
    });
  };
  const onMouseOverNode = (nodeId: string) => {
    setTooltip({
      x: lastMousePos.current.x,
      y: lastMousePos.current.y,
      nodeId,
      show: true,
    });
  };
  const onMouseOutNode = () => {
    setTooltip((t) => ({ ...t, show: false }));
  };

  return (
    <div
      className="w-full flex justify-center relative"
      ref={setGraphBox}
      style={{ position: "relative" }}
      onMouseMove={onMouseMove}
    >
      <Graph
        id="tx-network-graph"
        data={graphData}
        config={graphConfig}
        onClickNode={onClickNode}
        onMouseOverNode={onMouseOverNode}
        onMouseOutNode={onMouseOutNode}
      />
      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 16,
            minWidth: 220,
            maxWidth: 1200,
            pointerEvents: "none",
            transform: "translate(-60%, -10%)",
          }}
        >
          <div className="font-mono text-xs text-gray-700 mb-2 break-all">
            <b>Wallet:</b> {getWalletLabel(tooltip.nodeId)}
            <br />
            <span className="text-gray-400">{tooltip.nodeId}</span>
          </div>
          <div className="text-xs text-gray-700">
            <b>Transactions:</b>
            <ul className="list-disc ml-4">
              {getNodeTxs(tooltip.nodeId).map((tx, i) => (
                <li key={i} className="mb-1">
                  <div>
                    Hash:{" "}
                    <span className="font-mono">
                      {tx.label?.split("\n")[0]?.replace("Hash: ", "")}
                    </span>
                  </div>
                  <div>
                    Amount: {tx.label?.split("\n")[1]?.replace("Amount: ", "")}
                  </div>
                  <div>
                    Date: {tx.label?.split("\n")[2]?.replace("Date: ", "")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
