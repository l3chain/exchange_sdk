import Web3 from 'web3';
import BN from 'bn.js';

import { toNumber, fromWei, toBN } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';
import { ChainIdentifier, ChainIdentifiers, ChainName, ChainNameFromIdentifier, ChainNames, GraphQlClient } from '@l3/sdk';
import { ExchangePair } from './exchange-pair';
import { ExchangePairMetadata, ExchangeHistory, CertificateState, NullableAddress } from "./entity";

const IExchangePairABI = require('@l3exchange/contracts/build/contracts/IExchangePair.json').abi;
const IExchangeRouterABI = require('@l3exchange/contracts/build/contracts/IExchangeRouter.json').abi;
const IExchangeFactoryABI = require('@l3exchange/contracts/build/contracts/IExchangeFactory.json').abi;

export class ExchangeRouter {
    metaDatas: ExchangePairMetadata[];
    protected _web3s: { [key in ChainName]?: Web3 } = {}
    protected _clients: { [key in ChainName]?: GraphQlClient } = {}
    protected _contracts: {
        factory: { [key in ChainName]?: Contract },
        router: { [key in ChainName]?: Contract },
    } = {
            factory: {},
            router: {}
        }

    constructor(props: {
        generatedDatas: ExchangePairMetadata[],
        graphQL: { [key in ChainName]: string },
        providers: { [key in ChainName]: provider },
        addresses: {
            factory: { [key in ChainName]: string },
            router: { [key in ChainName]: string },
        }
    }) {
        const { generatedDatas, graphQL, providers, addresses } = props;
        this.metaDatas = generatedDatas;
        for (let name of ChainNames) {
            this._clients[name] = new GraphQlClient(graphQL[name as ChainName]);
            this._web3s[name] = new Web3(providers[name as ChainName]);
            this._contracts.factory[name] = new this._web3s[name]!.eth.Contract(IExchangeFactoryABI, addresses.factory[name])
            this._contracts.router[name] = new this._web3s[name]!.eth.Contract(IExchangeRouterABI, addresses.router[name])
        }
    }

    /**
     * 获取基础手续费
     * 
     * @param chainName 
     * @returns token 基础手续费代币
     * @returns amount 手续费数量
     */
    fee = (chainName: ChainName) => new Promise<{
        token: string,
        amount: string | number | BN,
    }>((resolve, reject) => {
        this._contracts.factory[chainName]!.methods
            .fee()
            .call()
            .catch(reject)
            .then((result: any) => resolve({
                token: result.token,
                amount: result.amount
            }))
    })

    /**
     * 获取附加手续费设置
     * 
     * @param pair 交易对
     * @returns thresholdAmount 触发阈值
     * @returns rateWei 全精度数值(1e12 = 100%)
     * @returns rate 百分比
     */
    feeAdditionalOf = (pair: ExchangePair) => new Promise<{
        thresholdAmount: string | number | BN,
        rateWei: BN,
        rate: number,
    }>((resolve) => {
        this._contracts.factory[ChainNameFromIdentifier(pair.metaData.etid.chainIdentifier) as ChainName]!.methods
            .feeAdditionalOf(pair.metaData.pairContract)
            .call()
            .then((result: any) => resolve({
                thresholdAmount: result.thresholdAmount,
                rateWei: toBN(result.rate),
                rate: parseFloat(fromWei(result.rate, 'szabo')),
            }));
    })

    /**
     * 获取指定网络中可以交易的所有交易对
     * 
     * @param chainName 
     * @returns 
     */
    supportExchangePairs = (fromChain: ChainName) => this.metaDatas.filter(
        data => data.etid.chainIdentifier.toLowerCase() == ChainIdentifiers[fromChain].toLowerCase()
    ).map(data => new ExchangePair(this._web3s[fromChain]!, data))

    /**
     * 查询历史记录:
     * 不能混合查询，一次智能查询一个网络中的数据，并不完全是GraphQL的数据，会对最终数据做一些可读性的转换一笔成功的跨
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
    selectExchangeHistory = async (fromChain: ChainName, filter: {
        skip?: number,
        first: number,
        where?: { [key: string]: any },
        orderDirection?: "asc" | "desc"
        orderBy?: string
    }): Promise<ExchangeHistory[]> => {
        let gql = `
        {
            exchangeds(
                ${!filter.where ? "" : `where:${JSON.stringify(filter.where).replace(/"(\w+)":/g, '$1:')}`}
                ${!filter.skip ? "skip:0" : `skip: ${filter.skip}`}
                ${!filter.first ? "" : `frist: ${filter.first}`}
                ${!filter.orderDirection ? "orderDirection:desc" : `orderDirection: ${filter.orderDirection}`}
                ${!filter.orderBy ? "orderBy:time" : `orderBy: ${filter.orderBy}`}
            ) {
                certificateId
                fromAccount
                toAccount
                amount
                fee
                feeAdditional
                assetProvider
                time
                fromETID {
                    chainIdentifier
                    exchangePair:shadowEmiter
                }
                toETID {
                    chainIdentifier
                    exchangePair:shadowEmiter
                }
            }
        }
        `
        let exchangeds = await this._clients[fromChain]?.query<{
            exchangeds: {
                certificateId: string,
                fromAccount: string,
                toAccount: string,
                amount: string,
                fee: string,
                feeAdditional: string,
                time: string,
                fromETID: {
                    chainIdentifier: ChainIdentifier,
                    exchangePair: string,
                },
                toETID: {
                    chainIdentifier: ChainIdentifier,
                    exchangePair: string,
                }
                assetProvider: string
            }[]
        }>(gql).then(data => {

            if (!data) {
                console.log(gql)
            }

            return data.exchangeds;
        });

        let emitChainIdentifier = ChainIdentifiers[fromChain];

        return exchangeds!.map(record => {
            let fromPair = this.metaDatas.find((value) =>
                value.etid.chainIdentifier.toLowerCase() == record.fromETID.chainIdentifier.toLowerCase() &&
                value.pairContract.toLowerCase() == record.fromETID.exchangePair.toLowerCase()
            );

            let toPair = this.metaDatas.find((value) =>
                value.etid.chainIdentifier.toLowerCase() == record.toETID.chainIdentifier.toLowerCase() &&
                value.pairContract.toLowerCase() == record.toETID.exchangePair.toLowerCase()
            );

            let emitPair = emitChainIdentifier.toLowerCase() == record.fromETID.chainIdentifier.toLowerCase()
                ? record.fromETID.exchangePair
                : record.toETID.exchangePair

            let historyType = emitChainIdentifier.toLowerCase() == record.fromETID.chainIdentifier.toLowerCase()
                ? "Deposit"
                : "Withdraw"

            return {
                emitChainIdentifier: emitChainIdentifier,
                emitPair: emitPair,
                certificateId: toNumber(record.certificateId),
                historyType: historyType,
                time: toNumber(record.time),
                from: {
                    chainIdentifier: record.fromETID.chainIdentifier,
                    account: record.fromAccount,
                    tokenPair: fromPair?.pairContract,
                    tokenAddress: fromPair?.tokenAddress,
                    tokenName: fromPair?.tokenName,
                    tokenSymbol: fromPair?.tokenSymbol,
                    tokenDecimals: fromPair ? toNumber(fromPair.tokenDecimals) : undefined
                },
                to: {
                    chainIdentifier: record.toETID.chainIdentifier,
                    account: record.toAccount,
                    tokenPair: toPair?.pairContract,
                    tokenAddress: toPair?.tokenAddress,
                    tokenName: toPair?.tokenName,
                    tokenSymbol: toPair?.tokenSymbol,
                    tokenDecimals: fromPair ? toNumber(fromPair.tokenDecimals) : undefined
                },
                amount: toBN(record.amount),
                fee: toBN(record.fee),
                feeAdditional: toBN(record.feeAdditional),
                assetProvider: record.assetProvider
            } as ExchangeHistory
        })
    }

    /**
     * 获取历史记录对应的成交状态，一个完整的历史记录由1存1取构成，根据网络标识不同，history对象上的historyType
     * 能编辑该记录属于存入还是取出，如果获取存入订单状态，该方法会尝试去目标网络查询对应的取出历史，如果无法查找到
     * 说明还未处理，若能找到则判断是已那种形式完成了资产的交换
     * 
     * @param history 
     * @returns 
     */
    getExchangeHistoryState = async (history: ExchangeHistory): Promise<CertificateState> => {
        // 提交的交易是一个取出类型说明交易一定是成功的，但是需要进一步判断是什么条件成功的
        if (history.historyType == 'Withdraw') {
            // 资金提供者是目标网络对应的交易对
            if (history.assetProvider.toLowerCase() == history.to.tokenPair.toLowerCase()) {
                return "ExchangedDone"
            }
            // 没有资金提供者，则说明是已欠款完成了交易
            else if (history.assetProvider.toLowerCase() == NullableAddress) {
                return "BorrowAmountDone"
            }
            // 其他类型完成的，都是做市商完成类型
            else {
                return "BadHandlerDone"
            }
        }
        else {
            // history.historyType == "Deposit";
            // 存入类型，需要去目标网络中查看凭证状态，存在凭证则视为成交
            let withdrawHistory = await this.selectExchangeHistory(
                ChainNameFromIdentifier(history.to.chainIdentifier) as ChainName,
                {
                    first: 1,
                    where: {
                        certificateId: history.certificateId,
                        fromETID_: {
                            chainIdentifier: history.from.chainIdentifier,
                            shadowEmiter: history.from.tokenPair,
                        }
                    }
                }
            ).then(rsp => rsp.length > 0 ? rsp[0] : undefined)

            if (withdrawHistory?.historyType != "Withdraw") {
                throw new Error("select target withdraw exechange history has something wrong.");
            }

            if (!withdrawHistory) {
                return "Unused";
            } else {
                return await this.getExchangeHistoryState(withdrawHistory);
            }
        }
    }

    /**
     * 查询在指定网络中，所有关于account的借款信息，做市商可能会借出很多种类的资产，该接口可以一次性返回指定网络中所有的借出信息
     * 
     * @param account 
     */
    getBorrowAmountsOf = (fromChain: ChainName, filter: {
        skip?: number,
        first: number,
        where?: { [key: string]: any },
    }): Promise<{
        amount: BN,
        exchangePair: ExchangePair
    }[]> => {
        let gql = `
        {
            borrowAmounts(
                ${!filter.where ? "" : `where:${JSON.stringify(filter.where).replace(/"(\w+)":/g, '$1:')}`}
                ${!filter.skip ? "skip:0" : `skip: ${filter.skip}`}
                ${!filter.first ? "" : `frist: ${filter.first}`}
            ) {
                amount
                borrower
                pairContract {
                    pairContract
                }
            }
        }
        `;
        return this._clients[fromChain]!.query<{
            borrowAmounts: {
                amount: string,
                borrower: string,
                pairContract: {
                    pairContract: string
                }
            }[]
        }>(gql).then(rsp => rsp.borrowAmounts.map(borrowInfo => {
            return {
                amount: toBN(borrowInfo.amount),
                borrower: borrowInfo.borrower,
                exchangePair: new ExchangePair(
                    this._web3s[fromChain]!,
                    this.metaDatas.find(value =>
                        value.etid.chainIdentifier.toLowerCase() == ChainIdentifiers[fromChain].toLowerCase() &&
                        value.pairContract.toLowerCase() == borrowInfo.pairContract.pairContract.toLowerCase()
                    )!
                )
            }
        }))
    }

    /**
     * 查询超过10分钟还未完成处理的交易
     * 
     * @param pair 
     */
    // selectBadExchange = (pair: ExchangePair) => {
    //     // 获取所有可以兑换到对应Pair的其他网络中的Pair
    //     let fromEtids = pair.fromExchangeTokenIds;

    //     // 查询所有的交换记录
    //     for (let fromEtid of fromEtids) {

    //     }
    // }
}