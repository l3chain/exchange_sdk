import { ChainName, ChainNames, GraphQlClient, ChainIdentifier, ChainIdentifiers, ChainNameFromIdentifier } from "@l3/sdk";

import Web3 from "web3";
import { provider } from 'web3-core';
import { ExchangePair } from "./exchange-pair";
import { ExchangePairMetadata, ExchangeTokenID } from "./entity";

export async function ExchangePairsGenerater(props: {
    graphQL: { [key in ChainName]: string },
    providers: { [key in ChainName]: provider }
}): Promise<ExchangePairMetadata[]> {
    const { graphQL, providers } = props;

    let clients: { [key in ChainName]?: GraphQlClient } = {}
    let web3s: { [key in ChainName]?: Web3 } = {}
    for (let name of ChainNames) {
        clients[name] = new GraphQlClient(graphQL[name as ChainName]);
        web3s[name] = new Web3(providers[name as ChainName]);
    }

    /**
     * 获取指定网络中Exchange支持兑换的所有交易对，其中包含了代币的基本信息
     * 
     * @param chainName 网络名称
     * @returns `ExchangePair`
     */
    const getExchangePairs = (chainName: ChainName) => new Promise<ExchangePairMetadata[]>((resolve) => {
        clients[chainName]?.query<{ exchangePairs: ExchangePairMetadata[] }>(`
        {
            exchangePairs {
              id
              pairContract
              tokenAddress
              tokenDecimals
              tokenName
              tokenSymbol
              etid {
                id
                chainIdentifier
                shadowEmiter
                tokenContract
                decimals
              }
              fromEtid:acceptETIDs {
                id
                chainIdentifier
                shadowEmiter
                tokenContract
                decimals
              }
            }
          }
        `).then(rsp => resolve(rsp.exchangePairs));
    })

    let paris: { [key: string]: ExchangePairMetadata } = {}
    for (let name of ChainNames) {
        let parisInChain = await getExchangePairs(name);
        parisInChain.forEach((pair) => {
            Object.assign(pair, { toEtid: [] })
            paris[`${name}-${pair.pairContract}`.toLowerCase()] = pair
        })
    }

    for (let key of Object.keys(paris)) {
        let pair = paris[key];
        pair.fromEtid.forEach(etid => {
            paris[`${ChainNameFromIdentifier(etid.chainIdentifier)}-${etid.shadowEmiter}`.toLowerCase()].toEtid.push(
                pair.etid
            )
        });
    }

    return Promise.resolve(Object.values(paris))
}