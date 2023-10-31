import { ChainName, L3Chain } from "@l3chain/sdk"
import Web3 from "web3"
import { ExchangePairMetadata, ExchangePairsGenerater, ExchangeRouter } from "../src"

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

export function fetchMetaDatas() {
    return ExchangePairsGenerater(Object.keys(config).reduce((ret, chainName) => {
        ret[chainName] = config[chainName].graphURL;
        return ret;
    }, {} as Record<ChainName, string>))
}

export function createRouter(metaDatas: ExchangePairMetadata[]) {
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

    return new ExchangeRouter(l3, {
        generatedDatas: metaDatas,
        chains: { ...config }
    });
}