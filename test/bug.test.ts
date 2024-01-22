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

        router = new ExchangeRouter(l3, {
            generatedDatas: metaDatas,
            chains: { ...config }
        });
    })


    it("getBorrowAmountsOf", async () => {
        let web3 = router.getComponents("ETH").web3;
        let accounts = await web3.eth.getAccounts();

        let fromPair = router.getSupportExchangePairs("ETH").find(pair => pair.metaData.tokenSymbol === "D6T")!;
        let targetETID = fromPair.toExchangeTokenIds[0];
        let builder = await router.createExchangeBuilder('ETH', accounts[0])
            .on('feeAdditionalConfig', (fees) => {

            })
            .on('error', (e) => {

            })
            .on('feeAmountUpgrade', (fees) => {

            })
            .setFromETID(fromPair.etid)
            .setToETID(targetETID)
            .setToAccount(accounts[0])
            .setAmount(toWei('15', "Mwei"))

        builder.isUseBorrowAmount = true;
        let sender = builder.build(web3.currentProvider)
        let tx = await sender.call()
    });

});