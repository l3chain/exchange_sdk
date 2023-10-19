"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangePair = void 0;
var web3_1 = __importDefault(require("web3"));
var web3_utils_1 = require("web3-utils");
var abi_1 = require("./abi");
var ExchangePair = /** @class */ (function () {
    function ExchangePair(web3, metaData) {
        var _this = this;
        this.l3Nonce = function () { return _this.contract.methods.l3Nonce().call().then(web3_utils_1.toNumber); };
        this.tokenBalnaceReserver = function () { return _this.contract.methods.tokenBalnaceReserver().call().then(web3_utils_1.toBN); };
        this.borrowAmountOf = function (account) { return _this.contract.methods.borrowAmountOf(account).call().then(web3_utils_1.toBN); };
        this.isDestroyCertificateIdOf = function (fromChainIdentifier, fromPairAddress, certificateId) { return _this.contract.methods.isDestroyCertificateIdOf(fromChainIdentifier, fromPairAddress, certificateId).call(); };
        this.exchangeToEstimateFee = function (etid, fromAccount, toAccount, amount) { return _this.contract.methods.exchangeToEstimateFee(etid, fromAccount, toAccount, amount).call(); };
        this.acceptExchangeTokenID = function () { return new Promise(function (resolve, reject) {
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
        this._send = function (caller, options) { return __awaiter(_this, void 0, void 0, function () {
            var gas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gas = undefined;
                        if (!!options.gasLimit) return [3 /*break*/, 2];
                        return [4 /*yield*/, caller.estimateGas({ from: options.from })];
                    case 1:
                        gas = _a.sent();
                        gas = Math.floor(gas * (options.gasMutiple ? options.gasMutiple : 1.2));
                        _a.label = 2;
                    case 2: return [2 /*return*/, caller.call({
                            from: options.from,
                            gas: gas ? gas : options.gasLimit,
                            gasPrice: options.gasPrice
                        })
                        // return caller.send({
                        //     from: options.from,
                        //     gas: gas ? gas : options.gasLimit,
                        //     gasPrice: options.gasPrice
                        // });
                    ];
                }
            });
        }); };
        this.depositBorrowAmount = function (amount, options) { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var web3, token, allowanced, pairContract, caller;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._isMintBurnPairPromise];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, reject("EPair: MintBurnPair not support baddebts API")];
                        }
                        web3 = new web3_1.default(options.signerProvider);
                        token = new web3.eth.Contract(abi_1.ABI.ERC20, this.metaData.etid.tokenContract);
                        return [4 /*yield*/, token.methods.allowance(options.from, this.metaData.pairContract).call().catch()];
                    case 2:
                        allowanced = _a.sent();
                        if (!allowanced) {
                            return [2 /*return*/, reject("EPair: request token allowance quota failed")];
                        }
                        if (allowanced.lt((0, web3_utils_1.toBN)(amount.toString()))) {
                            return [2 /*return*/, reject("EPair: insufficient allowanced limit")];
                        }
                        try {
                            pairContract = new web3.eth.Contract(abi_1.ABI.Pair, this.metaData.pairContract);
                            caller = pairContract.methods.depositBorrowAmount(amount.toString());
                            return [2 /*return*/, this._send(caller, options)];
                        }
                        catch (e) {
                            return [2 /*return*/, reject(e)];
                        }
                        return [2 /*return*/];
                }
            });
        }); }); };
        this.withdrawBorrowAmount = function (toAccount, amount, options) { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var web3, borrowBalance, pairContract, caller;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._isMintBurnPairPromise];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, reject("EPair: MintBurnPair not support baddebts API")];
                        }
                        web3 = new web3_1.default(options.signerProvider);
                        return [4 /*yield*/, this.borrowAmountOf(options.from)];
                    case 2:
                        borrowBalance = _a.sent();
                        if (borrowBalance.lt((0, web3_utils_1.toBN)(amount.toString()))) {
                            return [2 /*return*/, reject("EPair: insufficient borrow amount")];
                        }
                        try {
                            pairContract = new web3.eth.Contract(abi_1.ABI.Pair, this.metaData.pairContract);
                            caller = pairContract.methods.withdrawBorrowAmount(toAccount, amount.toString());
                            return [2 /*return*/, this._send(caller, options)];
                        }
                        catch (e) {
                            return [2 /*return*/, reject(e)];
                        }
                        return [2 /*return*/];
                }
            });
        }); }); };
        this.sync = function (options) { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var web3, pairContract, caller;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._isMintBurnPairPromise];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, reject("EPair: MintBurnPair not support baddebts API")];
                        }
                        web3 = new web3_1.default(options.signerProvider);
                        try {
                            pairContract = new web3.eth.Contract(abi_1.ABI.Pair, this.metaData.pairContract);
                            caller = pairContract.methods.sync();
                            return [2 /*return*/, this._send(caller, options)];
                        }
                        catch (e) {
                            return [2 /*return*/, reject(e)];
                        }
                        return [2 /*return*/];
                }
            });
        }); }); };
        this.exchangeFromProof = function (proof, options) { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var web3, pairContract, caller;
            return __generator(this, function (_a) {
                web3 = new web3_1.default(options.signerProvider);
                try {
                    pairContract = new web3.eth.Contract(abi_1.ABI.Pair, this.metaData.pairContract);
                    caller = pairContract.methods.exchangeFromProof(proof);
                    return [2 /*return*/, this._send(caller, options)];
                }
                catch (e) {
                    return [2 /*return*/, reject(e)];
                }
                return [2 /*return*/];
            });
        }); }); };
        this.exchangeFromProofsWithAddLiquidity = function (proofs, ignoreRewards, options) { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var web3, pairContract, caller;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._isMintBurnPairPromise];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, reject("EPair: MintBurnPair not support baddebts API")];
                        }
                        web3 = new web3_1.default(options.signerProvider);
                        try {
                            pairContract = new web3.eth.Contract(abi_1.ABI.Pair, this.metaData.pairContract);
                            caller = pairContract.methods.exchangeFromProofsWithAddLiquidity(proofs, ignoreRewards);
                            return [2 /*return*/, this._send(caller, options)];
                        }
                        catch (e) {
                            return [2 /*return*/, reject(e)];
                        }
                        return [2 /*return*/];
                }
            });
        }); }); };
        this._metaData = metaData;
        this._contract = new web3.eth.Contract(abi_1.ABI.Pair, this._metaData.pairContract);
        this._isMintBurnPairPromise = this._contract.methods.isMintBurnPair().call();
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
    Object.defineProperty(ExchangePair.prototype, "etid", {
        get: function () {
            return this._metaData.etid;
        },
        enumerable: false,
        configurable: true
    });
    return ExchangePair;
}());
exports.ExchangePair = ExchangePair;
