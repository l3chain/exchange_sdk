import Mocha from "mocha";
import { expect } from 'chai'
import { ABI, ExchangePairsGenerater, ExchangeRouter } from "../src"
import Web3 from 'web3';
import { L3Chain } from "@l3chain/sdk";

describe("L3Exchange", function () {

    let config = {
        graphQL: {
            HOST: 'http://l3test.org:8000/subgraphs/name/l3/exchange_host',
            BSC: 'http://l3test.org:8000/subgraphs/name/l3/exchange_bsc'
        },
        providers: {
            HOST: 'http://l3test.org:18545',
            BSC: 'http://l3test.org:38545',
        },
        addresses: {
            factory: {
                HOST: '0x9a6579CA0e9FA2E79d7B0060601d13D698f96550',
                BSC: '0x9a6579CA0e9FA2E79d7B0060601d13D698f96550'
            },
            router: {
                HOST: '0x69a75303f418664B5aDd25bD327d114e92a6F478',
                BSC: '0x69a75303f418664B5aDd25bD327d114e92a6F478'
            }
        }
    }

    let l3 = new L3Chain({
        HOST: {
            web3Provider: new Web3.providers.HttpProvider(config.providers.HOST),
            chainIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
            contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e",
            graphDataBaseHost: "http://l3test.org:8000/subgraphs/name/l3chain/host_database"
        },
        BSC: {
            web3Provider: new Web3.providers.HttpProvider(config.providers.BSC),
            chainIdentifier: "0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473494",
            contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e"
        },
    })

    let exchangePairs;
    let router: ExchangeRouter;
    before(async () => {
        exchangePairs = await ExchangePairsGenerater(config)
        router = new ExchangeRouter({
            ...config,
            l3chain: l3,
            generatedDatas: exchangePairs,
        });
    })


    /**
     * 获取指定网络支持交换的目标网络和代币列表
     */
    it("support exchagne pairs in chain", async () => {
        let supportPairs = router.supportExchangePairs('HOST');
        console.log(supportPairs);
        expect(supportPairs.length).to.be.gt(0);
    })

    /**
     * 在每一个网络的入口合约交易时，对每一笔交易最多会收取三个手续费
     * 1.基础手续费（baseFee）: 每笔跨链交易收取固定数值（主币或主币映射的代币）
     * 2.附加手续费（additionalFee）: 当数量超过设定的阈值后会收取一定比例作为附加手续费（交换的币种）
     * 3.验证费（主币）：3层网络验证需要的费用，其中细分为基本手续费和BytePrice（每字节费用）
     * 
     * 在router中提供了一个单独的接口可以估算一笔交易收取的手续费情况，详见用例
     */
    it("fees", async () => {
        let baseFee = await router.fee('HOST');
        expect(baseFee.token.length).to.be.gt(0);
        expect(baseFee.amount.toString().length).to.be.gt(0);

        let supportPairs = router.supportExchangePairs('HOST');
        let pair = supportPairs[0];
        let additionalFee = await router.feeAdditionalOf(pair);

        let fees = await pair.exchangeToEstimateFee(
            pair.toExchangeTokenIds[0],
            '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3',
            '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3',
            1e12
        );

        // 附加手续费，如果触发了阈值，则为收取的数量，否则为0
        // fees.feeAdditionalAmount

        // 基本手续费
        // fees.feeAmount

        // 验证费
        // fees.feeL3
    })

    /**
     * 交易记录查询
     */
    it("select exchange history", async () => {

        // 给出几个例子,具体的查询条件可以在对应的Graph中查询
        // http://[Host]:8000/subgraphs/name/l3/exchange_host

        // 1.查询Host网络中所有交易对的兑换情况
        let history = await router.selectExchangeHistory('HOST', {
            skip: 0,
            first: 10,
            orderDirection: "asc",
            orderBy: "amount",
        });

        // 2.查询Host网络中指定的交易对的兑换情况
        let history2 = await router.selectExchangeHistory('HOST', {
            skip: 0,
            first: 10,
            orderDirection: "asc",
            orderBy: "time",
            where: {
                fromETID_: {
                    shadowEmiter: router.supportExchangePairs('HOST')[0].contractAddress
                }
            }
        })

        // 3.查询与指定地址相关的交易
        let history3 = await router.selectExchangeHistory('HOST', {
            skip: 0,
            first: 10,
            orderDirection: "asc",
            orderBy: "time",
            where: {
                or: [
                    { fromAccount: "0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3", },
                    { toAccount: "0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3" }
                ]
            }
        })
    });

    /**
    * 获取交易记录状态，有记录不代表交换完成
    */
    it("get exchange history status", async () => {
        let history = await router.selectExchangeHistory('HOST', {
            first: 1
        });
        await router.getExchangeHistoryState(history[0])
    })

    /**
     * 在不同网络之间转换资产会遇到流动性不足的情况，在目标网络流动性不足时，会有做市商来被动提供流动性并且
     * 获得对应的奖励，这些提供的流动性被视Pair的欠款，该方法可以查询本网络中所有交易对的欠款情况，可以组合
     * 查询，也可以查询单个地址
     */
    it("getBorrowAmountsOf", async () => {

        let supportPairs = router.supportExchangePairs('HOST');
        let pair = supportPairs[0];

        // 查询所有地址在Host网络中的借出信息
        await router.getBorrowAmountsOf('HOST', {
            first: 1,
            where: {
                borrower: pair.contractAddress
            }
        })

        // 查询指定Pair的所有借款信息
        await router.getBorrowAmountsOf('HOST', {
            first: 1,
            where: {
                pairContract: pair.contractAddress
            }
        })

        // 查询指定Account在Pair中的借款信息
        await router.getBorrowAmountsOf('HOST', {
            first: 1,
            where: {
                pairContract: pair.contractAddress,
                borrower: "0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3"
            }
        })
    })

    /**
     * 获取存入交易凭证
     */
    it("getDepositedProof", async () => {
        let supportPairs = router.supportExchangePairs('BSC');
        let badTransactions = await router.selectBadExchange(supportPairs[0]);
        await router.getDepositedProof(badTransactions[0]).then(console.log)
    })
});