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

injectionWeb3.eth.getAccounts().then(async accounts => {

    // 获取Pair信息
    console.log(`ExchangePairsGeneratering...`)
    let exchangePairs = await ExchangePairsGenerater(config);
    console.log(`ExchangePairsGenerater successed`)

    // 创建Router
    let router = new ExchangeRouter({
        ...config,
        l3chain: l3,
        generatedDatas: exchangePairs,
    });

    let bscExchanged = await router.selectExchangeHistory("BSC", {
        first: 10,
        where: {
            fromAccount: "0x59432ccB30079E46D76501c870d8F9eaEe927eDc"
        }
    })

    let targetRecord = bscExchanged.find(e => e.certificateId == 676);
    console.log(targetRecord)

    let blockL3 = await l3.getBlockHeadByNumber(1910, "HOST");
    console.log(blockL3);

    let proof = await router.getDepositedProof(targetRecord!);
    console.log(proof)

    // // 获取Exchagne支持的所有Pair
    // let hostPairs = router.supportExchangePairs('HOST');

    // // 获取WBPG的Pair
    // let usePair = hostPairs.find(pair => pair.metaData.tokenSymbol == "WBPG")!

    // console.log(usePair)

    // // 使用第一个目标作为例子
    // let targetEtid = usePair.toExchangeTokenIds[0];

    // let proof = await l3.createL3TransactionProof("BSC", "0x39d61e3d3354966f4bca353158ef3dc342bb3c66687586ef16681456199fcb4c", 86)

    // console.log(proof);

    return Promise.resolve()
})