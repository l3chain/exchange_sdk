import Web3 from 'web3';
import BN from 'bn.js';
import { TransactionProof } from '@l3chain/sdk';
import { Contract } from 'web3-eth-contract';
import { ExchangePairMetadata, ExchangeTokenID } from "./entity";
import { provider } from 'web3-core';
export type ProviderOptions = {
    signerProvider: provider;
    from: string;
    gasPrice?: number | BN | string;
    gasLimit?: number | BN | string;
    gasMutiple?: number;
};
export declare class ExchangePair {
    private _isMintBurnPairPromise;
    protected _metaData: ExchangePairMetadata;
    get metaData(): ExchangePairMetadata;
    protected _contract: Contract;
    get contract(): Contract;
    get contractAddress(): string;
    constructor(web3: Web3, metaData: ExchangePairMetadata);
    get toExchangeTokenIds(): ExchangeTokenID[];
    get fromExchangeTokenIds(): ExchangeTokenID[];
    get etid(): ExchangeTokenID;
    l3Nonce: () => number;
    tokenBalnaceReserver: () => Promise<BN>;
    borrowAmountOf: (account: string) => Promise<BN>;
    isDestroyCertificateIdOf: (fromChainIdentifier: string, fromPairAddress: string, certificateId: number) => any;
    exchangeToEstimateFee: (etid: ExchangeTokenID, fromAccount: string, toAccount: string, amount: string | number | BN) => Promise<{
        feeAmount: string | number | BN;
        feeAdditionalAmount: string | number | BN;
        feel3: string | number | BN;
    }>;
    acceptExchangeTokenID: () => Promise<ExchangeTokenID[]>;
    private _send;
    depositBorrowAmount: (amount: BN | string | number, options: ProviderOptions) => Promise<any>;
    withdrawBorrowAmount: (toAccount: string, amount: BN | string | number, options: ProviderOptions) => Promise<any>;
    sync: (options: ProviderOptions) => Promise<void>;
    exchangeFromProof: (proof: TransactionProof, options: ProviderOptions) => Promise<void>;
    exchangeFromProofsWithAddLiquidity: (proofs: TransactionProof[], ignoreRewards: boolean, options: ProviderOptions) => Promise<void>;
}
