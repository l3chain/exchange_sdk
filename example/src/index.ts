import { ChainNameFromIdentifier, L3Chain } from "@l3chain/sdk";
import { ABI, ExchangePairsGenerater, ExchangeRouter } from "@l3exchange/sdk"
import { toNumber, toBN, fromWei, toWei } from 'web3-utils';
import Web3 from 'web3';

// Exchange相关配置信息
const exchangeConfig = {
    graphQL: {
        HOST: 'http://l3test.org:8000/subgraphs/name/l3/exchange_host',
        ETH: 'http://l3test.org:8000/subgraphs/name/l3/exchange_eth',
        BSC: 'http://l3test.org:8000/subgraphs/name/l3/exchange_bsc'
    },
    providers: {
        HOST: new Web3.providers.HttpProvider('http://l3test.org:18545'),
        ETH: new Web3.providers.HttpProvider('http://l3test.org:28545'),
        BSC: new Web3.providers.HttpProvider('http://l3test.org:38545'),
    },
    addresses: {
        factory: {
            HOST: '0x35d6b4493b24e25Ec5bb89f944f5108efdD96309',
            ETH: '0xD105277fD763006ED758939477F17587CcE68E95',
            BSC: '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3'
        },
        router: {
            HOST: '0xFe6c094ac4E9f72907bfd4B9034194bB16aD01ab',
            ETH: '0x64c9216152E3373D42FFDFce9CB0D1CD4f01606F',
            BSC: '0x35d6b4493b24e25Ec5bb89f944f5108efdD96309'
        }
    }
}

// L3Chain配置信息
const l3config = {
    HOST: {
        web3Provider: exchangeConfig.providers.HOST,
        contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e",
        graphDataBaseHost: "http://l3test.org:8000/subgraphs/name/l3chain/host_database",
    },
    ETH: {
        web3Provider: exchangeConfig.providers.ETH,
        contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e"
    },
    BSC: {
        web3Provider: exchangeConfig.providers.BSC,
        contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e"
    }
}

const l3 = new L3Chain(l3config);

// 这里使用测试节点，测试节点上所有的账户都是解锁的，在实际使用中，请注意使用window.ethereum中的provider来接入MetaMask或者其他钱包插件
const injectionWeb3 = new Web3(new Web3.providers.HttpProvider('http://l3test.org:18545'));

injectionWeb3.eth.getAccounts().then(async accounts => {

    ////////////////////////////////////////////////////////////////////////////////////
    // 获取Pair信息
    let exchangePairs = await ExchangePairsGenerater(exchangeConfig);
    ////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////
    // 创建Router
    let router = new ExchangeRouter({
        ...exchangeConfig,
        l3chain: l3,
        generatedDatas: exchangePairs,
    });
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 获取Exchagne支持的所有Pair
    let hostPairs = router.supportExchangePairs('HOST');
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 使用支持的第一个Pair作为例子
    let usePair = hostPairs[0];
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 使用第一个目标作为例子
    let targetEtid = usePair.toExchangeTokenIds[0];
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 获取手续费信息
    let fees = await usePair.exchangeToEstimateFee(
        targetEtid,
        accounts[0],
        accounts[8],
        injectionWeb3.utils.toWei('1')
    );
    console.log(fees);
    /*
     * Result {
     *   feeAmount: '1000000000000000000',
     *   feeAdditionalAmount: '0',
     *   feel3: '0'
     * }
     */
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 使用Web3创建合约交互实例
    let fromTokenContract = new injectionWeb3.eth.Contract(ABI.ERC20, usePair.metaData.tokenAddress);
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 完成授权操作
    await fromTokenContract.methods.approve(router.contractAddress.HOST, injectionWeb3.utils.toWei('1')).send({
        from: accounts[0],
    }).then(() => {
        console.log(`Approve Router Successed`);
    })
    ////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////
    // 发起交易,建立Router的合约交互实例
    let routerSender = new injectionWeb3.eth.Contract(ABI.Router, router.contractAddress.HOST!);

    let txSender = routerSender.methods.tokenExchangeToChain(
        usePair.metaData.etid,
        targetEtid,
        accounts[8],
        toWei('1')
    );
    let gas = await txSender.estimateGas({
        from: accounts[0],
        value: toBN(fees.feeAmount.toString()).add(
            toBN(fees.feel3.toString())
        )
    })
    console.log(`tokenExchangeToChain gas: ${gas}`);

    let callret = await txSender.call({
        from: accounts[0],
        value: toBN(fees.feeAmount.toString()).add(
            toBN(fees.feel3.toString())
        )
    })
    console.log(`tokenExchangeToChain call: ${callret.toString()}`)
    // await txSender.send({
    //     from: accounts[0],
    //     gas: gas,
    //     value: toBN(fees.feeAmount.toString()).add(
    //         toBN(fees.feel3.toString())
    //     )
    // }).then(console.log)
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 获取交易记录
    // 更多查询条件: http://l3test.org:8000/subgraphs/name/l3/exchange_host
    let exchangeHistory = await router.selectExchangeHistory('HOST', {
        first: 10,
        orderBy: "time",
        orderDirection: "asc",
        where: {
            fromAccount: accounts[0]
        }
    })

    for (let record of exchangeHistory) {
        let infos = [
            `${ChainNameFromIdentifier(record.from.chainIdentifier)}-${record.from.tokenSymbol}`,
            '/',
            `${ChainNameFromIdentifier(record.to.chainIdentifier)}-${record.to.tokenSymbol}`,
            " ",
            record.from.account,
            ` -> `,
            record.to.account,
            ` : ${fromWei(record.amount)}`,
            ` (${(await router.getExchangeHistoryState(record)).toString()})`
        ]
        console.log(infos.join(''));
    }
})


