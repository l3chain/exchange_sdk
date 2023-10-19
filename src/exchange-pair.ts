import Web3 from 'web3';
import BN from 'bn.js';

import { TransactionProof } from '@l3chain/sdk';
import { toNumber, toBN } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { ExchangePairMetadata, ExchangeTokenID } from "./entity";
import { ABI } from './abi';
import { provider } from 'web3-core';

export type ProviderOptions = {
    signerProvider: provider,
    from: string,
    gasPrice?: number | BN | string,
    gasLimit?: number | BN | string,
    gasMutiple?: number
}

export class ExchangePair {

    private _isMintBurnPairPromise: Promise<boolean>;

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
        this._isMintBurnPairPromise = this._contract.methods.isMintBurnPair().call() as Promise<boolean>;
    }

    get toExchangeTokenIds() {
        return this._metaData.toEtid;
    }

    get fromExchangeTokenIds() {
        return this._metaData.fromEtid;
    }

    get etid() {
        return this._metaData.etid;
    }

    l3Nonce = (): number => this.contract.methods.l3Nonce().call().then(toNumber);

    tokenBalnaceReserver = (): Promise<BN> => this.contract.methods.tokenBalnaceReserver().call().then(toBN);

    borrowAmountOf = (account: string): Promise<BN> => this.contract.methods.borrowAmountOf(account).call().then(toBN);

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

    private _send = async (caller: any, options: ProviderOptions) => {
        let gas: number | undefined = undefined;
        if (!options.gasLimit) {
            gas = await caller.estimateGas({ from: options.from });
            gas = Math.floor(gas! * (options.gasMutiple ? options.gasMutiple : 1.2))
        }

        return caller.call({
            from: options.from,
            gas: gas ? gas : options.gasLimit,
            gasPrice: options.gasPrice
        })

        // return caller.send({
        //     from: options.from,
        //     gas: gas ? gas : options.gasLimit,
        //     gasPrice: options.gasPrice
        // });
    }

    depositBorrowAmount = (amount: BN | string | number, options: ProviderOptions) => new Promise<any>(async (resolve, reject) => {

        if (await this._isMintBurnPairPromise) {
            return reject("EPair: MintBurnPair not support baddebts API");
        }

        let web3 = new Web3(options.signerProvider);
        let token = new web3.eth.Contract(ABI.ERC20, this.metaData.etid.tokenContract);

        let allowanced = await (token.methods.allowance(options.from, this.metaData.pairContract).call().catch() as Promise<BN>);
        if (!allowanced) {
            return reject("EPair: request token allowance quota failed");
        }

        if (allowanced.lt(toBN(amount.toString()))) {
            return reject("EPair: insufficient allowanced limit");
        }

        try {
            let pairContract = new web3.eth.Contract(ABI.Pair, this.metaData.pairContract);
            let caller = pairContract.methods.depositBorrowAmount(amount.toString());
            return this._send(caller, options);
        }
        catch (e) {
            return reject(e);
        }
    })

    withdrawBorrowAmount = (toAccount: string, amount: BN | string | number, options: ProviderOptions) => new Promise<any>(async (resolve, reject) => {

        if (await this._isMintBurnPairPromise) {
            return reject("EPair: MintBurnPair not support baddebts API");
        }

        let web3 = new Web3(options.signerProvider);
        let borrowBalance = await this.borrowAmountOf(options.from);

        if (borrowBalance.lt(toBN(amount.toString()))) {
            return reject("EPair: insufficient borrow amount");
        }

        try {
            let pairContract = new web3.eth.Contract(ABI.Pair, this.metaData.pairContract);
            let caller = pairContract.methods.withdrawBorrowAmount(
                toAccount,
                amount.toString()
            );
            return this._send(caller, options);
        }
        catch (e) {
            return reject(e);
        }
    })

    sync = (options: ProviderOptions) => new Promise<void>(async (resolve, reject) => {

        if (await this._isMintBurnPairPromise) {
            return reject("EPair: MintBurnPair not support baddebts API");
        }

        let web3 = new Web3(options.signerProvider);
        try {
            let pairContract = new web3.eth.Contract(ABI.Pair, this.metaData.pairContract);
            let caller = pairContract.methods.sync();
            return this._send(caller, options);
        } catch (e) {
            return reject(e);
        }
    })

    exchangeFromProof = (proof: TransactionProof, options: ProviderOptions) => new Promise<void>(async (resolve, reject) => {
        let web3 = new Web3(options.signerProvider);
        try {
            let pairContract = new web3.eth.Contract(ABI.Pair, this.metaData.pairContract);
            let caller = pairContract.methods.exchangeFromProof(proof);
            return this._send(caller, options);
        } catch (e) {
            return reject(e);
        }
    })

    exchangeFromProofsWithAddLiquidity = (proofs: TransactionProof[], ignoreRewards: boolean, options: ProviderOptions) => new Promise<void>(async (resolve, reject) => {
        if (await this._isMintBurnPairPromise) {
            return reject("EPair: MintBurnPair not support baddebts API");
        }

        let web3 = new Web3(options.signerProvider);
        try {
            let pairContract = new web3.eth.Contract(ABI.Pair, this.metaData.pairContract);
            let caller = pairContract.methods.exchangeFromProofsWithAddLiquidity(proofs, ignoreRewards);
            return this._send(caller, options);
        } catch (e) {
            return reject(e);
        }
    })
}
