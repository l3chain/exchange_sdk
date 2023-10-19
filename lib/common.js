"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainNameFromIdentifier = void 0;
var sdk_1 = require("@l3chain/sdk");
String.prototype.toChainName = function () {
    var nameRecord = {};
    nameRecord[sdk_1.ChainIdentifiers.HOST] = "HOST";
    nameRecord[sdk_1.ChainIdentifiers.ETH] = "ETH";
    nameRecord[sdk_1.ChainIdentifiers.BSC] = "BSC";
    return nameRecord[this];
};
function ChainNameFromIdentifier() {
}
exports.ChainNameFromIdentifier = ChainNameFromIdentifier;
