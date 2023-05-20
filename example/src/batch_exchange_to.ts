import { ChainIdentifier, ChainIdentifiers, ChainName, ChainNameFromIdentifier, ChainNames, L3Chain } from "@l3chain/sdk";
import { ABI, ExchangePairsGenerater, ExchangeRouter, ExchangeTokenID } from "@l3exchange/sdk"
import { toNumber, toBN, fromWei, toWei } from 'web3-utils';
import Web3 from 'web3';
import HDWalletProvider from "@truffle/hdwallet-provider";

let config = {
    graphQL: {
        HOST: `${process.env.GRAPH_HOST}/subgraphs/name/l3/exchange_host`,
        BSC: `${process.env.GRAPH_HOST}/subgraphs/name/l3/exchange_bsc`
    },
    providers: {
        HOST: process.env.HOST_RPC as string,
        BSC: process.env.BSC_RPC as string,
    },
    addresses: {
        factory: {
            HOST: '0xAE47E2EA585cF3cFC906a9D9a70c7838e81739EB',
            BSC: '0xAaE65Cd82FaEDdCbCfc604B21C7C8BbDBA321A90'
        },
        router: {
            HOST: '0xF3dCb38C7d9a9068Da47315E64A86DfA4f187679',
            BSC: '0xfd0DbacD866eF04873EaEFF1109C4ab099338514'
        }
    }
}

let l3 = new L3Chain({
    HOST: {
        web3Provider: new Web3.providers.HttpProvider(config.providers.HOST),
        chainIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
        contractAddress: "0xfb93Ba0cE755Ce1f0c6c620BA868FA5F0c9889fb",
        graphDataBaseHost: `${process.env.GRAPH_HOST}/subgraphs/name/l3chain/host_database`,
    },
    BSC: {
        web3Provider: new Web3.providers.HttpProvider(config.providers.BSC),
        chainIdentifier: "0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473494",
        contractAddress: "0x13A656e743a104fFd6b512D0Ab5d9eDF1Ed7049a"
    },
})

const senderProvider = new HDWalletProvider(process.env.TEST_PK as string, process.env.HOST_RPC);
const injectionWeb3 = new Web3(senderProvider);

const BatchTransactionConfig = {
    exchangeAmountMul: toBN(toWei('0.0001')),
    batchCount: 100,
    gasPrice: toBN(toWei('500', 'Gwei'))
}

injectionWeb3.eth.getAccounts().then(async accounts => {

    // 获取Pair信息
    let exchangePairs = await ExchangePairsGenerater(config);

    // 创建Router
    let router = new ExchangeRouter({
        ...config,
        l3chain: l3,
        generatedDatas: exchangePairs,
    });

    // 获取Exchagne支持的所有Pair
    let hostPairs = router.supportExchangePairs('HOST');

    // 获取WBPG的Pair
    let usePair = hostPairs.find(pair => pair.metaData.tokenSymbol == "WBPG")!

    // 使用第一个目标作为例子
    let targetEtid = usePair.toExchangeTokenIds[0];

    // 获取手续费信息
    let fees = await usePair.exchangeToEstimateFee(
        targetEtid,
        senderProvider.getAddress(),
        senderProvider.getAddress(),
        BatchTransactionConfig.exchangeAmountMul
    );

    // 发起交易,建立Router的合约交互实例
    let routerSender = new injectionWeb3.eth.Contract(ABI.Router, router.contractAddress.HOST!);

    // 跨链交易主币
    let txSender = routerSender.methods.coinExchangeToChain(
        usePair.metaData.etid,
        targetEtid,
        senderProvider.getAddress()
    )
    let data = txSender.encodeABI();

    let rawTxs = [];

    let gas = await txSender.estimateGas({
        from: senderProvider.getAddress(),
        value: toBN(fees.feeAmount.toString()).add(
            toBN(fees.feel3.toString())
        ).add(BatchTransactionConfig.exchangeAmountMul)
    }).then(toBN)

    console.log(`Sign ${BatchTransactionConfig.batchCount} transactions...`)
    let nonce = await injectionWeb3.eth.getTransactionCount(senderProvider.getAddress());

    for (let i = 0; i < BatchTransactionConfig.batchCount; i++) {
        let rawTx = await injectionWeb3.eth.signTransaction({
            from: senderProvider.getAddress(),
            to: router.contractAddress.HOST!,
            nonce: nonce,
            value: toBN(fees.feeAmount.toString())
                .add(toBN(fees.feel3.toString()))
                .add(BatchTransactionConfig.exchangeAmountMul.muln(i + 1)),
            data: data,
            gas: gas.muln(2),
            gasPrice: BatchTransactionConfig.gasPrice
        })
        nonce++;
        rawTxs.push(rawTx.raw);
    }
    console.log(`Sign Tx Successed`)

    let sentCount = 0;
    let senders = rawTxs.map(txData => {
        console.log(`Total Sent Count: ${sentCount++}`)
        return injectionWeb3.eth.sendSignedTransaction(txData)
    })

    await Promise.all(senders).then((receipts: any[]) => {
        console.log(`Sent Transaction Hashs:`)
        console.log(receipts.map(r => r.transactionHash))
    })

    return Promise.resolve()
})