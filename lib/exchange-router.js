"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRouter = void 0;
var web3_utils_1 = require("web3-utils");
var sdk_1 = require("@l3chain/sdk");
var abi_1 = require("./abi");
var exchange_pair_1 = require("./exchange-pair");
var entity_1 = require("./entity");
var ExchangeRouter = /** @class */ (function () {
    function ExchangeRouter(props) {
        var _this = this;
        this.getComponents = function (chainName) {
            return _this._chains[chainName];
        };
        this.getPair = function (chainName, tokenContract) {
            var metaData = _this.metaDatas.find(function (value) {
                return value.etid.chainIdentifier.toLowerCase() == _this.chainIdentifiers[chainName].toLowerCase() &&
                    value.etid.tokenContract.toLowerCase() === tokenContract.toLowerCase();
            });
            if (!metaData) {
                return undefined;
            }
            return new exchange_pair_1.ExchangePair(_this._chains[chainName].web3, metaData);
        };
        /**
         * 获取基础手续费
         *
         * @param chainName
         * @returns token 基础手续费代币
         * @returns amount 手续费数量
         *
         */
        this.getBaseFee = function (chainName) { return new Promise(function (resolve, reject) {
            _this._chains[chainName].factory.methods
                .fee()
                .call()
                .catch(reject)
                .then(function (result) { return resolve({
                token: result.token,
                amount: result.amount
            }); });
        }); };
        /**
         * 获取附加手续费设置
         *
         * @param pair 交易对
         * @returns thresholdAmount 触发阈值
         * @returns rateWei 全精度数值(1e12 = 100%)
         * @returns rate 百分比
         */
        this.getFeeAdditionalOf = function (pairOrETID) { return new Promise(function (resolve) {
            var args = pairOrETID instanceof exchange_pair_1.ExchangePair ? {
                chainIdentifier: pairOrETID.metaData.etid.chainIdentifier,
                shadowEmiter: pairOrETID.metaData.pairContract
            } : {
                chainIdentifier: pairOrETID.chainIdentifier,
                shadowEmiter: pairOrETID.shadowEmiter
            };
            _this._chains[_this.chainNames[args.chainIdentifier.toLowerCase()]].factory.methods
                .feeAdditionalOf(args.shadowEmiter)
                .call()
                .then(function (result) { return resolve({
                thresholdAmount: result.thresholdAmount,
                rateWei: (0, web3_utils_1.toBN)(result.rate),
                rate: parseFloat((0, web3_utils_1.fromWei)(result.rate, 'szabo')),
            }); });
        }); };
        /**
         * 获取指定网络中可以交易的所有交易对
         *
         * @param chainName
         * @returns
         */
        this.getSupportExchangePairs = function (fromChain) { return _this.metaDatas.filter(function (data) { return data.etid.chainIdentifier.toLowerCase() == _this.chainIdentifiers[fromChain].toLowerCase(); }).map(function (data) { return new exchange_pair_1.ExchangePair(_this._chains[fromChain].web3, data); }); };
        /**
         * 获取对应网络的主币映射代币的Pair，不一定存在
         *
         * @param onChain
         * @returns
         */
        this.getWrappedCoinPair = function (onChain) { return __awaiter(_this, void 0, void 0, function () {
            var wcoinAddress, wcoinData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._chains[onChain].router.methods.WCOIN().call()];
                    case 1:
                        wcoinAddress = _a.sent();
                        wcoinData = this.metaDatas.find(function (data) {
                            return data.etid.chainIdentifier.toLowerCase() == _this.chainIdentifiers[onChain].toLowerCase() &&
                                data.etid.tokenContract.toLowerCase() == wcoinAddress.toLowerCase();
                        });
                        if (!wcoinData) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, new exchange_pair_1.ExchangePair(this._chains[onChain].web3, wcoinData)];
                }
            });
        }); };
        /**
         * 查询历史记录:
         * 不能混合查询，一次只能查询一个网络中的数据，并不完全是GraphQL的数据，会对最终数据做一些可读性的转换一笔成功的跨
         * 网络代币交换逻辑，应该由A存B取组成，但是在各种限制条件下，暂时没有找到好的办法解决不同网络之间两个交易记录的关联
         * 问题，所以在查询交易的状态时候，可以很容易查到A存没存，B取没取，但是在AB之间关联上，存在较多障碍，无法直接在一个
         * 接口中给出。
         *
         * 字段说明:
         * fromAccount: 交易发起地址
         * toAccount: 最终接收地址
         * amount: 数量
         * fee: 基础手续费
         * feeAdditional: 附加手续费
         * fromETID: 来源代币
         * toETID: 目标代币
         * assetProvider: 提供代币的地址，有可能是Pair本身，也有可能是做市商的任何地址
         *
         * @param fromChain 网络名称
         * @param where 具体条件可以在对应网络的graphQL中查看,测试后按照对象形式写入where即可
         * @returns 历史记录
         */
        this.selectExchangeHistory = function (fromChain, filter) { return __awaiter(_this, void 0, void 0, function () {
            var gql, exchangeds, emitChainIdentifier;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gql = "\n        {\n            exchangeds(\n                ".concat(!filter.where ? "" : "where:".concat(JSON.stringify(filter.where).replace(/"(\w+)":/g, '$1:')), "\n                ").concat(!filter.skip ? "skip:0" : "skip: ".concat(filter.skip), "\n                ").concat(!filter.first ? "" : "first:".concat(filter.first), "\n                ").concat(!filter.orderDirection ? "orderDirection:desc" : "orderDirection: ".concat(filter.orderDirection), "\n                ").concat(!filter.orderBy ? "orderBy:time" : "orderBy: ".concat(filter.orderBy), "\n            ) {\n                id\n                certificateId\n                fromAccount\n                toAccount\n                amount\n                fee\n                feeAdditional\n                assetProvider\n                time\n                fromETID {\n                    chainIdentifier\n                    exchangePair:shadowEmiter\n                }\n                toETID {\n                    chainIdentifier\n                    exchangePair:shadowEmiter\n                }\n            }\n        }\n        ");
                        return [4 /*yield*/, this._chains[fromChain].client.query(gql).then(function (data) {
                                return data.exchangeds;
                            })];
                    case 1:
                        exchangeds = _a.sent();
                        emitChainIdentifier = this.chainIdentifiers[fromChain];
                        return [2 /*return*/, exchangeds.map(function (record) {
                                var fromPair = _this.metaDatas.find(function (value) {
                                    return value.etid.chainIdentifier.toLowerCase() == record.fromETID.chainIdentifier.toLowerCase() &&
                                        value.pairContract.toLowerCase() == record.fromETID.exchangePair.toLowerCase();
                                });
                                var toPair = _this.metaDatas.find(function (value) {
                                    return value.etid.chainIdentifier.toLowerCase() == record.toETID.chainIdentifier.toLowerCase() &&
                                        value.pairContract.toLowerCase() == record.toETID.exchangePair.toLowerCase();
                                });
                                var emitPair = emitChainIdentifier.toLowerCase() == record.fromETID.chainIdentifier.toLowerCase()
                                    ? record.fromETID.exchangePair
                                    : record.toETID.exchangePair;
                                var historyType = emitChainIdentifier.toLowerCase() == record.fromETID.chainIdentifier.toLowerCase()
                                    ? "Deposit"
                                    : "Withdraw";
                                return {
                                    id: record.id,
                                    emitChainIdentifier: emitChainIdentifier,
                                    emitPair: emitPair,
                                    certificateId: (0, web3_utils_1.toNumber)(record.certificateId),
                                    historyType: historyType,
                                    time: (0, web3_utils_1.toNumber)(record.time),
                                    from: {
                                        chainIdentifier: record.fromETID.chainIdentifier,
                                        account: record.fromAccount,
                                        tokenPair: fromPair === null || fromPair === void 0 ? void 0 : fromPair.pairContract,
                                        tokenAddress: fromPair === null || fromPair === void 0 ? void 0 : fromPair.tokenAddress,
                                        tokenName: fromPair === null || fromPair === void 0 ? void 0 : fromPair.tokenName,
                                        tokenSymbol: fromPair === null || fromPair === void 0 ? void 0 : fromPair.tokenSymbol,
                                        tokenDecimals: fromPair ? (0, web3_utils_1.toNumber)(fromPair.tokenDecimals) : undefined
                                    },
                                    to: {
                                        chainIdentifier: record.toETID.chainIdentifier,
                                        account: record.toAccount,
                                        tokenPair: toPair === null || toPair === void 0 ? void 0 : toPair.pairContract,
                                        tokenAddress: toPair === null || toPair === void 0 ? void 0 : toPair.tokenAddress,
                                        tokenName: toPair === null || toPair === void 0 ? void 0 : toPair.tokenName,
                                        tokenSymbol: toPair === null || toPair === void 0 ? void 0 : toPair.tokenSymbol,
                                        tokenDecimals: toPair ? (0, web3_utils_1.toNumber)(toPair.tokenDecimals) : undefined
                                    },
                                    amount: (0, web3_utils_1.toBN)(record.amount),
                                    fee: (0, web3_utils_1.toBN)(record.fee),
                                    feeAdditional: (0, web3_utils_1.toBN)(record.feeAdditional),
                                    assetProvider: record.assetProvider
                                };
                            })];
                }
            });
        }); };
        /**
         * 获取历史记录对应的成交状态，一个完整的历史记录由1存1取构成，根据网络标识不同，history对象上的historyType
         * 能编辑该记录属于存入还是取出，如果获取存入订单状态，该方法会尝试去目标网络查询对应的取出历史，如果无法查找到
         * 说明还未处理，若能找到则判断是已那种形式完成了资产的交换
         *
         * @param history
         * @returns
         */
        this.getExchangeHistoryState = function (history) { return __awaiter(_this, void 0, void 0, function () {
            var withdrawHistory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(history.historyType == 'Withdraw')) return [3 /*break*/, 1];
                        // 资金提供者是目标网络对应的交易对
                        if (history.assetProvider.toLowerCase() == history.to.tokenPair.toLowerCase()) {
                            return [2 /*return*/, "ExchangedDone"];
                        }
                        // 没有资金提供者，则说明是已欠款完成了交易
                        else if (history.assetProvider.toLowerCase() == entity_1.NullableAddress) {
                            return [2 /*return*/, "BorrowAmountDone"];
                        }
                        // 其他类型完成的，都是做市商完成类型
                        else {
                            return [2 /*return*/, "BadHandlerDone"];
                        }
                        return [3 /*break*/, 4];
                    case 1: return [4 /*yield*/, this.selectExchangeHistory(this.chainNames[history.to.chainIdentifier.toLowerCase()], {
                            first: 1,
                            where: {
                                certificateId: history.certificateId,
                                fromETID_: {
                                    chainIdentifier: history.from.chainIdentifier,
                                    shadowEmiter: history.from.tokenPair,
                                }
                            }
                        }).then(function (rsp) { return rsp.length > 0 ? rsp[0] : undefined; })];
                    case 2:
                        withdrawHistory = _a.sent();
                        if (!withdrawHistory) {
                            return [2 /*return*/, "Unused"];
                        }
                        if ((withdrawHistory === null || withdrawHistory === void 0 ? void 0 : withdrawHistory.historyType) != "Withdraw") {
                            throw new Error("select target withdraw exechange history has something wrong.");
                        }
                        return [4 /*yield*/, this.getExchangeHistoryState(withdrawHistory)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 查询在指定网络中，所有关于account的借款信息，做市商可能会借出很多种类的资产，该接口可以一次性返回指定网络中所有的借出信息
         *
         * @param account
         */
        this.selectBorrowAmounts = function (fromChain, filter) {
            var gql = "\n        {\n            borrowAmounts(\n                ".concat(!filter.where ? "" : "where:".concat(JSON.stringify(filter.where).replace(/"(\w+)":/g, '$1:')), "\n                ").concat(!filter.skip ? "skip:0" : "skip: ".concat(filter.skip), "\n                ").concat(!filter.first ? "" : "first: ".concat(filter.first), "\n            ) {\n                amount\n                borrower\n                pairContract {\n                    pairContract\n                }\n            }\n        }\n        ");
            return _this._chains[fromChain].client.query(gql)
                .then(function (rsp) { return rsp.borrowAmounts.map(function (borrowInfo) {
                return {
                    amount: (0, web3_utils_1.toBN)(borrowInfo.amount),
                    borrower: borrowInfo.borrower,
                    exchangePair: new exchange_pair_1.ExchangePair(_this._chains[fromChain].web3, _this.metaDatas.find(function (value) {
                        return value.etid.chainIdentifier.toLowerCase() == _this.chainIdentifiers[fromChain].toLowerCase() &&
                            value.pairContract.toLowerCase() == borrowInfo.pairContract.pairContract.toLowerCase();
                    }))
                };
            }); });
        };
        /**
         * 查询超过5-60分钟还未完成处理的交易
         *
         * 前5分钟先由节点默认程序处理，若无法处理，开始开放给做市商处理，超过60分钟还未被处理，节点将作为欠款处理
         *
         * @param pair
         */
        this.selectBadExchange = function (pair, filter) {
            if (filter === void 0) { filter = { skip: 0, first: 50 }; }
            return __awaiter(_this, void 0, void 0, function () {
                var fromEtids, allHistory, flated, _i, allHistory_1, a;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fromEtids = pair.fromExchangeTokenIds;
                            return [4 /*yield*/, Promise.all(fromEtids.map(function (fromEtid) { return _this.selectExchangeHistory(_this.chainNames[fromEtid.chainIdentifier.toLowerCase()], __assign(__assign({}, filter), { orderBy: "time", orderDirection: "asc", where: {
                                        fromETID_: {
                                            chainIdentifier: fromEtid.chainIdentifier,
                                            shadowEmiter: fromEtid.shadowEmiter
                                        },
                                        toETID_: {
                                            chainIdentifier: pair.metaData.etid.chainIdentifier,
                                            shadowEmiter: pair.metaData.etid.shadowEmiter
                                        },
                                        time_gte: Math.round(new Date().getTime() / 1000) - 30 * 65,
                                        time_lt: Math.round(new Date().getTime() / 1000) - 30 * 5
                                    } })).then(function (history) {
                                    return _this.selectExchangeHistory(_this.chainNames[pair.metaData.etid.chainIdentifier.toLowerCase()], {
                                        first: history.length,
                                        where: {
                                            fromETID_: {
                                                chainIdentifier: fromEtid.chainIdentifier,
                                                shadowEmiter: fromEtid.shadowEmiter
                                            },
                                            certificateId_in: history.map(function (v) { return v.certificateId; })
                                        }
                                    }).then(function (doneHistory) {
                                        var doneCertIds = doneHistory.map(function (v) { return v.certificateId; });
                                        return history.filter(function (record) { return !doneCertIds.includes(record.certificateId); });
                                    });
                                }); }))];
                        case 1:
                            allHistory = _a.sent();
                            flated = [];
                            for (_i = 0, allHistory_1 = allHistory; _i < allHistory_1.length; _i++) {
                                a = allHistory_1[_i];
                                flated = flated.concat(a);
                            }
                            return [2 /*return*/, flated];
                    }
                });
            });
        };
        /**
         * 获取存入类型历史记录的凭证信息，返回的信息可以用于其他成员网络的验证，返回的对象可以用于在目标网络进行提取操作
         *
         * @param history
         * @returns
         */
        this.createExchangeProof = function (history) { return _this.l3.createL3TransactionProof(_this.chainNames[history.from.chainIdentifier.toLowerCase()], history.id.split('-')[0], parseInt(history.id.split('-')[1]) - 1); };
        this.getEstimateFee = function (props) {
            var fromETID = props.fromETID, toETID = props.toETID, fromAccount = props.fromAccount, toAccount = props.toAccount, amount = props.amount;
            return _this._chains[_this.chainNames[fromETID.chainIdentifier.toLowerCase()]].router.methods.tokenExchangeToChainEstimateFee(fromETID, toETID, toAccount, amount).call().then(function (ret) {
                return {
                    feeAmount: (0, web3_utils_1.toBN)(ret.feeAmount),
                    feeAdditionalAmount: (0, web3_utils_1.toBN)(ret.feeAdditionalAmount),
                    feel3: (0, web3_utils_1.toBN)(ret.feel3)
                };
            });
        };
        /**
         * @deprecated
         *
         * use 'getComponents'
         */
        this.getCompments = this.getComponents;
        /**
         * @deprecated
         *
         * use 'getBaseFee'
         */
        this.fee = this.getBaseFee;
        /**
         * @deprecated
         *
         * use 'getFeeAdditionalOf'
         */
        this.feeAdditionalOf = this.getFeeAdditionalOf;
        /**
         * @deprecated
         *
         * use 'getSupportExchangePairs'
         */
        this.supportExchangePairs = this.getSupportExchangePairs;
        /**
         * @deprecated
         *
         * use 'getWrappedCoinPair'
         */
        this.wrappedCoinPair = this.getWrappedCoinPair;
        /**
         * @deprecated
         *
         * use 'getEstimateFee'
         */
        this.estimateFee = this.getEstimateFee;
        /**
         * @deprecated
         *
         * use 'createExchangeProof'
         */
        this.getDepositedProof = this.createExchangeProof;
        var generatedDatas = props.generatedDatas, providerGroup = props.providerGroup;
        this.metaDatas = generatedDatas;
        this.l3 = new sdk_1.L3Chain(providerGroup);
        this.chainIdentifiers = Object.keys(providerGroup.providers).reduce(function (ret, key) {
            ret[key] = providerGroup.providers[key].chainIdentifier.toLowerCase();
            return ret;
        }, {});
        this.chainNames = Object.keys(providerGroup.providers).reduce(function (ret, key) {
            ret[providerGroup.providers[key].chainIdentifier.toLowerCase()] = key;
            return ret;
        }, {});
        this._chains = Object.keys(providerGroup.providers).reduce(function (ret, key) {
            var c = providerGroup.providers[key];
            var web3 = _this.l3.getComponents(key).web3;
            ret[key] = {
                web3: web3,
                client: new sdk_1.GraphQlClient(c.graphURL),
                factory: new web3.eth.Contract(abi_1.ABI.Factory, c.factoryAddress),
                router: new web3.eth.Contract(abi_1.ABI.Router, c.routerAddress),
            };
            return ret;
        }, {});
    }
    return ExchangeRouter;
}());
exports.ExchangeRouter = ExchangeRouter;
