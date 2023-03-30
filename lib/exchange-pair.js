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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangePair = void 0;
var IExchangePairABI = require('@l3exchange/contracts/build/contracts/IExchangePair.json');
function ExchangePair(props) {
    console.log(IExchangePairABI);
    var pairContract = props.pairContract, tokenAddress = props.tokenAddress, tokenDecimals = props.tokenDecimals, tokenName = props.tokenName, tokenSymbol = props.tokenSymbol, web3 = props.web3;
    // let contract = new web3.eth.Contract(IExchangePairABI.)
    // let contract = new Contract([], pairContract)
    return __assign({}, props);
}
exports.ExchangePair = ExchangePair;
