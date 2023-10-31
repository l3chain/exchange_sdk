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
var web3_1 = __importDefault(require("web3"));
var sdk_1 = require("@l3chain/sdk");
var sdk_2 = require("@l3exchange/sdk");
var config = {
    HOST: {
        provider: "http://l3test.org:18545",
        graphURL: "http://l3test.org:8000/subgraphs/name/l3/exchange_host",
        factoryAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
        routerAddress: "0x8142FE663fE28E7aEd9B859C0475C8ef7F3C5539"
    },
    ETH: {
        provider: "http://l3test.org:28545",
        graphURL: "http://l3test.org:8000/subgraphs/name/l3/exchange_eth",
        factoryAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
        routerAddress: "0x8142FE663fE28E7aEd9B859C0475C8ef7F3C5539"
    },
    BSC: {
        provider: "http://l3test.org:38545",
        graphURL: "http://l3test.org:8000/subgraphs/name/l3/exchange_bsc",
        factoryAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
        routerAddress: "0x8142FE663fE28E7aEd9B859C0475C8ef7F3C5539"
    }
};
var l3 = new sdk_1.L3Chain({
    graphDataBaseHost: "http://l3test.org:8000/subgraphs/name/l3chain/host_database",
    providers: {
        HOST: {
            web3Provider: new web3_1.default.providers.HttpProvider(config.HOST.provider),
            contractAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
        },
        ETH: {
            web3Provider: new web3_1.default.providers.HttpProvider(config.ETH.provider),
            contractAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0",
        },
        BSC: {
            web3Provider: new web3_1.default.providers.HttpProvider(config.BSC.provider),
            contractAddress: "0xd84dA80c18A046036a35c99a807bAE27C5FD25e0"
        },
    }
});
// 获取当前所有支持的资产元数据，改方法返回的metaDatas可以保存为一个json，当资产列表更新不频繁时，可以采取静态文件保存的形式保存
// 方便在后续创建ExchangeRouter对象时候，直接载入，来提高初始化的速度，当元数据数据量较大时候，效率会有明显的提升。
function fetchMetaDatas() {
    return __awaiter(this, void 0, void 0, function () {
        var metaDatas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sdk_2.ExchangePairsGenerater)(Object.keys(config).reduce(function (ret, chainName) {
                        ret[chainName] = config[chainName].graphURL;
                        return ret;
                    }, {}))];
                case 1:
                    metaDatas = _a.sent();
                    console.log(JSON.stringify(metaDatas));
                    return [2 /*return*/, metaDatas];
            }
        });
    });
}
function createExchangeRouter() {
    return __awaiter(this, void 0, void 0, function () {
        var metaDatas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchMetaDatas()];
                case 1:
                    metaDatas = _a.sent();
                    return [2 /*return*/, new sdk_2.ExchangeRouter(l3, {
                            generatedDatas: metaDatas,
                            chains: __assign({}, config)
                        })];
            }
        });
    });
}
createExchangeRouter().then(function (router) {
    // ...
});
