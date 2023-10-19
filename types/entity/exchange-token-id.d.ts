import { ChainIdentifier, ChainName } from '@l3chain/sdk';
declare global {
    interface String {
        toChainName(this: ChainIdentifier): ChainName;
    }
}
export type ExchangeTokenID = {
    chainIdentifier: ChainIdentifier;
    shadowEmiter: string;
    tokenContract: string;
    decimals: number;
};
