import "mocha";
import Web3 from 'web3';

import { expect } from 'chai'
import { ABI, ExchangePairsGenerater, ExchangeRouter } from "../src"
import { fromWei, toWei, toBN, toNumber } from "web3-utils";
import { L3Chain, ChainName } from "@l3chain/sdk";

describe("L3Exchange", function () {
    let config = {
        HOST: {
            provider: "http://l3test.org:18545",
            graphURL: "http://l3test.org:8000/subgraphs/name/l3/exchange_host",
            factoryAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
            routerAddress: "0x8142FE663fE28E7aEd9B859C0475C8ef7F3C5539"
        },
        ETH: {
            provider: "http://l3test.org:28545",
            graphURL: "http://l3test.org:8000/subgraphs/name/l3/exchange_eth",
            factoryAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
            routerAddress: "0x8142FE663fE28E7aEd9B859C0475C8ef7F3C5539"
        },
        BSC: {
            provider: "http://l3test.org:38545",
            graphURL: "http://l3test.org:8000/subgraphs/name/l3/exchange_bsc",
            factoryAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
            routerAddress: "0x8142FE663fE28E7aEd9B859C0475C8ef7F3C5539"
        }
    }

    let l3 = new L3Chain({
        graphDataBaseHost: "http://l3test.org:8000/subgraphs/name/l3chain/host_database",
        providers: {
            HOST: {
                web3Provider: new Web3.providers.HttpProvider(config.HOST.provider),
                contractAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
            },
            ETH: {
                web3Provider: new Web3.providers.HttpProvider(config.ETH.provider),
                contractAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
            },
            BSC: {
                web3Provider: new Web3.providers.HttpProvider(config.BSC.provider),
                contractAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0"
            },
        }
    })

    let router: ExchangeRouter;
    before(async () => {
        let metaDatas = await ExchangePairsGenerater(Object.keys(config).reduce((ret, chainName) => {
            ret[chainName] = config[chainName].graphURL;
            return ret;
        }, {} as Record<ChainName, string>))

        console.log(metaDatas)

        router = new ExchangeRouter(l3, {
            generatedDatas: metaDatas,
            chains: { ...config }
        });
    })

    /**
     * 获取指定网络支持交换的目标网络和代币列表
     */
    it("support exchagne pairs in chain", async () => {
        let supportPairs = router.supportExchangePairs('HOST');
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
        expect(additionalFee.thresholdAmount.toString()).to.be.equal('0');
        expect(additionalFee.rate).to.be.equal(0);
        expect(additionalFee.rateWei.toNumber()).to.be.equal(0);

        let fees = await pair.exchangeToEstimateFee(
            pair.toExchangeTokenIds[0],
            '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3',
            '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3',
            1e12
        );

        expect(fees.feeAmount).to.be.eq(toWei('0.001'));
        expect(fees.feeAdditionalAmount.toString()).to.be.eq('0');
        expect(fees.feel3.toString()).to.be.eq('1480000000000000');
    })

    it("selectBadExchange", async () => {
        let web3 = l3.getComponents('HOST').web3;
        let web3BSC = l3.getComponents('BSC').web3;
        let [fromAccount, toAccount] = await web3.eth.getAccounts();

        let fromPair = await router.supportExchangePairs('HOST').find(p => p.metaData.tokenName == 'D18T')!;
        let toPair = await router.supportExchangePairs('BSC').find(p => p.metaData.tokenName == 'D18T')!;

        let badDebts = await router.selectBadExchange(toPair);
        console.log(`badDebts:${badDebts.length}`);
        let proof = await router.getDepositedProof(badDebts[0]);


        let toToken = new web3BSC.eth.Contract(ABI.ERC20, toPair.etid.tokenContract);
        let allowanced = await (toToken.methods.allowance(fromAccount, toPair.contractAddress).call() as Promise<any>).then(toBN);

        if (allowanced.eqn(0)) {
            await toToken.methods.approve(toPair.contractAddress, web3.utils.toWei('10000000')).send({ from: fromAccount });
        }

        // await toPair.exchangeFromProofsWithAddLiquidity([proof], false, {
        //     from: fromAccount,
        //     signerProvider: l3.getComponents('BSC').web3.currentProvider,
        // }).then(console.log)

        await toPair.exchangeFromProof(proof, {
            from: fromAccount,
            signerProvider: l3.getComponents('BSC').web3.currentProvider,
        }).then(console.log)
    })

    it("exchangeToChain", async () => {
        let web3 = l3.getComponents('HOST').web3;
        let [fromAccount, toAccount] = await web3.eth.getAccounts();

        let fromPair = await router.supportExchangePairs('HOST').find(p => p.metaData.tokenName == 'D18T')!;
        let toPair = await router.supportExchangePairs('BSC').find(p => p.metaData.tokenName == 'D18T')!;

        let feeEstimated = await fromPair.exchangeToEstimateFee(
            toPair.metaData.etid,
            fromAccount,
            toAccount,
            toWei('100')
        );

        let builder = await router.createExchangeBuilder('HOST', fromAccount)
            .on('feeAdditionalConfig', (fees) => {
                console.log('feeAdditionalConfig:')
                console.log(fees);
            })
            .on('error', (e) => {
                console.log('error:')
                console.log(e);
            })
            .on('feeAmountUpgrade', (fees) => {
                console.log('feeAmountUpgrade:')
                console.log(fees);
            })
            .setFromETID(fromPair.metaData.etid)
            .setToETID(toPair.metaData.etid)
            .setToAccount(toAccount)
            .setAmount(toWei('100'))

        let sender = builder.build(web3.currentProvider)
        let tx = await sender
            .on('approved', (tx) => {
                console.log('approved:')
                console.log(tx);
            })
            .on('estimateGas', (gas) => {
                console.log('estimateGas:')
                console.log(gas);
            })
            .on('transactionHash', (txHash) => {
                console.log('transactionHash:')
                console.log(txHash);
            })
            .on('receipt', (receipt) => {
                console.log('receipt:')
                console.log(receipt);
            })
            .on('error', (error) => {
                console.log('error:')
                console.log(error);
            })
            .send()
    });

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

        let supportPairs = router.getSupportExchangePairs('HOST');
        let pair = supportPairs[0];

        // 查询所有地址在Host网络中的借出信息
        await router.selectBorrowAmounts('HOST', {
            first: 1,
            where: {
                borrower: pair.contractAddress
            }
        })

        // 查询指定Pair的所有借款信息
        await router.selectBorrowAmounts('HOST', {
            first: 1,
            where: {
                pairContract: pair.contractAddress
            }
        })

        // 查询指定Account在Pair中的借款信息
        await router.selectBorrowAmounts('HOST', {
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