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

Create a .env file in the root directory:

Code snippet

`   # Your EVM Private Key (Must start with 0x...)  EVM_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE   `

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

`   {    "mcpServers": {      "lifi": {        "command": "node",        "args": ["C:\\Path\\To\\Your\\Project\\dist\\index.js"]      }    }  }   `

**MacOS/Linux:**

JSON

`   {    "mcpServers": {      "lifi": {        "command": "/usr/local/bin/node",        "args": ["/absolute/path/to/project/dist/index.js"]      }    }  }   `


🔮 Future Implementations
-------------------------

*   **ENS Name Resolution:** Add a tool to resolve .eth names to addresses automatically, allowing users to say "Send USDC to vitalik.eth".
    
*   **Multi-VM Support:**
    
    *   **Solana:** Add KeypairWalletAdapter for Solana execution.
