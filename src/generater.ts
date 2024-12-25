import { ChainIdentifier, ChainName, GraphQlClient } from "@l3chain/sdk";
import { ExchangePairMetadata, ExchangeProviderGroup } from "./entity";

export async function ExchangePairsGenerater(providerGroup: ExchangeProviderGroup): Promise<ExchangePairMetadata[]> {

  const graphURL = Object.keys(providerGroup.providers).reduce((ret, key) => {
    ret[key] = providerGroup.providers[key].graphURL;
    return ret;
  }, {} as Record<ChainName, string>);

  const chainNameFromIdentifier = Object.keys(providerGroup.providers).reduce((ret, key) => {
    ret[providerGroup.providers[key].chainIdentifier.toLowerCase()] = key;
    return ret;
  }, {} as Record<ChainIdentifier, ChainName>);

  /**
   * 获取指定网络中Exchange支持兑换的所有交易对，其中包含了代币的基本信息
   * 
   * @param chainName 网络名称
   * @returns `ExchangePair`
   */
  const getExchangePairs = (chainName: ChainName) => new Promise<ExchangePairMetadata[]>((resolve, reject) => {
    new GraphQlClient(graphURL[chainName]).query(`
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
        `)
      .catch(reject)
      .then(rsp => {
        return resolve(rsp.exchangePairs)
      });
  })

  let paris: { [key: string]: ExchangePairMetadata } = {}
  for (let name of Object.values(chainNameFromIdentifier)) {
    let parisInChain = await getExchangePairs(name);
    parisInChain.forEach((pair) => {
      Object.assign(pair, { toEtid: [] })
      paris[`${name}-${pair.pairContract}`.toLowerCase()] = pair
    })
  }

  for (let key of Object.keys(paris)) {
    let pair = paris[key];
    pair.fromEtid.forEach(etid => {
      paris[`${chainNameFromIdentifier[etid.chainIdentifier.toLowerCase()]}-${etid.shadowEmiter}`.toLowerCase()].toEtid.push(
        pair.etid
      )
    });
  }
  return Promise.resolve(Object.values(paris))
}