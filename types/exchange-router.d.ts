import Web3 from 'web3';
import BN from 'bn.js';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';
import { L3Chain, ChainName, GraphQlClient } from '@l3chain/sdk';
import { ExchangePair } from './exchange-pair';
import { ExchangePairMetadata, ExchangeHistory, CertificateState, ExchangeTokenID } from "./entity";
import { ExchangeTransactionBuilder } from './exchange-builder';
type ChainComponent = {
    web3: Web3;
    client: GraphQlClient;
    factory: Contract;
    router: Contract;
};
export declare class ExchangeRouter {
    metaDatas: ExchangePairMetadata[];
    protected l3: Readonly<L3Chain>;
    _chains: Record<ChainName, ChainComponent>;
    constructor(l3: Readonly<L3Chain>, props: {
        generatedDatas: ExchangePairMetadata[];
        chains: Record<ChainName, {
            provider: provider;
            graphURL: string;
            factoryAddress: string;
            routerAddress: string;
        }>;
    });
    getComponents: (chainName: ChainName) => ChainComponent;
    /**
     * 获取基础手续费
     *
     * @param chainName
     * @returns token 基础手续费代币
     * @returns amount 手续费数量
     *
     */
    getBaseFee: (chainName: ChainName) => Promise<{
        token: string;
        amount: string | number | BN;
    }>;
    /**
     * 获取附加手续费设置
     *
     * @param pair 交易对
     * @returns thresholdAmount 触发阈值
     * @returns rateWei 全精度数值(1e12 = 100%)
     * @returns rate 百分比
     */
    getFeeAdditionalOf: (pairOrETID: ExchangePair | ExchangeTokenID) => Promise<{
        thresholdAmount: string | number | BN;
        rateWei: BN;
        rate: number;
    }>;
    /**
     * 获取指定网络中可以交易的所有交易对
     *
     * @param chainName
     * @returns
     */
    getSupportExchangePairs: (fromChain: ChainName) => ExchangePair[];
    /**
     * 获取对应网络的主币映射代币的Pair，不一定存在
     *
     * @param onChain
     * @returns
     */
    getWrappedCoinPair: (onChain: ChainName) => Promise<ExchangePair | undefined>;
    selectBorrowHistory: (onChain: ChainName, filter: {
        skip?: number | undefined;
        first: number;
        where?: {
            [key: string]: any;
        } | undefined;
        orderDirection?: "asc" | "desc" | undefined;
        orderBy?: string | undefined;
    }) => Promise<{
        borrower: string;
        amount: string;
    }[]>;
    /**
     * 查询历史记录:
     * 不能混合查询，一次只能查询一个网络中的数据，并不完全是GraphQL的数据，会对最终数据做一些可读性的转换一笔成功的跨
     * 网络代币交换逻辑，应该由A存B取组成，但是在各种限制条件下，暂时没有找到好的办法解决不同网络之间两个交易记录的关联
     * 问题，所以在查询交易的状态时候，可以很容易查到A存没存，B取没取，但是在AB之间关联上，存在较多障碍，无法直接在一个
     * 接口中给出。
     *
     * 字段说明:
     * fromAccount: 交易发起地址
     * toAccount: 最终接收地址
     * amount: 数量
     * fee: 基础手续费
     * feeAdditional: 附加手续费
     * fromETID: 来源代币
     * toETID: 目标代币
     * assetProvider: 提供代币的地址，有可能是Pair本身，也有可能是做市商的任何地址
     *
     * @param fromChain 网络名称
     * @param where 具体条件可以在对应网络的graphQL中查看,测试后按照对象形式写入where即可
     * @returns 历史记录
     */
    selectExchangeHistory: (fromChain: ChainName, filter: {
        skip?: number | undefined;
        first: number;
        where?: {
            [key: string]: any;
        } | undefined;
        orderDirection?: "asc" | "desc" | undefined;
        orderBy?: string | undefined;
    }) => Promise<ExchangeHistory[]>;
    /**
     * 获取历史记录对应的成交状态，一个完整的历史记录由1存1取构成，根据网络标识不同，history对象上的historyType
     * 能编辑该记录属于存入还是取出，如果获取存入订单状态，该方法会尝试去目标网络查询对应的取出历史，如果无法查找到
     * 说明还未处理，若能找到则判断是已那种形式完成了资产的交换
     *
     * @param history
     * @returns
     */
    getExchangeHistoryState: (history: ExchangeHistory) => Promise<CertificateState>;
    /**
     * 查询在指定网络中，所有关于account的借款信息，做市商可能会借出很多种类的资产，该接口可以一次性返回指定网络中所有的借出信息
     *
     * @param account
     */
    selectBorrowAmountsOf: (fromChain: ChainName, filter: {
        skip?: number | undefined;
        first: number;
        where?: {
            [key: string]: any;
        } | undefined;
    }) => Promise<{
        amount: BN;
        exchangePair: ExchangePair;
    }[]>;
    /**
     * 查询超过5-60分钟还未完成处理的交易
     *
     * 前5分钟先由节点默认程序处理，若无法处理，开始开放给做市商处理，超过60分钟还未被处理，节点将作为欠款处理
     *
     * @param pair
     */
    selectBadExchange: (pair: ExchangePair, filter?: {
        skip: number;
        first: number;
    }) => Promise<ExchangeHistory[]>;
    /**
     * 获取存入类型历史记录的凭证信息，返回的信息可以用于其他成员网络的验证，返回的对象可以用于在目标网络进行提取操作
     *
     * @param history
     * @returns
     */
    createExchangeProof: (history: ExchangeHistory) => Promise<import("@l3chain/sdk").TransactionProof>;
    getEstimateFee: (props: {
        fromETID: ExchangeTokenID;
        toETID: ExchangeTokenID;
        fromAccount: string;
        toAccount: string;
        amount: BN | string | number;
    }) => Promise<{
        feeAmount: BN;
        feeAdditionalAmount: BN;
        feel3: BN;
    }>;
    createExchangeBuilder: (fromChain: ChainName, fromAccount: string) => ExchangeTransactionBuilder;
    /**
     * @deprecated use 'getComponents'
     */
    getCompments: typeof this.getComponents;
    /**
     * @deprecated use 'getBaseFee'
     */
    fee: (chainName: ChainName) => Promise<{
        token: string;
        amount: string | number | BN;
    }>;
    /**
     * @deprecated use 'getFeeAdditionalOf'
     */
    feeAdditionalOf: (pairOrETID: ExchangePair | ExchangeTokenID) => Promise<{
        thresholdAmount: string | number | BN;
        rateWei: BN;
        rate: number;
    }>;
    /**
     * @deprecated use 'getSupportExchangePairs'
     */
    supportExchangePairs: (fromChain: ChainName) => ExchangePair[];
    /**
     * @deprecated use 'getWrappedCoinPair'
     */
    wrappedCoinPair: (onChain: ChainName) => Promise<ExchangePair | undefined>;
    /**
     * @deprecated use 'getEstimateFee'
     */
    estimateFee: (props: {
        fromETID: ExchangeTokenID;
        toETID: ExchangeTokenID;
        fromAccount: string;
        toAccount: string;
        amount: BN | string | number;
    }) => Promise<{
        feeAmount: BN;
        feeAdditionalAmount: BN;
        feel3: BN;
    }>;
    /**
     * @deprecated use 'createExchangeProof'
     */
    getDepositedProof: (history: ExchangeHistory) => Promise<import("@l3chain/sdk").TransactionProof>;
}
export {};
