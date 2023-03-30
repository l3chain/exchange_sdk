import { ChainName } from "@l3/sdk";
import { ExchangePair } from "./exchange-pair";
export interface L3Exchange {
    exchangePairs(chainName: ChainName): Promise<ExchangePair[]>;
}
export declare function L3Exchange(props: {
    graphQL: {
        [key in ChainName]: string;
    };
    rpc: {
        [key in ChainName]: string;
    };
}): L3Exchange;
