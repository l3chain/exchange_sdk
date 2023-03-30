import Web3 from 'web3';
export interface ExchangePair {
    pairContract: string;
    tokenAddress: string;
    tokenDecimals: number;
    tokenName: string;
    tokenSymbol: string;
}
export declare function ExchangePair(props: {
    web3: Web3;
    pairContract: string;
    tokenAddress: string;
    tokenDecimals: number;
    tokenName: string;
    tokenSymbol: string;
}): ExchangePair;
