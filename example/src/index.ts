import Web3 from "web3";
import { ChainName, L3Chain } from "@l3chain/sdk";
import { ExchangePairsGenerater, ExchangeRouter } from "@l3chain/exchange_sdk"
import { toWei } from "web3-utils";

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

// 获取当前所有支持的资产元数据，改方法返回的metaDatas可以保存为一个json，当资产列表更新不频繁时，可以采取静态文件保存的形式保存
// 方便在后续创建ExchangeRouter对象时候，直接载入，来提高初始化的速度，当元数据数据量较大时候，效率会有明显的提升。
async function fetchMetaDatas() {
    let metaDatas = await ExchangePairsGenerater(Object.keys(config).reduce((ret, chainName) => {
        ret[chainName as ChainName] = config[chainName as ChainName].graphURL;
        return ret;
    }, {} as Record<ChainName, string>))

    console.log(JSON.stringify(metaDatas))

    return metaDatas;
}

async function createExchangeRouter() {
    let metaDatas = await fetchMetaDatas();
    return new ExchangeRouter(l3, {
        generatedDatas: metaDatas,
        chains: { ...config }
    });
}

createExchangeRouter().then(async router => {

    let web3 = router.getComponents("BSC").web3;
    let accounts = await web3.eth.getAccounts();

    let fromPair = router.getSupportExchangePairs("BSC")[0];
    let targetETID = fromPair.toExchangeTokenIds[0];

    let builder = await router.createExchangeBuilder('BSC', accounts[0])
        .on('feeAdditionalConfig', (fees) => {

        })
        .on('error', (e) => {

        })
        .on('feeAmountUpgrade', (fees) => {

        })
        .setFromETID(fromPair.etid)
        .setToETID(targetETID)
        .setToAccount(accounts[0])
        .setAmount(toWei('100'))

    let sender = builder.build(web3.currentProvider)
    let tx = await sender
        .on('approved', (tx) => {

        })
        .on('estimateGas', (gas) => {

        })
        .on('transactionHash', (txHash) => {

        })
        .on('receipt', (receipt) => {

        })
        .on('error', (error) => {

        })
        .send()

})