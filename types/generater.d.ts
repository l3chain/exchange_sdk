import { ChainName } from "@l3chain/sdk";
import { provider } from 'web3-core';
import { ExchangePairMetadata } from "./entity";
export declare function ExchangePairsGenerater(props: {
    graphQL: {
        [key in ChainName]: string;
    };
    providers: {
        [key in ChainName]: provider;
    };
}): Promise<ExchangePairMetadata[]>;
