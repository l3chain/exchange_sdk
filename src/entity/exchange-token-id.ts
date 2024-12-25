import { ChainIdentifier } from '@l3chain/sdk'

export type ExchangeTokenID = {
    chainIdentifier: ChainIdentifier,
    shadowEmiter: string;
    tokenContract: string;
    decimals: number
}