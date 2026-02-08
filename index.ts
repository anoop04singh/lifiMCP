import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createConfig, getQuote } from "@lifi/sdk";
// 1. Configure the LI.FI SDK globally
createConfig({
    integrator: "mcp-lifi-server",
});
// 2. Initialize the MCP Server
const server = new McpServer({
    name: "lifi-server",
    version: "1.0.0",
});
// 3. Define the 'get_quote' tool
server.tool("get_quote", {
    fromChain: z.number().describe("The ID of the source chain (e.g., 42161 for Arbitrum, 1 for Ethereum)"),
    toChain: z.number().describe("The ID of the destination chain (e.g., 10 for Optimism)"),
    fromToken: z.string().describe("The contract address of the token on the source chain"),
    toToken: z.string().describe("The contract address of the token on the destination chain"),
    fromAmount: z.string().describe("The amount to transfer in the smallest unit (e.g., wei)"),
    fromAddress: z.string().describe("The wallet address of the user. Required to simulate the transaction"),
}, async ({ fromChain, toChain, fromToken, toToken, fromAmount, fromAddress }) => {
    try {
        // LOGGING: Use console.error, NOT console.log
        console.error(`Fetching quote for ${fromAmount} of ${fromToken} on chain ${fromChain}...`);
        const quote = await getQuote({
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmount,
            fromAddress
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(quote, null, 2),
                },
            ],
        };
    }
    catch (error) {
        console.error("Error fetching quote:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to fetch quote: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// 4. Start the server
async function run() {
    const transport = new StdioServerTransport();
    // FIX: We cast to 'any' to bypass the strict TypeScript version mismatch
    await server.connect(transport);
    console.error("LI.FI MCP Server running on stdio");
}
run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
