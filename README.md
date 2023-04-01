# L3Exchange/SDK

# 简介

《L3Exchange》项目是基于L3Chain作为共识基础，用于验证L3Chain的功能，提供的主要功能是基于L3Chain证明，来证明任何地址在对应的Pair处存入了资产，在其他网络中证明其确实存入了资产，来实现跨网络交换资产的功能。

SDK只提供读相关的功能,实际交易可以从导出的ABI自行构建合约对象进行实际交易的发送。


## Install

```shell
yarn add github:l3chain/exchange_sdk
or
npm add github:l3chain/exchange_sdk
```

## Example

例子中出现的l3test.org并非一个真正的域名，推荐使用本地host来解析到真实的测试服务器。

### 初始化SDK
```typescript
import { L3Chain } from "@l3chain/sdk";
import { 
    ABI, 
    ExchangePairsGenerater, 
    ExchangeRouter 
} from "@l3exchange/sdk"


const l3 = new L3Chain({
    HOST: {
        ...
    },
    ETH: {
        ...
    },
    BSC: {
        ...
    },
})

// 获取所有的交易对,若交易对数量较多，这个过程可能需要较长时间，推荐在发布时，对本对象进行预处理（如生成json文件，从外部链接直接读取等）
const exchangePairs = await ExchangePairsGenerater(config)

const router = new ExchangeRouter({
    ...config,
    l3chain: l3,
    generatedDatas: exchangePairs,
});

```

### 查询本网络支持交换的交易对信息

L3Exchange包含了多个网络，为了更好的标记每一个资产，存在如下结构，这个结构很重要，后面会经常使用到

```typescript
export type ExchangeTokenID = {
    // 网络标识
    chainIdentifier: string,
    // ExchangePair的合约地址
    shadowEmiter: string;
    // 代币合约地址
    tokenContract: string;
    // 精度信息
    decimals: number
}
```

在构建完Router以后，可以在Router中查询支持交换的Pair的基本信息,接口会返回一个或多个[ExchangePair](https://github.com/l3chain/exchange_sdk/src/exchange-pair.ts)对象.

```typescript
let supportPairs = await router.supportExchangePairs('HOST');
```

ExchangePair的MetaData中记录了一些基本信息可以用于判断和展示页面, 特别是toEtid这个成员，代表你选择的Pair可以交换到的目标网络和目标资产信息,这个数据会通过[ExchangePair.toExchangeTokenIds()](https://github.com/l3chain/exchange_sdk/src/exchange-pair.ts#L30)返回

```typescript
export interface ExchangePairMetadata {
    id: string,
    etid: ExchangeTokenID,
    pairContract: string,
    tokenAddress: string,
    tokenDecimals: number | string,
    tokenName: string,
    tokenSymbol: string,
    // Pair接收交换的链外资产
    fromEtid: ExchangeTokenID[],
    // Pair支持交换的目标资产
    toEtid: ExchangeTokenID[],
}
```

### 查询交易手续费

手续费有基本手续费，附加手续费，验证费三个分类，其中基础手续费为固定的链上主币如（bnb,eth）等,附加手续费为单词交易超过设定阈值后加收的部分。验证费是l3网络的使用开销。

一次性获得一笔代币交换交易的手续费信息：
```typescript
let fees = await pair.exchangeToEstimateFee(
    pair.toExchangeTokenIds[0],
    '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3',
    '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3',
    1e12
);
```

更多例子见[测试用例](https://github.com/l3chain/exchange_sdk/test)