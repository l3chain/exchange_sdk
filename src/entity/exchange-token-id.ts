import { ChainIdentifier, ChainName, ChainIdentifiers } from '@l3chain/sdk'

declare global {
    interface String {
        toChainName(this: ChainIdentifier): ChainName
    }
}

String.prototype.toChainName = function (this: ChainIdentifier) {
    let nameRecord: any = {}
    nameRecord[ChainIdentifiers.HOST] = "HOST";
    nameRecord[ChainIdentifiers.ETH] = "ETH";
    nameRecord[ChainIdentifiers.BSC] = "BSC";
    return nameRecord[this] as ChainName;
}

export type ExchangeTokenID = {
    chainIdentifier: ChainIdentifier,
    shadowEmiter: string;
    tokenContract: string;
    decimals: number
}