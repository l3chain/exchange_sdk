import { ChainName } from "@l3chain/sdk";
import { ExchangePairMetadata } from "./entity";
export declare function ExchangePairsGenerater(graphURL: Record<ChainName, string>): Promise<ExchangePairMetadata[]>;
