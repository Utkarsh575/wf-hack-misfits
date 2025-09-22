# 🏗️ Solution Architecture: AML Smart Contract Checks for Non-Custodial Wallets

## Overview

This document describes the architecture and design of the AI-powered oracle and anti-money laundering (AML) compliance system for blockchain custodial wallets. The system ensures that custodial wallets only accept transactions from compliant non-custodial wallets, leveraging a multi-agent AML checker, an oracle service, and a smart contract on a Cosmos SDK chain.

---

## High-Level Architecture

<img width="545" height="545" alt="Screenshot 2025-09-22 at 12 25 00 PM" src="https://github.com/user-attachments/assets/6f13eb73-8d78-4175-a96b-74f5b230d417" />

```mermaid
flowchart TD
    subgraph User
        UI["Frontend Dashboard"]
    end
    subgraph Blockchain
        SC["Sample Smart Contract"]
    end
    subgraph Backend
        ORA["Oracle Service"]
        DJ["Django AML Service (Multi-Agent)"]
    end
    UI -- "Initiate Transaction" --> SC
    SC -- "Request Approval" --> ORA
    ORA -- "Run Compliance Check" --> DJ
    DJ -- "Fetch On-chain Data" --> Blockchain
    DJ -- "Compliance Result" --> ORA
    ORA -- "Sign/Block Tx" --> SC
    SC -- "Transaction Result" --> UI
```

---

## Component Breakdown

### 1. Frontend Dashboard (Next.js/React)

- Allows users/admins to initiate transactions and view compliance status.
- Visualizes transaction networks and compliance results.

### 2. Smart Contract (CosmWasm, Rust)

- Implements custodial wallet logic.
- Requires oracle signature for sensitive operations (e.g., `receive_with_approval`).
- Rejects transactions from non-compliant wallets.

### 3. Oracle Service (Node.js/TypeScript)

- Listens for signature requests from the smart contract.
- Calls the Django AML service to check sender compliance.
- Signs or blocks transactions based on compliance verdict.

### 4. Django AML Service (Python, LangGraph, OpenAI)

- Multi-agent system for layered AML checks (sanctions, structuring, layering, etc.).
- Fetches live on-chain data for analysis.
- Aggregates agent results and computes risk score.

---

## Signature Generation & Compliance Flow
<img width="820" height="403" alt="image" src="https://github.com/user-attachments/assets/535722b3-83f8-4c42-930b-97f7cd61abfc" />

```mermaid
sequenceDiagram
    participant User
    participant SmartContract
    participant Oracle
    participant DjangoAML
    participant Blockchain
    User->>SmartContract: Initiate transfer
    SmartContract->>Oracle: Request signature
    Oracle->>DjangoAML: Is sender AML compliant?
    DjangoAML->>Blockchain: Fetch sender tx history
    DjangoAML->>DjangoAML: Multi-agent analysis (sanctions, structuring, etc)
    DjangoAML-->>Oracle: Compliance result (pass/fail)
    Oracle-->>SmartContract: Signature or error
    SmartContract-->>User: Success or compliance failure
```

---

## Multi-Agent AML Analysis (Django Service)

<img width="945" height="258" alt="Screenshot 2025-09-22 at 12 26 00 PM" src="https://github.com/user-attachments/assets/12e0f6cc-ab00-4a9c-80cc-83fbb783d2e1" />

```mermaid
flowchart LR
    A["Receive wallet address"] --> B["Fetch transactions from blockchain"]
    B --> C1["Sanction Check Agent"]
    B --> C2["Structuring Check Agent"]
    B --> C3["Layering Check Agent"]
    C1 --> D["Aggregate Results"]
    C2 --> D
    C3 --> D
    D --> E["Compute Risk Score (OpenAI)"]
    E --> F["Return compliance verdict"]
```

---

## Data Flow Summary

1. User initiates a transaction via the dashboard.
2. Smart contract requests oracle signature for the transaction.
3. Oracle service queries the Django AML backend for compliance.
4. Django service fetches on-chain data and runs multi-agent analysis.
5. Oracle receives compliance verdict and signs or blocks the transaction.
6. Smart contract executes or rejects the transaction based on oracle response.
7. Dashboard updates with transaction and compliance status.

---

## Deployment Diagram
<img width="658" height="556" alt="Screenshot 2025-09-22 at 12 26 24 PM" src="https://github.com/user-attachments/assets/c8aeaa66-4f70-4e14-9afb-8e89f5df3b22" />

```mermaid
graph TD
    subgraph Cloud
        Django[(Django AML Service)]
        Oracle[(Oracle Service)]
        Dashboard[(Frontend Dashboard)]
    end
    subgraph Blockchain Network
        Contract[(CosmWasm Smart Contract)]
        Cosmos[(Cosmos SDK Chain)]
    end
    Dashboard -->|API| Django
    Dashboard -->|API| Oracle
    Oracle -->|API| Django
    Oracle -->|Tx Approval| Contract
    Contract -->|Tx| Cosmos
    Dashboard -->|Query| Contract
```

---

## Key Design Decisions

- **Oracle as Compliance Gatekeeper**: The oracle is the only entity that can approve sensitive smart contract operations, ensuring all transactions are AML-checked.
- **Multi-Agent AML Analysis**: Using LangGraph and OpenAI enables flexible, extensible compliance logic.
- **Separation of Concerns**: Each component (frontend, oracle, AML backend, contract) is independently deployable and testable.
- **Live Data Integration**: The Django service fetches real-time blockchain data for accurate compliance checks.

---

## Extensibility & Future Work

- Add more compliance agents (e.g., behavioral, anomaly detection).
- Integrate additional data sources (e.g., Google datasets, external sanctions lists).
- Support more blockchains and contract types.
- Enhance dashboard analytics and alerting.

---

## Architecture Diagram (Image)

