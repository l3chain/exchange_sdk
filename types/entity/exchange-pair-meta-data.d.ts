import { ExchangeTokenID } from "./exchange-token-id";
export interface ExchangePairMetadata {
    id: string;
    etid: ExchangeTokenID;
    pairContract: string;
    tokenAddress: string;
    tokenDecimals: number | string;
    tokenName: string;
    tokenSymbol: string;
    fromEtid: ExchangeTokenID[];
    toEtid: ExchangeTokenID[];
}
