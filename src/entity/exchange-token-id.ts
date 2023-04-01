import { ChainName } from '@l3chain/sdk'

export type ExchangeTokenID = {
    chainIdentifier: string,
    shadowEmiter: string;
    tokenContract: string;
    decimals: number
}