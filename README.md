# NitroMCP

<img width="1600" height="900" alt="Untitled design (11)" src="https://github.com/user-attachments/assets/fa037ab3-185a-4bfa-9d69-4f47c6faa783" />

================

A Model Context Protocol (MCP) server that integrates the **LI.FI SDK**, enabling AI assistants (like Claude) to fetch cross-chain quotes and execute token swaps autonomously.

🚀 Features
-----------

*   **Zero-Config Integration:** Pre-configured SDK setup (mcp-lifi-server) for immediate use.
    
*   **Quote Retrieval:** Fetch detailed, single-step cross-chain quotes including gas costs, estimated output, and provider details.
    
*   **Wallet Integration (EVM):** Secure server-side signing using viem and private keys loaded from environment variables.
    
*   **Automated Execution:** Handles the full transaction lifecycle:
    
    *   Checks Token Allowances
        
    *   Approves Tokens (if needed)
        
    *   Switches Chains (server-side context)
        
    *   Broadcasts Transactions
        
*   **Multi-Chain Support:** Pre-configured for Mainnet, Arbitrum, Optimism, Base, and Polygon.
    

🛠 Tools Implemented
--------------------

The server exposes the following tools to the MCP client:

### 1\. get\_quote

Retrieves a quote for a token swap or bridge.

*   **Inputs:** fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, slippage.
    
*   **Output:** A detailed JSON object containing the best available route, estimated returns, and fee costs.
    

### 2\. execute\_swap

Executes a previously fetched quote on the blockchain.

*   **Inputs:** quote (The full JSON string returned by get\_quote).
    
*   **Process:** Converts the quote to a runnable "Route", handles approvals, and submits the transaction using the server's wallet.


### 3. ENS Integration:

Resolves from and to addresses for easier and quicker transfer.

<img width="945" height="470" alt="Screenshot 2026-02-09 133241" src="https://github.com/user-attachments/assets/2d8354c9-2e2e-4561-89d0-4dccb1461374" />
<img width="900" height="508" alt="Screenshot 2026-02-09 133258" src="https://github.com/user-attachments/assets/ebfc5770-3698-404b-b8df-90a749acb881" />

    

📦 Installation & Setup
-----------------------

### Prerequisites

*   Node.js v18+
    
*   An EVM Private Key (for execution)
    
*   Claude Desktop (or any MCP-compatible client)
    

### 1\. Clone & Install

Bash
`   git clone   cd lifi-mcp-server  npm install   `

### 2\. Environment Configuration

We will use Clade Config file for .env.

_Note: Ensure the wallet associated with this key has native gas tokens (ETH, MATIC, etc.) on the source chain you intend to use._

### 3\. Build the Server

Bash

`   npm run build   `

### 4\. Configure Claude Desktop

Edit your Claude configuration file:

*   **MacOS:** ~/Library/Application Support/Claude/claude\_desktop\_config.json
    
*   **Windows:** %APPDATA%\\Claude\\claude\_desktop\_config.json
    

Add the following entry (adjust paths to match your system):

**Windows:**

JSON

`   { 
  "mcpServers": {
    "lifi": {
      "command": "node",
      "args": ["C:\\Path\\To\\Your\\Project\\dist\\index.js"],
      "env": {
        "EVM_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE"
      }
    }
  }
}
`
**MacOS/Linux:**

JSON


`   {    "mcpServers": {      "lifi": {        "command": "/usr/local/bin/node",        "args": ["/absolute/path/to/project/dist/index.js"],   "env": {
        "EVM_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY_HERE"
      }     }    }  }   `

Demo
-------------------------
<img width="934" height="591" alt="Screenshot 2026-02-09 114727" src="https://github.com/user-attachments/assets/b4e35ac7-3b84-48fa-8570-415099050695" />

<img width="886" height="679" alt="Screenshot 2026-02-09 114759" src="https://github.com/user-attachments/assets/b13916d4-c84d-4226-8507-da36803e671a" />

<img width="962" height="681" alt="Screenshot 2026-02-09 114812" src="https://github.com/user-attachments/assets/89ca7d97-0a95-49b4-a595-48e9af621be8" />

🔮 Future Implementations
-------------------------

*   **ENS Name Resolution:** Add a tool to resolve .eth names to addresses automatically, allowing users to say "Send USDC to vitalik.eth".
    
*   **Multi-VM Support:**
    
    *   **Solana:** Add KeypairWalletAdapter for Solana execution.
