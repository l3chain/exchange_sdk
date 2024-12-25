import { ChainName, L3Provider, L3ProviderGroup } from "@l3chain/sdk";

export * from "./exchange-pair-meta-data";
export * from "./exchange-token-id";
export * from "./exchange-history";


export type ExchangeProvider = L3Provider & {
    graphURL: string,
    factoryAddress: string,
    routerAddress: string
};

export type ExchangeProviderGroup = L3ProviderGroup & {
    graphDataBaseHost: string;
    providers: Record<ChainName, ExchangeProvider>;
};