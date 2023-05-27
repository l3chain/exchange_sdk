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
        while (_) try {
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
var hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
var config = {
    graphQL: {
        HOST: process.env.GRAPH_HOST + "/subgraphs/name/l3/exchange_host",
        BSC: process.env.GRAPH_HOST + "/subgraphs/name/l3/exchange_bsc"
    },
    providers: {
        HOST: process.env.HOST_RPC,
        BSC: process.env.BSC_RPC,
    },
    addresses: {
        factory: {
            HOST: '0xAE47E2EA585cF3cFC906a9D9a70c7838e81739EB',
            BSC: '0xAaE65Cd82FaEDdCbCfc604B21C7C8BbDBA321A90'
        },
        router: {
            HOST: '0xF3dCb38C7d9a9068Da47315E64A86DfA4f187679',
            BSC: '0xfd0DbacD866eF04873EaEFF1109C4ab099338514'
        }
    }
};
var l3 = new sdk_1.L3Chain({
    HOST: {
        web3Provider: new web3_1.default.providers.HttpProvider(config.providers.HOST),
        chainIdentifier: "0x0000000000000000000000000000000000000000000000000000000000000000",
        contractAddress: "0xfb93Ba0cE755Ce1f0c6c620BA868FA5F0c9889fb",
        graphDataBaseHost: process.env.GRAPH_HOST + "/subgraphs/name/l3chain/host_database",
    },
    BSC: {
        web3Provider: new web3_1.default.providers.HttpProvider(config.providers.BSC),
        chainIdentifier: "0xe1430158eac8c4aa6a515be5ef2c576a7a9559adbd0c276cd9573854e0473494",
        contractAddress: "0x13A656e743a104fFd6b512D0Ab5d9eDF1Ed7049a"
    },
});
var senderProvider = new hdwallet_provider_1.default(process.env.TEST_PK, process.env.HOST_RPC);
var injectionWeb3 = new web3_1.default(senderProvider);
var BatchTransactionConfig = {
    exchangeAmountMul: web3_utils_1.toBN(web3_utils_1.toWei('0.0001')),
    batchCount: 100,
    gasPrice: web3_utils_1.toBN(web3_utils_1.toWei('500', 'Gwei'))
};
injectionWeb3.eth.getAccounts().then(function (accounts) { return __awaiter(void 0, void 0, void 0, function () {
    var exchangePairs, router, hostPairs, usePair, targetEtid, fees, routerSender, txSender, data, rawTxs, gas, nonce, i, rawTx, sentCount, senders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sdk_2.ExchangePairsGenerater(config)];
            case 1:
                exchangePairs = _a.sent();
                router = new sdk_2.ExchangeRouter(__assign(__assign({}, config), { l3chain: l3, generatedDatas: exchangePairs }));
                hostPairs = router.supportExchangePairs('HOST');
                usePair = hostPairs.find(function (pair) { return pair.metaData.tokenSymbol == "WBPG"; });
                targetEtid = usePair.toExchangeTokenIds[0];
                return [4 /*yield*/, usePair.exchangeToEstimateFee(targetEtid, senderProvider.getAddress(), senderProvider.getAddress(), BatchTransactionConfig.exchangeAmountMul)];
            case 2:
                fees = _a.sent();
                routerSender = new injectionWeb3.eth.Contract(sdk_2.ABI.Router, router.contractAddress.HOST);
                txSender = routerSender.methods.coinExchangeToChain(usePair.metaData.etid, targetEtid, senderProvider.getAddress());
                data = txSender.encodeABI();
                rawTxs = [];
                return [4 /*yield*/, txSender.estimateGas({
                        from: senderProvider.getAddress(),
                        value: web3_utils_1.toBN(fees.feeAmount.toString()).add(web3_utils_1.toBN(fees.feel3.toString())).add(BatchTransactionConfig.exchangeAmountMul)
                    }).then(web3_utils_1.toBN)];
            case 3:
                gas = _a.sent();
                console.log("Sign " + BatchTransactionConfig.batchCount + " transactions...");
                return [4 /*yield*/, injectionWeb3.eth.getTransactionCount(senderProvider.getAddress())];
            case 4:
                nonce = _a.sent();
                i = 0;
                _a.label = 5;
            case 5:
                if (!(i < BatchTransactionConfig.batchCount)) return [3 /*break*/, 8];
                return [4 /*yield*/, injectionWeb3.eth.signTransaction({
                        from: senderProvider.getAddress(),
                        to: router.contractAddress.HOST,
                        nonce: nonce,
                        value: web3_utils_1.toBN(fees.feeAmount.toString())
                            .add(web3_utils_1.toBN(fees.feel3.toString()))
                            .add(BatchTransactionConfig.exchangeAmountMul.muln(i + 1)),
                        data: data,
                        gas: gas.muln(2),
                        gasPrice: BatchTransactionConfig.gasPrice
                    })];
            case 6:
                rawTx = _a.sent();
                nonce++;
                rawTxs.push(rawTx.raw);
                _a.label = 7;
            case 7:
                i++;
                return [3 /*break*/, 5];
            case 8:
                console.log("Sign Tx Successed");
                sentCount = 0;
                senders = rawTxs.map(function (txData) {
                    console.log("Total Sent Count: " + sentCount++);
                    return injectionWeb3.eth.sendSignedTransaction(txData);
                });
                return [4 /*yield*/, Promise.all(senders).then(function (receipts) {
                        console.log("Sent Transaction Hashs:");
                        console.log(receipts.map(function (r) { return r.transactionHash; }));
                    })];
            case 9:
                _a.sent();
                return [2 /*return*/, Promise.resolve()];
        }
    });
}); });
