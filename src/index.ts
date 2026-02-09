import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createConfig, getQuote, executeRoute, convertQuoteToRoute, EVM, Sui } from "@lifi/sdk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, arbitrum, optimism, base, polygon } from "viem/chains";
import * as dotenv from "dotenv";

// 1. Load Environment Variables
dotenv.config();

const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;

// 2. Setup EVM Wallet (Viem)
let evmWalletClient: any = null;
let account: any = null;

if (EVM_PRIVATE_KEY) {
  try {
    account = privateKeyToAccount(EVM_PRIVATE_KEY as `0x${string}`);
    evmWalletClient = createWalletClient({
      account,
      chain: mainnet, 
      transport: http(),
    });
    console.error(`✅ EVM Wallet Configured: ${account.address}`);
  } catch (error) {
    console.error("❌ Failed to configure EVM wallet:", error);
  }
}

// 3. Configure LI.FI SDK
createConfig({
  integrator: "mcp-lifi-server",
  providers: [
    EVM({
      getWalletClient: async () => evmWalletClient,
      switchChain: async (chainId) => {
        const chain = [mainnet, arbitrum, optimism, base, polygon].find(c => c.id === chainId);
        if (!chain) throw new Error(`Chain ${chainId} not configured in local wallet`);
        return createWalletClient({
          account,
          chain,
          transport: http(),
        });
      },
    }),
    Sui({
      getWallet: async () => {
        throw new Error("Sui private key signing not yet fully implemented for backend");
      }
    })
  ],
});

// 4. Initialize MCP Server
const server = new McpServer({
  name: "lifi-server",
  version: "1.2.0", // Bumped version
});

// Tool 1: Get Quote
server.tool(
  "get_quote",
  {
    fromChain: z.number(),
    toChain: z.number(),
    fromToken: z.string(),
    toToken: z.string(),
    fromAmount: z.string(),
    fromAddress: z.string(),
  },
  async (args) => {
    try {
      console.error(`Fetching quote for ${args.fromAmount}...`);
      const quote = await getQuote({
        ...args
      });
      return {
        content: [{ type: "text", text: JSON.stringify(quote, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Tool 2: Execute Swap (With Hook)
server.tool(
  "execute_swap",
  {
    quote: z.string().describe("The full JSON quote object returned by get_quote"),
  },
  async ({ quote }) => {
    try {
      if (!evmWalletClient) {
        throw new Error("EVM Wallet not configured. Set EVM_PRIVATE_KEY in .env");
      }

      console.error("Executing swap...");
      const quoteObj = JSON.parse(quote);
      const route = convertQuoteToRoute(quoteObj);

      const executedRoute = await executeRoute(route, {
        // HOOK IMPLEMENTATION
        acceptExchangeRateUpdateHook: async ({ oldToAmount, newToAmount, toToken }) => {
            console.error(`⚠️ Exchange Rate Updated during execution!`);
            console.error(`   Old Amount: ${oldToAmount}`);
            console.error(`   New Amount: ${newToAmount}`);
            
            // Logic: For an automated agent, we generally return true to prevent the bot getting stuck.
            // You could add logic here to return false if (newToAmount < oldToAmount * 0.9)
            console.error(`   ✅ Auto-accepting rate update.`);
            return true;
        },
        updateRouteHook: (updatedRoute) => {
          updatedRoute.steps.forEach((step) => {
             if (step.execution?.status === 'DONE' || step.execution?.status === 'FAILED') {
                console.error(`Step [${step.tool}] Status: ${step.execution.status}`);
             }
          });
        },
      });

      let txHash = "Unknown";
      executedRoute.steps.forEach(step => {
        step.execution?.process.forEach(p => {
          if (p.txHash) txHash = p.txHash;
        });
      });

      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            status: "SUCCESS",
            transactionHash: txHash,
            details: "Swap executed successfully via LI.FI"
          }, null, 2) 
        }],
      };
    } catch (error) {
      console.error("Execution failed:", error);
      return {
        content: [{ type: "text", text: `Execution failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Start Server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport as any);
  console.error("LI.FI MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
