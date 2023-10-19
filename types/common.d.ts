import { ChainName, ChainIdentifier } from "@l3chain/sdk";
declare global {
    interface String {
        toChainName(this: ChainIdentifier): ChainName;
    }
}
export declare function ChainNameFromIdentifier(): void;
