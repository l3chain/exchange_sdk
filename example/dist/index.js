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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("@l3chain/sdk");
var sdk_2 = require("@l3exchange/sdk");
var web3_utils_1 = require("web3-utils");
var web3_1 = __importDefault(require("web3"));
// Exchange相关配置信息
var exchangeConfig = {
    graphQL: {
        HOST: 'http://l3test.org:8000/subgraphs/name/l3/exchange_host',
        ETH: 'http://l3test.org:8000/subgraphs/name/l3/exchange_eth',
        BSC: 'http://l3test.org:8000/subgraphs/name/l3/exchange_bsc'
    },
    providers: {
        HOST: new web3_1.default.providers.HttpProvider('http://l3test.org:18545'),
        ETH: new web3_1.default.providers.HttpProvider('http://l3test.org:28545'),
        BSC: new web3_1.default.providers.HttpProvider('http://l3test.org:38545'),
    },
    addresses: {
        factory: {
            HOST: '0x35d6b4493b24e25Ec5bb89f944f5108efdD96309',
            ETH: '0xD105277fD763006ED758939477F17587CcE68E95',
            BSC: '0x5Cc22ED76e7A88eCcCD1eaD22843e426A16384b3'
        },
        router: {
            HOST: '0xFe6c094ac4E9f72907bfd4B9034194bB16aD01ab',
            ETH: '0x64c9216152E3373D42FFDFce9CB0D1CD4f01606F',
            BSC: '0x35d6b4493b24e25Ec5bb89f944f5108efdD96309'
        }
    }
};
// L3Chain配置信息
var l3config = {
    HOST: {
        web3Provider: exchangeConfig.providers.HOST,
        contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e",
        graphDataBaseHost: "http://l3test.org:8000/subgraphs/name/l3chain/host_database",
    },
    ETH: {
        web3Provider: exchangeConfig.providers.ETH,
        contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e"
    },
    BSC: {
        web3Provider: exchangeConfig.providers.BSC,
        contractAddress: "0xf135b82D34058aE35d3c537a2EfB83462d4ee76e"
    }
};
var l3 = new sdk_1.L3Chain(l3config);
// 这里使用测试节点，测试节点上所有的账户都是解锁的，在实际使用中，请注意使用window.ethereum中的provider来接入MetaMask或者其他钱包插件
var injectionWeb3 = new web3_1.default(new web3_1.default.providers.HttpProvider('http://l3test.org:18545'));
injectionWeb3.eth.getAccounts().then(function (accounts) { return __awaiter(void 0, void 0, void 0, function () {
    var exchangePairs, router, hostPairs, usePair, targetEtid, fees, fromTokenContract, routerSender, txSender, gas, callret, exchangeHistory, _i, exchangeHistory_1, record, infos, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, sdk_2.ExchangePairsGenerater)(exchangeConfig)];
            case 1:
                exchangePairs = _c.sent();
                router = new sdk_2.ExchangeRouter(__assign(__assign({}, exchangeConfig), { l3chain: l3, generatedDatas: exchangePairs }));
                hostPairs = router.supportExchangePairs('HOST');
                usePair = hostPairs[0];
                targetEtid = usePair.toExchangeTokenIds[0];
                return [4 /*yield*/, usePair.exchangeToEstimateFee(targetEtid, accounts[0], accounts[8], injectionWeb3.utils.toWei('1'))];
            case 2:
                fees = _c.sent();
                console.log(fees);
                fromTokenContract = new injectionWeb3.eth.Contract(sdk_2.ABI.ERC20, usePair.metaData.tokenAddress);
                ////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////
                // 完成授权操作
                return [4 /*yield*/, fromTokenContract.methods.approve(router.contractAddress.HOST, injectionWeb3.utils.toWei('1')).send({
                        from: accounts[0],
                    }).then(function () {
                        console.log("Approve Router Successed");
                    })
                    ////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////
                    // 发起交易,建立Router的合约交互实例
                ];
            case 3:
                ////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////
                // 完成授权操作
                _c.sent();
                routerSender = new injectionWeb3.eth.Contract(sdk_2.ABI.Router, router.contractAddress.HOST);
                txSender = routerSender.methods.tokenExchangeToChain(usePair.metaData.etid, targetEtid, accounts[8], (0, web3_utils_1.toWei)('1'));
                return [4 /*yield*/, txSender.estimateGas({
                        from: accounts[0],
                        value: (0, web3_utils_1.toBN)(fees.feeAmount.toString()).add((0, web3_utils_1.toBN)(fees.feel3.toString()))
                    })];
            case 4:
                gas = _c.sent();
                console.log("tokenExchangeToChain gas: ".concat(gas));
                return [4 /*yield*/, txSender.call({
                        from: accounts[0],
                        value: (0, web3_utils_1.toBN)(fees.feeAmount.toString()).add((0, web3_utils_1.toBN)(fees.feel3.toString()))
                    })];
            case 5:
                callret = _c.sent();
                console.log("tokenExchangeToChain call: ".concat(callret.toString()));
                return [4 /*yield*/, router.selectExchangeHistory('HOST', {
                        first: 10,
                        orderBy: "time",
                        orderDirection: "asc",
                        where: {
                            fromAccount: accounts[0]
                        }
                    })];
            case 6:
                exchangeHistory = _c.sent();
                _i = 0, exchangeHistory_1 = exchangeHistory;
                _c.label = 7;
            case 7:
                if (!(_i < exchangeHistory_1.length)) return [3 /*break*/, 10];
                record = exchangeHistory_1[_i];
                _a = ["".concat((0, sdk_1.ChainNameFromIdentifier)(record.from.chainIdentifier), "-").concat(record.from.tokenSymbol), '/', "".concat((0, sdk_1.ChainNameFromIdentifier)(record.to.chainIdentifier), "-").concat(record.to.tokenSymbol), " ",
                    record.from.account, " -> ", record.to.account, " : ".concat((0, web3_utils_1.fromWei)(record.amount))];
                _b = " (".concat;
                return [4 /*yield*/, router.getExchangeHistoryState(record)];
            case 8:
                infos = _a.concat([
                    _b.apply(" (", [(_c.sent()).toString(), ")"])
                ]);
                console.log(infos.join(''));
                _c.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 7];
            case 10: return [2 /*return*/];
        }
    });
}); });