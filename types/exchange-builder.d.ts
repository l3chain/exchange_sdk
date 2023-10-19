/// <reference types="node" />
import BN from 'bn.js';
import { EventEmitter } from "events";
import { provider } from 'web3-core';
import { ChainName } from '@l3chain/sdk';
import { ExchangeTokenID } from "./entity";
import { ExchangeRouter } from './exchange-router';
export declare class ExchangeTransactionBuilderEmitter<T extends Record<string | symbol, any>> extends EventEmitter {
    on<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this;
    once<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this;
    listeners<K extends keyof T>(eventName: K): Function[];
    listenerCount<K extends keyof T>(eventName: K): number;
    addListener<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this;
    removeListener<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this;
}
type ExchangeTransactionPayload = {
    fromAccount: string;
    toAccount: string;
    fromETID: ExchangeTokenID;
    toETID: ExchangeTokenID;
    amount: BN;
};
export declare const ExchangeTransactionErrors: {
    INSUFFICIENT_BALANCE: Error;
    INVAILD_PAYLOAD: Error;
};
export declare class ExchangeTransactionSender extends ExchangeTransactionBuilderEmitter<{
    transactionHash: (hash: string) => void;
    estimateGas: (gas: number) => void;
    error: (e: Error) => void;
    approved: (tx: any) => void;
    receipt: (receipt: any) => void;
}> {
    approveCaller: any;
    approveParams: any;
    exchangeCaller: any;
    exchangeParams: any;
    loader: any;
    constructor(exchangeRouter: ExchangeRouter, signerProvider: provider, payload: ExchangeTransactionPayload, options?: {
        gasPrice: BN | number | string | undefined;
        gasMultiple: number;
    });
    send(gasMultiple?: number): Promise<any>;
}
export declare class ExchangeTransactionBuilder extends ExchangeTransactionBuilderEmitter<{
    error: (e: any) => void;
    feeAdditionalConfig: (fees: {
        thresholdAmount: string | number | BN;
        rateWei: BN;
        rate: number;
    }) => void;
    feeAmountUpgrade: (fees: {
        feeAmount: BN;
        feeAdditionalAmount: BN;
        feel3: BN;
    }) => void;
}> {
    private feeExchange;
    private feeAdditionalConfig;
    private feeL3;
    private readonly router;
    private payload;
    get fromAccount(): string | undefined;
    get toAccount(): string | undefined;
    get fromETID(): ExchangeTokenID | undefined;
    get toETID(): ExchangeTokenID | undefined;
    get amount(): BN | undefined;
    constructor(router: ExchangeRouter, props: {
        fromChain: ChainName;
        fromAccount: string;
    });
    private _updateFee;
    setFromETID(etid: ExchangeTokenID): this;
    setToETID(etid: ExchangeTokenID): this;
    setToAccount(account: string): this;
    setAmount(amount: BN | string): this;
    build(signerProvider: provider, options?: {
        gasPrice: number | BN | string | undefined;
        gasMultiple: number;
    }): ExchangeTransactionSender;
}
export {};
