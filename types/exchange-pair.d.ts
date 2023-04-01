import Web3 from 'web3';
import BN from 'bn.js';
import { Contract } from 'web3-eth-contract';
import { ExchangePairMetadata, ExchangeTokenID } from "./entity";
export declare class ExchangePair {
    protected _metaData: ExchangePairMetadata;
    get metaData(): ExchangePairMetadata;
    protected _contract: Contract;
    get contract(): Contract;
    get contractAddress(): string;
    constructor(web3: Web3, metaData: ExchangePairMetadata);
    get toExchangeTokenIds(): ExchangeTokenID[];
    get fromExchangeTokenIds(): ExchangeTokenID[];
    l3Nonce: () => number;
    tokenBalnaceReserver: () => string | number | BN;
    borrowAmountOf: (account: string) => string | number | BN;
    isDestroyCertificateIdOf: (fromChainIdentifier: string, fromPairAddress: string, certificateId: number) => any;
    exchangeToEstimateFee: (etid: ExchangeTokenID, fromAccount: string, toAccount: string, amount: string | number | BN) => Promise<{
        feeAmount: string | number | BN;
        feeAdditionalAmount: string | number | BN;
        feel3: string | number | BN;
    }>;
    acceptExchangeTokenID: () => Promise<ExchangeTokenID[]>;
}
