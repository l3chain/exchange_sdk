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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangePairsGenerater = void 0;
var sdk_1 = require("@l3chain/sdk");
function ExchangePairsGenerater(graphURL) {
    return __awaiter(this, void 0, void 0, function () {
        var getExchangePairs, paris, _loop_1, _i, ChainNames_1, name_1, _loop_2, _a, _b, key;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    getExchangePairs = function (chainName) { return new Promise(function (resolve) {
                        new sdk_1.GraphQlClient(graphURL[chainName]).query("\n        {\n            exchangePairs {\n              id\n              pairContract\n              tokenAddress\n              tokenDecimals\n              tokenName\n              tokenSymbol\n              etid {\n                id\n                chainIdentifier\n                shadowEmiter\n                tokenContract\n                decimals\n              }\n              fromEtid:acceptETIDs {\n                id\n                chainIdentifier\n                shadowEmiter\n                tokenContract\n                decimals\n              }\n            }\n          }\n        ").then(function (rsp) { return resolve(rsp.exchangePairs); });
                    }); };
                    paris = {};
                    _loop_1 = function (name_1) {
                        var parisInChain;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, getExchangePairs(name_1)];
                                case 1:
                                    parisInChain = _d.sent();
                                    parisInChain.forEach(function (pair) {
                                        Object.assign(pair, { toEtid: [] });
                                        paris["".concat(name_1, "-").concat(pair.pairContract).toLowerCase()] = pair;
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, ChainNames_1 = sdk_1.ChainNames;
                    _c.label = 1;
                case 1:
                    if (!(_i < ChainNames_1.length)) return [3 /*break*/, 4];
                    name_1 = ChainNames_1[_i];
                    return [5 /*yield**/, _loop_1(name_1)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    _loop_2 = function (key) {
                        var pair = paris[key];
                        pair.fromEtid.forEach(function (etid) {
                            paris["".concat(etid.chainIdentifier.toChainName(), "-").concat(etid.shadowEmiter).toLowerCase()].toEtid.push(pair.etid);
                        });
                    };
                    for (_a = 0, _b = Object.keys(paris); _a < _b.length; _a++) {
                        key = _b[_a];
                        _loop_2(key);
                    }
                    return [2 /*return*/, Promise.resolve(Object.values(paris))];
            }
        });
    });
}
exports.ExchangePairsGenerater = ExchangePairsGenerater;
