# L3Exchange/SDK

# 简介

《L3Exchange》项目是基于L3Chain作为共识基础，用于验证L3Chain的功能，提供的主要功能是基于L3Chain证明，来证明任何地址在对应的Pair处存入了资产，在其他网络中证明其确实存入了资产，来实现跨网络交换资产的功能。

在使用时需要额外注意同时查询的是多个网络中的数据，大部分返回的数据中都有chainIdentifier作为网络标记，用来区分这个数据的来源是哪里，SDK中为了方便使用，接口大部分使用的是ChainName这个结构
```typescript
export ChainName = "HOST" | "BSC" | "ETH"
```

为了方便ChainIdentifier和ChainName之间的转换你可以使用

```typescript
import { 
    ChainIdentifiers, 
    ChainName, 
    ChainNameFromIdentifier, 
    ChainNames 
} from '@l3chain/sdk';

// 所有当前支持的网络名称
console.log(ChainNames);
for (let chianName of ChainNames) {
    ...
}

// ChainName To ChainIdentifier
ChainIdentifiers.HOST,
ChainIdentifiers.BSC,
ChainIdentifiers.ETH
// 更推荐下面的写法，因为网络可能会增加
ChainIdentifiers["HOST"]
ChainIdentifiers["BSC"]
ChainIdentifiers["ETH"]

// ChainIdentifier To ChainName
ChainNameFromIdentifier("[identifier]")

```

SDK只提供读相关的功能,实际交易可以从导出的ABI自行构建合约对象进行实际交易的发送。

比如使用web3作为交互模块，需要发送交易,可能会有类似如下的代码

```typescript

import Web3 from 'web3';
import { ABI } from "@l3exchange/sdk";

const web3 = new Web3(window.ethereum);

// ERC20标准ABI
const token = new web3.eth.Contract(ABI.ERC20, "${Address}");

// ExchangeFactory
const factory = new web3.eth.Contract(ABI.Factory, "${Address}");

// 调用ExchangeFactory的合约接口
factory.methods.pairOf(token._address).then(console.log);

```


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

在构建完Router以后，可以在Router中查询支持交换的Pair的基本信息,接口会返回一个或多个[ExchangePair](https://github.com/l3chain/exchange_sdk/blob/master/src/exchange-pair.ts)对象.

```typescript
let supportPairs = await router.supportExchangePairs('HOST');
```

ExchangePair的MetaData中记录了一些基本信息可以用于判断和展示页面, 特别是toEtid这个成员，代表你选择的Pair可以交换到的目标网络和目标资产信息,这个数据会通过[ExchangePair.toExchangeTokenIds()](https://github.com/l3chain/exchange_sdk/blob/master/src/exchange-pair.ts#L30)返回

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

### 一个综合的例子

SDK只提供了读和查询功能，在实际的合约交互时，需要用户自行构建交易对象，这里有一个使用web3js的通讯例子[Example](https://github.com/l3chain/exchange_sdk/blob/master/example)


### 手续费相关描述

跨链桥在使用时，有可能需要支付的所有费用如下

#### 1.跨链桥基本手续费

```typescript
//每次使用跨链桥的代币交换时按照每笔交易收取，收取的币种为链上主币（ETH，BNB）

let fee = await router.fee("HOST" | "BSC" | ...)

fee.amount
```

#### 2.跨链桥附加手续费

```typescript
// 在交换某个币种时，若一次性交换的数量大于设定的阈值T，则需要加收当比交易一个百分比

let exchangeAmount = toBN(toWei('1000'));

let feeAdditional = await router.feeAdditionalOf(pair)

let fee2 = exchangeAmount.gt(feeAdditional.thresholdAmount) 
    ? exchangeAmount.mul(feeAdditional.rateWei).div(toBN(1e12))
    : toBN(0)

```

#### 3.验证费用

可以使用下面接口一次获得所有手续费参数

```typescript
// 跨链桥的下层还有一个三层网络，此费用是三层网络需要支付，由于是一个动态数值，所以提供了一个方法在最终构成交易后才可以计算出准确数值,这个方法也可以用于一次性获取三个类型的手续费
// 获取手续费信息
let fees = await usePair.exchangeToEstimateFee(
    targetEtid,
    accounts[0],
    accounts[8],
    injectionWeb3.utils.toWei('1')
);
console.log(fees);

// Returns
Result {
    feeAmount: '1000000000000000000', // 基础手续费
    feeAdditionalAmount: '0', // 附加手续费（如果有）
    feel3: '0' // 验证费
}
```