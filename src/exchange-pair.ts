import Web3 from 'web3';
import BN from 'bn.js';

import { toNumber } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { ExchangePairMetadata, ExchangeTokenID } from "./entity";
import { ABI } from './abi';

export class ExchangePair {
    protected _metaData: ExchangePairMetadata;
    get metaData() {
        return this._metaData;
    }

    protected _contract: Contract;
    get contract() {
        return this._contract;
    }

    get contractAddress() {
        return this._metaData.pairContract;
    }

    constructor(web3: Web3, metaData: ExchangePairMetadata) {
        this._metaData = metaData;
        this._contract = new web3.eth.Contract(ABI.Pair, this._metaData.pairContract);
    }


    get toExchangeTokenIds() {
        return this._metaData.toEtid;
    }

    get fromExchangeTokenIds() {
        return this._metaData.fromEtid;
    }

    l3Nonce = (): number => this.contract.methods.l3Nonce().call().then(toNumber);

    tokenBalnaceReserver = (): string | number | BN => this.contract.methods.tokenBalnaceReserver().call();

    borrowAmountOf = (account: string): string | number | BN => this.contract.methods.borrowAmountOf(account).call();

    isDestroyCertificateIdOf = (
        fromChainIdentifier: string,
        fromPairAddress: string,
        certificateId: number,
    ) => this.contract.methods.isDestroyCertificateIdOf(
        fromChainIdentifier,
        fromPairAddress,
        certificateId
    ).call();

    exchangeToEstimateFee = (
        etid: ExchangeTokenID,
        fromAccount: string,
        toAccount: string, amount: string | number | BN
    ): Promise<{
        feeAmount: string | number | BN,
        feeAdditionalAmount: string | number | BN,
        feel3: string | number | BN,
    }> => this.contract.methods.exchangeToEstimateFee(
        etid,
        fromAccount,
        toAccount,
        amount
    ).call();

    acceptExchangeTokenID = () => new Promise<ExchangeTokenID[]>((resolve, reject) => {
        this.contract.methods.acceptExchangeTokenIds()
            .call()
            .then((datas: any) => {
                resolve(datas.map((data: any) => {
                    return {
                        chainIdentifier: data.chainIdentifier,
                        shadowEmiter: data.shadowEmiter,
                        tokenContract: data.tokenContract,
                        decimals: toNumber(data.decimals)
                    }
                }))
            }).catch(reject)
    })
}
