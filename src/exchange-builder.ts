import Web3 from 'web3';
import BN from 'bn.js';

import { EventEmitter } from "events";
import { toNumber, toBN } from 'web3-utils';
import { provider } from 'web3-core';
import { ChainName } from '@l3chain/sdk';

import { ABI } from './abi';
import { ExchangeTokenID } from "./entity";
import { ExchangeRouter } from './exchange-router';

let isEqualETID = (a: ExchangeTokenID, b: ExchangeTokenID) => {
    for (let key of Object.keys(a)) {
        // @ts-ignore
        if (a[key] != b[key]) {
            return false;
        }
    }
    return false;
}

export class ExchangeTransactionBuilderEmitter<T extends Record<string | symbol, any>> extends EventEmitter {
    on<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this {
        return super.on(eventName as string, listener);
    }

    once<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this {
        return super.once(eventName as string, listener);
    }

    listeners<K extends keyof T>(eventName: K): Function[] {
        return super.listeners(eventName as string);
    }

    listenerCount<K extends keyof T>(eventName: K): number {
        return super.listenerCount(eventName as string);
    }

    addListener<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this {
        return super.addListener(eventName as string, listener);
    }

    removeListener<K extends keyof T>(eventName: K, listener: (...args: T[K][]) => void): this {
        return super.removeListener(eventName as string, listener);
    }
}

type ExchangeTransactionPayload = {
    fromAccount: string,
    toAccount: string,
    fromETID: ExchangeTokenID,
    toETID: ExchangeTokenID,
    amount: BN,
}

export const ExchangeTransactionErrors = {
    INSUFFICIENT_BALANCE: new Error('ETErrors: INSUFFICIENT_BALANCE'),
    INVAILD_PAYLOAD: new Error('ETErrors: INVAILD_PAYLOAD'),
    INSUFFICIENT_BORROW_AMOUNT_BALANCE: new Error('ETErrors: INSUFFICIENT_BORROW_AMOUNT_BALANCE'),
}

abstract class ExchangeTransactionSender extends ExchangeTransactionBuilderEmitter<{
    transactionHash: (hash: string) => void,
    estimateGas: (gas: number) => void,
    error: (e: Error) => void,
    approved: (tx: any) => void,
    receipt: (receipt: any) => void,
}> {
    abstract send(): Promise<any>;
    abstract call(): Promise<any>;
}

export class ExchangeBorrowTransactionSender extends ExchangeTransactionSender {

    exchangeCaller: any;
    exchangeParams: any;

    loader: any;

    senderOptions: {
        gasPrice: BN | number | string | undefined,
        gasMultiple: number,
    };

    constructor(
        exchangeRouter: ExchangeRouter,
        signerProvider: provider,
        payload: ExchangeTransactionPayload,
        options: {
            gasPrice: BN | number | string | undefined,
            gasMultiple: number,
        } = { gasPrice: undefined, gasMultiple: 1.2 }
    ) {
        super();

        let { fromETID, fromAccount, toETID, toAccount, amount } = payload;
        this.senderOptions = options;

        let web3 = new Web3(signerProvider);
        let compments = exchangeRouter.getComponents(fromETID.chainIdentifier.toChainName());
        if (!compments) {
            throw new Error("ETSender: InvaildFromChainIdentifier")
        }

        let factoryAddress = (compments.factory as any)._address;
        let factory = new web3.eth.Contract(ABI.Factory, factoryAddress);

        this.loader = Promise.all([
            factory.methods.pairOf(fromETID.tokenContract).call() as Promise<string>,
            web3.eth.getBalance(fromAccount).then(toBN) as Promise<BN>,
            exchangeRouter.getEstimateFee(payload)
        ]).then(async rets => {
            let [pairAddress, coinBalance, fees] = rets;

            let pair = new web3.eth.Contract(ABI.Pair, pairAddress);

            let borrowAmountBalance = await pair.methods.borrowAmountOf(fromAccount).call().then(toBN);

            console.log(amount.toString())

            if (borrowAmountBalance.lt(amount)) {
                this.emit("error", ExchangeTransactionErrors.INSUFFICIENT_BORROW_AMOUNT_BALANCE)
                return;
            }

            if (coinBalance.lt(fees.feel3.add(fees.feeAmount))) {
                this.emit("error", ExchangeTransactionErrors.INSUFFICIENT_BALANCE)
                return;
            }

            // exchangeToUseBorrowAmount(ExchangeTokenId, address, uint256)
            this.exchangeCaller = pair.methods.exchangeToUseBorrowAmount(toETID, toAccount, amount);
            this.exchangeParams = {
                from: fromAccount,
                gasPrice: options.gasPrice,
                value: fees.feel3.add(fees.feeAmount),
            }
        })
    }

    async call(): Promise<any> {
        await this.loader;

        if (!this.exchangeCaller) {
            this.emit('error', ExchangeTransactionErrors.INVAILD_PAYLOAD)
            return Promise.reject(ExchangeTransactionErrors.INVAILD_PAYLOAD);
        }

        let gas = await this.exchangeCaller.estimateGas(this.exchangeParams);
        this.emit('estimateGas', toNumber(gas));

        return this.exchangeCaller.call({
            ...this.exchangeParams,
            gasPrice: this.senderOptions.gasPrice,
            gas: Math.floor(toNumber(gas) * this.senderOptions.gasMultiple),
        })
    }

    async send(): Promise<any> {

        await this.loader;

        if (!this.exchangeCaller) {
            this.emit('error', ExchangeTransactionErrors.INVAILD_PAYLOAD)
            return Promise.reject(ExchangeTransactionErrors.INVAILD_PAYLOAD);
        }

        let gas = await this.exchangeCaller.estimateGas(this.exchangeParams);
        this.emit('estimateGas', toNumber(gas));

        return this.exchangeCaller.send({
            ...this.exchangeParams,
            gasPrice: this.senderOptions.gasPrice,
            gas: Math.floor(toNumber(gas) * this.senderOptions.gasMultiple),
        })
            .on('transactionHash', (txHash: string) => {
                this.emit('transactionHash', txHash)
            })
            .on('receipt', (receipt: any) => {
                this.emit('receipt', receipt)
            })
            .on('error', (error: any) => {
                this.emit('error', error)
            })
    }
}

export class ExchangeBalanceTransactionSender extends ExchangeTransactionSender {
    approveCaller: any;
    approveParams: any;

    exchangeCaller: any;
    exchangeParams: any;

    loader: any;

    senderOptions: {
        gasPrice: BN | number | string | undefined,
        gasMultiple: number,
    };

    constructor(
        exchangeRouter: ExchangeRouter,
        signerProvider: provider,
        payload: ExchangeTransactionPayload,
        options: {
            gasPrice: BN | number | string | undefined,
            gasMultiple: number,
        } = { gasPrice: undefined, gasMultiple: 1.2 }
    ) {
        super();

        this.senderOptions = options;

        let { fromETID, fromAccount, toETID, toAccount, amount } = payload;

        let web3 = new Web3(signerProvider);
        let compments = exchangeRouter.getComponents(fromETID.chainIdentifier.toChainName());
        if (!compments) {
            throw new Error("ETSender: InvaildFromChainIdentifier")
        }

        let routerAddress = (compments.router as any)._address;
        let fromToken = new web3.eth.Contract(ABI.ERC20, fromETID.tokenContract);
        let router = new web3.eth.Contract(ABI.Router, routerAddress);

        this.loader = Promise.all([
            web3.eth.getBalance(fromAccount).then(toBN) as Promise<BN>,
            fromToken.methods.balanceOf(fromAccount).call().then(toBN) as Promise<BN>,
            fromToken.methods.allowance(fromAccount, routerAddress).call().then(toBN) as Promise<BN>,
            exchangeRouter.getEstimateFee(payload),
            router.methods.WCOIN().call() as Promise<string>
        ]).then(async rets => {
            let [coinBalance, fromTokenBalance, fromTokenAllowanced, fees, wcoinAddress] = rets;

            let isWCOIN = wcoinAddress.replace('0x', '').toLocaleLowerCase() == fromETID.tokenContract.replace('0x', '').toLocaleLowerCase();

            if (!isWCOIN) {
                if (fromTokenBalance.lt(amount)) {
                    this.emit("error", ExchangeTransactionErrors.INSUFFICIENT_BALANCE)
                    return;
                }

                if (fromTokenAllowanced.lt(amount)) {
                    this.approveCaller = fromToken.methods.approve(routerAddress, amount.sub(fromTokenAllowanced));
                    this.approveParams = {
                        from: fromAccount,
                        gasPrice: options.gasPrice
                    };
                }
            } else {
                if (coinBalance.lt(fees.feel3.add(fees.feeAmount))) {
                    this.emit("error", ExchangeTransactionErrors.INSUFFICIENT_BALANCE)
                    return;
                }

                this.emit('approved')
            }

            this.exchangeCaller = isWCOIN
                // coinExchangeToChain((bytes32,address,address,uint8),(bytes32,address,address,uint8),address)
                ? router.methods['0x384fb85a'](fromETID, toETID, toAccount)

                // tokenExchangeToChain((bytes32,address,address,uint8),(bytes32,address,address,uint8),address,uint256)
                : router.methods['0x311a5a09'](fromETID, toETID, toAccount, amount)

            this.exchangeParams = {
                from: fromAccount,
                gasPrice: options.gasPrice,
                value: isWCOIN
                    ? amount.add(fees.feel3).add(fees.feeAmount)
                    : fees.feel3.add(fees.feeAmount),
            }
        })
    }

    async call(): Promise<any> {
        await this.loader;

        if (!this.exchangeCaller) {
            this.emit('error', ExchangeTransactionErrors.INVAILD_PAYLOAD)
            return Promise.reject(ExchangeTransactionErrors.INVAILD_PAYLOAD);
        }

        let gas = await this.exchangeCaller.estimateGas(this.exchangeParams);
        this.emit('estimateGas', toNumber(gas));

        return this.exchangeCaller.call({
            ...this.exchangeParams,
            gasPrice: this.senderOptions.gasPrice,
            gas: Math.floor(toNumber(gas) * this.senderOptions.gasMultiple),
        })
    }

    async send(): Promise<any> {

        await this.loader;

        if (!this.exchangeCaller) {
            this.emit('error', ExchangeTransactionErrors.INVAILD_PAYLOAD)
            return Promise.reject(ExchangeTransactionErrors.INVAILD_PAYLOAD);
        }

        if (this.approveCaller) {
            let approveTx = await this.approveCaller.send(this.approveParams);
            this.emit('approved', approveTx);
        }

        let gas = await this.exchangeCaller.estimateGas(this.exchangeParams);
        this.emit('estimateGas', toNumber(gas));

        return this.exchangeCaller.send({
            ...this.exchangeParams,
            gasPrice: this.senderOptions.gasPrice,
            gas: Math.floor(toNumber(gas) * this.senderOptions.gasMultiple),
        })
            .on('transactionHash', (txHash: string) => {
                this.emit('transactionHash', txHash)
            })
            .on('receipt', (receipt: any) => {
                this.emit('receipt', receipt)
            })
            .on('error', (error: any) => {
                this.emit('error', error)
            })
    }
}

export class ExchangeTransactionBuilder extends ExchangeTransactionBuilderEmitter<{
    error: (e: any) => void,
    feeAdditionalConfig: (fees: {
        thresholdAmount: string | number | BN;
        rateWei: BN;
        rate: number;
    }) => void,
    feeAmountUpgrade: (fees: {
        feeAmount: BN,
        feeAdditionalAmount: BN,
        feel3: BN
    }) => void,
}> {

    private feeExchange: Promise<{
        token: string,
        amount: string | number | BN,
    }> | undefined;

    private feeAdditionalConfig: Promise<{
        thresholdAmount: string | number | BN;
        rateWei: BN;
        rate: number;
    }> | undefined

    private feeL3: Promise<BN> | undefined;

    private readonly router: ExchangeRouter;

    private payload: Partial<ExchangeTransactionPayload>

    public isUseBorrowAmount: boolean = false;

    get fromAccount() {
        return this.payload.fromAccount;
    }

    get toAccount() {
        return this.payload.toAccount;
    }

    get fromETID() {
        return this.payload.fromETID;
    }

    get toETID() {
        return this.payload.toETID;
    }

    get amount() {
        return this.payload.amount;
    }

    constructor(router: ExchangeRouter, props: {
        fromChain: ChainName
        fromAccount: string,
    }) {
        super();

        let { fromAccount, fromChain } = props;
        let compments = router.getComponents(fromChain);
        if (!compments) {
            throw new Error("ETBuilder: InvaildFromChainIdentifier")
        }
        this.router = router;
        this.payload = {
            fromAccount
        }
    }

    private _updateFee() {
        Promise.all([
            this.feeAdditionalConfig,
            this.feeExchange,
            this.feeL3
        ]).catch(e => {
            this.emit("error", e)
        }).then(ret => {
            if (!ret || !ret[0] || !ret[1] || !ret[2]) {
                return;
            }

            this.emit("feeAdditionalConfig", ret[0]);
            this.emit("feeAmountUpgrade", {
                feel3: ret[2],
                feeAmount: toBN(ret[1].amount.toString()),
                feeAdditionalAmount:
                    this.payload.amount && this.payload.amount.gte(toBN(ret[0].thresholdAmount.toString()))
                        ? this.payload.amount.mul(ret[0].rateWei).divn(1e12)
                        : toBN(0),
            })
        })
    }

    setFromETID(etid: ExchangeTokenID): this {
        if (this.payload.fromETID && isEqualETID(this.payload.fromETID, etid)) {
            return this;
        }

        this.payload.fromETID = etid;
        this.feeAdditionalConfig = this.router.getFeeAdditionalOf(this.payload.fromETID);
        this.feeExchange = this.router.getBaseFee(etid.chainIdentifier.toChainName());
        this.feeL3 = this.router.getEstimateFee({
            fromAccount: this.payload.fromAccount!,
            toAccount: this.payload.fromAccount!,
            fromETID: etid,
            toETID: etid,
            amount: 0
        }).then(r => r.feel3)

        this._updateFee();

        return this;
    }

    setToETID(etid: ExchangeTokenID): this {
        if (this.payload.toETID && isEqualETID(this.payload.toETID, etid)) {
            return this;
        }

        this.payload.toETID = etid;
        if (this.payload.amount == undefined) {
            this.payload.amount = toBN(0);
        }

        return this;
    }

    setToAccount(account: string): this {
        if (this.payload.toAccount && this.payload.toAccount == account) {
            return this;
        }

        this.payload.toAccount = account;
        return this;
    }

    setAmount(amount: BN | string): this {
        if (this.payload.amount && this.payload.amount.eq(toBN(amount.toString()))) {
            return this;
        }
        this.payload.amount = toBN(amount.toString());
        if (!this.feeAdditionalConfig || !this.feeL3 || !this.feeExchange) {
            throw new Error("ETBuilder: befor call \'setAmount\', must be called \"setFromETID\"");
        }

        this._updateFee()

        return this;
    }

    build(signerProvider: provider, options: {
        gasPrice: number | BN | string | undefined,
        gasMultiple: number,
    } = {
            gasPrice: undefined,
            gasMultiple: 1.2
        }
    ): ExchangeTransactionSender {

        if (!this.payload.amount || !this.payload.fromETID || !this.payload.toAccount || !this.payload.toETID) {
            throw new Error("ETBuilder: invaild payload datas");
        }

        return this.isUseBorrowAmount
            ? new ExchangeBorrowTransactionSender(
                this.router,
                signerProvider,
                this.payload as ExchangeTransactionPayload, options
            )
            : new ExchangeBalanceTransactionSender(
                this.router,
                signerProvider,
                this.payload as ExchangeTransactionPayload,
                options
            )
    }

}