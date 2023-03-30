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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.L3Exchange = void 0;
var sdk_1 = require("@l3/sdk");
var web3_1 = __importDefault(require("web3"));
var exchange_pair_1 = require("./exchange-pair");
function L3Exchange(props) {
    var graphQL = props.graphQL, rpc = props.rpc;
    var clients = {};
    var web3s = {};
    for (var _i = 0, ChainNames_1 = sdk_1.ChainNames; _i < ChainNames_1.length; _i++) {
        var name_1 = ChainNames_1[_i];
        clients[name_1] = new sdk_1.GraphQlClient(graphQL[name_1]);
        web3s[name_1] = new web3_1.default(rpc[name_1]);
    }
    /**
     * 获取指定网络中Exchange支持兑换的所有交易对，其中包含了代币的基本信息
     *
     * @param chainName 网络名称
     * @returns `ExchangePair`
     */
    var exchangePairs = function (chainName) { return new Promise(function (resolve) {
        var _a;
        (_a = clients[chainName]) === null || _a === void 0 ? void 0 : _a.query("\n        {\n            exchangePairs {\n                pairContract\n                tokenAddress\n                tokenDecimals\n                tokenName\n                tokenSymbol\n            }\n        }\n        ").then(function (rsp) {
            console.log(rsp);
            return resolve(rsp.exchangePairs.map(function (pair) {
                return (0, exchange_pair_1.ExchangePair)(__assign(__assign({}, pair), { web3: web3s[chainName] }));
            }));
        });
    }); };
    return { exchangePairs: exchangePairs };
}
exports.L3Exchange = L3Exchange;
