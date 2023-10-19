import { ChainName, ChainNames, GraphQlClient } from "@l3chain/sdk";
import { ExchangePairMetadata } from "./entity";

export async function ExchangePairsGenerater(graphURL: Record<ChainName, string>): Promise<ExchangePairMetadata[]> {
  /**
   * 获取指定网络中Exchange支持兑换的所有交易对，其中包含了代币的基本信息
   * 
   * @param chainName 网络名称
   * @returns `ExchangePair`
   */
  const getExchangePairs = (chainName: ChainName) => new Promise<ExchangePairMetadata[]>((resolve) => {
    new GraphQlClient(graphURL[chainName]).query<{ exchangePairs: ExchangePairMetadata[] }>(`
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
      paris[`${etid.chainIdentifier.toChainName()}-${etid.shadowEmiter}`.toLowerCase()].toEtid.push(
        pair.etid
      )
    });
  }

  return Promise.resolve(Object.values(paris))
}