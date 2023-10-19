"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ExchangeTransactionBuilder = exports.ExchangeTransactionSender = exports.ExchangeTransactionErrors = exports.ExchangeTransactionBuilderEmitter = void 0;
var web3_1 = __importDefault(require("web3"));
var events_1 = require("events");
var web3_utils_1 = require("web3-utils");
var abi_1 = require("./abi");
var isEqualETID = function (a, b) {
    for (var _i = 0, _a = Object.keys(a); _i < _a.length; _i++) {
        var key = _a[_i];
        // @ts-ignore
        if (a[key] != b[key]) {
            return false;
        }
    }
    return false;
};
var ExchangeTransactionBuilderEmitter = /** @class */ (function (_super) {
    __extends(ExchangeTransactionBuilderEmitter, _super);
    function ExchangeTransactionBuilderEmitter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExchangeTransactionBuilderEmitter.prototype.on = function (eventName, listener) {
        return _super.prototype.on.call(this, eventName, listener);
    };
    ExchangeTransactionBuilderEmitter.prototype.once = function (eventName, listener) {
        return _super.prototype.once.call(this, eventName, listener);
    };
    ExchangeTransactionBuilderEmitter.prototype.listeners = function (eventName) {
        return _super.prototype.listeners.call(this, eventName);
    };
    ExchangeTransactionBuilderEmitter.prototype.listenerCount = function (eventName) {
        return _super.prototype.listenerCount.call(this, eventName);
    };
    ExchangeTransactionBuilderEmitter.prototype.addListener = function (eventName, listener) {
        return _super.prototype.addListener.call(this, eventName, listener);
    };
    ExchangeTransactionBuilderEmitter.prototype.removeListener = function (eventName, listener) {
        return _super.prototype.removeListener.call(this, eventName, listener);
    };
    return ExchangeTransactionBuilderEmitter;
}(events_1.EventEmitter));
exports.ExchangeTransactionBuilderEmitter = ExchangeTransactionBuilderEmitter;
exports.ExchangeTransactionErrors = {
    INSUFFICIENT_BALANCE: new Error('ETErrors: INSUFFICIENT_BALANCE'),
    INVAILD_PAYLOAD: new Error('ETErrors: INVAILD_PAYLOAD'),
};
var ExchangeTransactionSender = /** @class */ (function (_super) {
    __extends(ExchangeTransactionSender, _super);
    function ExchangeTransactionSender(exchangeRouter, signerProvider, payload, options) {
        if (options === void 0) { options = { gasPrice: undefined, gasMultiple: 1.2 }; }
        var _this = _super.call(this) || this;
        var fromETID = payload.fromETID, fromAccount = payload.fromAccount, toETID = payload.toETID, toAccount = payload.toAccount, amount = payload.amount;
        var web3 = new web3_1.default(signerProvider);
        var compments = exchangeRouter.getCompments(fromETID.chainIdentifier.toChainName());
        if (!compments) {
            throw new Error("ETSender: InvaildFromChainIdentifier");
        }
        var routerAddress = compments.router._address;
        var fromToken = new web3.eth.Contract(abi_1.ABI.ERC20, fromETID.tokenContract);
        var router = new web3.eth.Contract(abi_1.ABI.Router, routerAddress);
        _this.loader = Promise.all([
            web3.eth.getBalance(fromAccount).then(web3_utils_1.toBN),
            fromToken.methods.balanceOf(fromAccount).call().then(web3_utils_1.toBN),
            fromToken.methods.allowance(fromAccount, routerAddress).call().then(web3_utils_1.toBN),
            exchangeRouter.estimateFee(payload),
            router.methods.WCOIN().call()
        ]).then(function (rets) { return __awaiter(_this, void 0, void 0, function () {
            var coinBalance, fromTokenBalance, fromTokenAllowanced, fees, wcoinAddress, isWCOIN;
            return __generator(this, function (_a) {
                coinBalance = rets[0], fromTokenBalance = rets[1], fromTokenAllowanced = rets[2], fees = rets[3], wcoinAddress = rets[4];
                isWCOIN = wcoinAddress.replace('0x', '').toLocaleLowerCase() == fromETID.tokenContract.replace('0x', '').toLocaleLowerCase();
                if (!isWCOIN) {
                    if (fromTokenBalance.lt(amount)) {
                        this.emit("error", exports.ExchangeTransactionErrors.INSUFFICIENT_BALANCE);
                        return [2 /*return*/];
                    }
                    if (fromTokenAllowanced.lt(amount)) {
                        this.approveCaller = fromToken.methods.approve(routerAddress, amount.sub(fromTokenAllowanced));
                        this.approveParams = {
                            from: fromAccount,
                            gasPrice: options.gasPrice
                        };
                    }
                }
                else {
                    if (coinBalance.lt(fees.feel3.add(fees.feeAmount))) {
                        this.emit("error", exports.ExchangeTransactionErrors.INSUFFICIENT_BALANCE);
                        return [2 /*return*/];
                    }
                    this.emit('approved');
                }
                this.exchangeCaller = isWCOIN
                    //  coinExchangeToChain((bytes32,address,address,uint8),(bytes32,address,address,uint8),address)
                    ? router.methods['0x384fb85a'](fromETID, toETID, toAccount)
                    // tokenExchangeToChain((bytes32,address,address,uint8),(bytes32,address,address,uint8),address,uint256)
                    : router.methods['0x311a5a09'](fromETID, toETID, toAccount, amount);
                this.exchangeParams = {
                    from: fromAccount,
                    gasPrice: options.gasPrice,
                    value: isWCOIN
                        ? amount.add(fees.feel3).add(fees.feeAmount)
                        : fees.feel3.add(fees.feeAmount),
                };
                return [2 /*return*/];
            });
        }); });
        return _this;
    }
    ExchangeTransactionSender.prototype.send = function (gasMultiple) {
        if (gasMultiple === void 0) { gasMultiple = 1.2; }
        return __awaiter(this, void 0, void 0, function () {
            var approveTx, gas;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader];
                    case 1:
                        _a.sent();
                        if (!this.exchangeCaller) {
                            this.emit('error', exports.ExchangeTransactionErrors.INVAILD_PAYLOAD);
                            return [2 /*return*/, Promise.reject(exports.ExchangeTransactionErrors.INVAILD_PAYLOAD)];
                        }
                        if (!this.approveCaller) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.approveCaller.send(this.approveParams)];
                    case 2:
                        approveTx = _a.sent();
                        this.emit('approved', approveTx);
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.exchangeCaller.estimateGas(this.exchangeParams)];
                    case 4:
                        gas = _a.sent();
                        this.emit('estimateGas', (0, web3_utils_1.toNumber)(gas));
                        return [2 /*return*/, this.exchangeCaller.send(__assign(__assign({}, this.exchangeParams), { gas: Math.floor((0, web3_utils_1.toNumber)(gas) * gasMultiple) }))
                                .on('transactionHash', function (txHash) {
                                _this.emit('transactionHash', txHash);
                            })
                                .on('receipt', function (receipt) {
                                _this.emit('receipt', receipt);
                            })
                                .on('error', function (error) {
                                _this.emit('error', error);
                            })];
                }
            });
        });
    };
    return ExchangeTransactionSender;
}(ExchangeTransactionBuilderEmitter));
exports.ExchangeTransactionSender = ExchangeTransactionSender;
var ExchangeTransactionBuilder = /** @class */ (function (_super) {
    __extends(ExchangeTransactionBuilder, _super);
    function ExchangeTransactionBuilder(router, props) {
        var _this = _super.call(this) || this;
        var fromAccount = props.fromAccount, fromChain = props.fromChain;
        var compments = router.getCompments(fromChain);
        if (!compments) {
            throw new Error("ETBuilder: InvaildFromChainIdentifier");
        }
        _this.router = router;
        _this.payload = {
            fromAccount: fromAccount
        };
        return _this;
    }
    Object.defineProperty(ExchangeTransactionBuilder.prototype, "fromAccount", {
        get: function () {
            return this.payload.fromAccount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangeTransactionBuilder.prototype, "toAccount", {
        get: function () {
            return this.payload.toAccount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangeTransactionBuilder.prototype, "fromETID", {
        get: function () {
            return this.payload.fromETID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangeTransactionBuilder.prototype, "toETID", {
        get: function () {
            return this.payload.toETID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExchangeTransactionBuilder.prototype, "amount", {
        get: function () {
            return this.payload.amount;
        },
        enumerable: false,
        configurable: true
    });
    ExchangeTransactionBuilder.prototype._updateFee = function () {
        var _this = this;
        Promise.all([
            this.feeAdditionalConfig,
            this.feeExchange,
            this.feeL3
        ]).catch(function (e) {
            _this.emit("error", e);
        }).then(function (ret) {
            if (!ret || !ret[0] || !ret[1] || !ret[2]) {
                return;
            }
            _this.emit("feeAdditionalConfig", ret[0]);
            _this.emit("feeAmountUpgrade", {
                feel3: ret[2],
                feeAmount: (0, web3_utils_1.toBN)(ret[1].amount.toString()),
                feeAdditionalAmount: _this.payload.amount && _this.payload.amount.gte((0, web3_utils_1.toBN)(ret[0].thresholdAmount.toString()))
                    ? _this.payload.amount.mul(ret[0].rateWei).divn(1e12)
                    : (0, web3_utils_1.toBN)(0),
            });
        });
    };
    ExchangeTransactionBuilder.prototype.setFromETID = function (etid) {
        if (this.payload.fromETID && isEqualETID(this.payload.fromETID, etid)) {
            return this;
        }
        this.payload.fromETID = etid;
        this.feeAdditionalConfig = this.router.feeAdditionalOf(this.payload.fromETID);
        this.feeExchange = this.router.fee(etid.chainIdentifier.toChainName());
        this.feeL3 = this.router.estimateFee({
            fromAccount: this.payload.fromAccount,
            toAccount: this.payload.fromAccount,
            fromETID: etid,
            toETID: etid,
            amount: 0
        }).then(function (r) { return r.feel3; });
        this._updateFee();
        return this;
    };
    ExchangeTransactionBuilder.prototype.setToETID = function (etid) {
        if (this.payload.toETID && isEqualETID(this.payload.toETID, etid)) {
            return this;
        }
        this.payload.toETID = etid;
        if (this.payload.amount == undefined) {
            this.payload.amount = (0, web3_utils_1.toBN)(0);
        }
        return this;
    };
    ExchangeTransactionBuilder.prototype.setToAccount = function (account) {
        if (this.payload.toAccount && this.payload.toAccount == account) {
            return this;
        }
        this.payload.toAccount = account;
        return this;
    };
    ExchangeTransactionBuilder.prototype.setAmount = function (amount) {
        if (this.payload.amount && this.payload.amount.eq((0, web3_utils_1.toBN)(amount.toString()))) {
            return this;
        }
        this.payload.amount = (0, web3_utils_1.toBN)(amount.toString());
        if (!this.feeAdditionalConfig || !this.feeL3 || !this.feeExchange) {
            throw new Error("ETBuilder: befor call \'setAmount\', must be called \"setFromETID\"");
        }
        this._updateFee();
        return this;
    };
    ExchangeTransactionBuilder.prototype.build = function (signerProvider, options) {
        if (options === void 0) { options = {
            gasPrice: undefined,
            gasMultiple: 1.2
        }; }
        if (!this.payload.amount || !this.payload.fromETID || !this.payload.toAccount || !this.payload.toETID) {
            throw new Error("ETBuilder: invaild payload datas");
        }
        return new ExchangeTransactionSender(this.router, signerProvider, this.payload, options);
    };
    return ExchangeTransactionBuilder;
}(ExchangeTransactionBuilderEmitter));
exports.ExchangeTransactionBuilder = ExchangeTransactionBuilder;
