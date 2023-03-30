import { ChainName } from '@l3/sdk'

export type ExchangeTokenID = {
    chainIdentifier: string,
    shadowEmiter: string;
    tokenContract: string;
    decimals: number
}