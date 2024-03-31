import { createBundlerClient, baseSepolia } from "@alchemy/aa-core";
import { http } from "viem";

export const publicClient = createBundlerClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC!),
});
