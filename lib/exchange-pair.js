"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangePair = void 0;
var web3_utils_1 = require("web3-utils");
var abi_1 = require("./abi");
var ExchangePair = /** @class */ (function () {
    function ExchangePair(web3, metaData) {
        var _this = this;
        this.l3Nonce = function () { return _this.contract.methods.l3Nonce().call().then(web3_utils_1.toNumber); };
        this.tokenBalnaceReserver = function () { return _this.contract.methods.tokenBalnaceReserver().call(); };
        this.borrowAmountOf = function (account) { return _this.contract.methods.borrowAmountOf(account).call(); };
        this.isDestroyCertificateIdOf = function (fromChainIdentifier, fromPairAddress, certificateId) { return _this.contract.methods.isDestroyCertificateIdOf(fromChainIdentifier, fromPairAddress, certificateId).call(); };
        this.exchangeToEstimateFee = function (etid, fromAccount, toAccount, amount) { return _this.contract.methods.exchangeToEstimateFee(etid, fromAccount, toAccount, amount).call(); };
        this.acceptExchangeTokenID = function () { return new Promise(function (resolve, reject) {
            console.log(_this.contract.methods);
            _this.contract.methods.acceptExchangeTokenIds()
                .call()
                .then(function (datas) {
                resolve(datas.map(function (data) {
                    return {
                        chainIdentifier: data.chainIdentifier,
                        shadowEmiter: data.shadowEmiter,
                        tokenContract: data.tokenContract,
                        decimals: (0, web3_utils_1.toNumber)(data.decimals)
                    };
                }));
            }).catch(reject);
        }); };
        this._metaData = metaData;
        this._contract = new web3.eth.Contract(abi_1.ABI.Pair, this._metaData.pairContract);
    }
    Object.defineProperty(ExchangePair.prototype, "metaData", {
        get: function () {
            return this._metaData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangePair.prototype, "contract", {
        get: function () {
            return this._contract;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangePair.prototype, "contractAddress", {
        get: function () {
            return this._metaData.pairContract;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangePair.prototype, "toExchangeTokenIds", {
        get: function () {
            return this._metaData.toEtid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangePair.prototype, "fromExchangeTokenIds", {
        get: function () {
            return this._metaData.fromEtid;
        },
        enumerable: false,
        configurable: true
    });
    return ExchangePair;
}());
exports.ExchangePair = ExchangePair;
