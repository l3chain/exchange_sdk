# 数据例子和解释

```javascript
{
    // 交易记录ID
    id: '0xfefd514eb5724a9b37af62d2e96e18b761f49588befa197f373f0bd7be092c0e-5',
    // 交易来源网络
    emitChainIdentifier: '0x0000000000000000000000000000000000000000000000000000000000000000',
    // 来源交易对
    emitPair: '0xe8bd7af7baba2f84a0355f067a8ee877205aa326',
    // L3凭证ID
    certificateId: 0,
    // 类型Deposit为存入交易，Withdraw为取出交易，Deposit交易是前端发起的exchagneTo触发，Withdraw交易是到账服务器触发只有这两个类型
    historyType: 'Deposit',
    // 时间
    time: 1681236258,
    // 来源侧信息
    from: {
        // 来源网络
      chainIdentifier: '0x0000000000000000000000000000000000000000000000000000000000000000',
      // 发起地址
      account: '0xaff1ac02842b4d46e93ea2143a103258fbbb1c12',
      // 交易的Pair地址
      tokenPair: '0xe8bd7af7baba2f84a0355f067a8ee877205aa326',
      // 交易的代币地址
      tokenAddress: '0xb9467ba1a91cee4a2bb3807bab25c582afdc1ddc',
      // 交易的代币全称
      tokenName: 'USDTokenMock',
      // 交易的代币符号
      tokenSymbol: 'USDT',
      // 交易的代币精度
      tokenDecimals: 18
    },
    // 同from一致
    to: ...,
    // 交易数量
    amount: BN,
    // 收取基本手续费数量
    fee: BN,,
    // 收取的附加手续费数量
    feeAdditional,
    // 资金提供者（前端暂不需要使用）
    assetProvider: '0xaff1ac02842b4d46e93ea2143a103258fbbb1c12'
  }
]
```