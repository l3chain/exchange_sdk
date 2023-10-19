import { ChainIdentifier } from '@l3chain/sdk';
import BN from 'bn.js';
export declare const NullableAddress = "0x0000000000000000000000000000000000000000";
export type CertificateState = "Unused" | "ExchangedDone" | "BadHandlerDone" | "BorrowAmountDone";
/**
 * 交换记录包含了两个类型,实际上一个交易记录在整个桥中存在两笔交易，一个存入，一个取出，若只有存入，找不到取出则说明还未取出
 * emitChainIdentifier和emitPair标记了这个产生的交换记录来自于哪个网络的哪一个交易对，结合from和to可以判断出交易方向
 */
export type ExchangeHistory = {
    id: string;
    emitChainIdentifier: ChainIdentifier;
    emitPair: string;
    certificateId: number;
    historyType: "Deposit" | "Withdraw";
    time: number;
    assetProvider: string;
    from: {
        chainIdentifier: ChainIdentifier;
        account: string;
        tokenPair: string;
        tokenAddress: string;
        tokenName: string;
        tokenSymbol: string;
        tokenDecimals: number;
    };
    to: {
        chainIdentifier: ChainIdentifier;
        account: string;
        tokenPair: string;
        tokenAddress: string;
        tokenName: string;
        tokenSymbol: string;
        tokenDecimals: number;
    };
    amount: BN;
    fee: BN;
    feeAdditional: BN;
};
