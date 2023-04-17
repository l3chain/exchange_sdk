import { ChainIdentifier, ChainIdentifiers, ChainName, ChainNameFromIdentifier, ChainNames, L3Chain } from "@l3chain/sdk";
import { ABI, ExchangePairsGenerater, ExchangeRouter, ExchangeTokenID } from "@l3exchange/sdk"
import { toNumber, toBN, fromWei, toWei } from 'web3-utils';
import Web3 from 'web3';

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


let networkName: { [key: ChainIdentifier]: string } = {
    '0x0000000000000000000000000000000000000000000000000000000000000000': 'PG Network',
    '0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473494': 'Ethereum Network Main',
    '0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473499': 'BNB Smart Chain',
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

// 这里使用测试节点，测试节点上所有的账户都是解锁的，在实际使用中，请注意使用window.ethereum中的provider来接入MetaMask或者其他钱包插件
const injectionWeb3 = new Web3(new Web3.providers.HttpProvider('http://l3test.org:18545'));

injectionWeb3.eth.getAccounts().then(async accounts => {

    ////////////////////////////////////////////////////////////////////////////////////
    // 获取Pair信息
    let exchangePairs = await ExchangePairsGenerater(config);
    ////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////
    // 创建Router
    let router = new ExchangeRouter({
        ...config,
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
    let usePair = hostPairs.find(p => p.metaData.tokenSymbol == 'USDT')!;
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 使用第一个目标作为例子
    let targetEtid = usePair.toExchangeTokenIds[0];
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 查询目标Pair
    let targetPairs = usePair.toExchangeTokenIds.map(toETID =>
        exchangePairs.find(e =>
            e.etid.chainIdentifier == toETID.chainIdentifier &&
            e.etid.shadowEmiter == toETID.shadowEmiter &&
            e.etid.tokenContract == toETID.tokenContract
        )!
    )

    console.log(targetPairs)
    console.log(targetPairs.map(p => ChainNameFromIdentifier(p.etid.chainIdentifier)))

    // let target: { [key: ChainName]: ExchangeTokenID[] } = {}
    // for (let chainName of ChainNames) {
    //     let chainIdentifier = ChainIdentifiers[chainName];
    //     if (!chainIdentifier) {
    //         continue;
    //     }
    //     target[chainName] = targetPairs.filter(p => p.etid.chainIdentifier == chainIdentifier).map(p => Object.assign(p.etid, {
    //         tokenName: p.tokenName,
    //         tokenSymbol: p.tokenSymbol,
    //         tokenAddress: p.tokenAddress,
    //         tokenDecimals: p.tokenDecimals
    //     }))
    // }

    // console.log(target)

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
        '0x8f53ACD8311564d873A2fd38473147770409d1F8',
        toWei('1')
    );

    console.log('--------------------------------------------')
    console.log(
        usePair.metaData.etid,
        targetEtid,
        '0x8f53ACD8311564d873A2fd38473147770409d1F8',
        toWei('1')
    )
    console.log('--------------------------------------------')

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


