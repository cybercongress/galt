/*
 * Copyright ©️ 2018 Galt•Space Society Construction and Terraforming Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka),
 * [Dima Starodubcev](https://github.com/xhipster), 
 * [Valery Litvin](https://github.com/litvintech) by 
 * [Basic Agreement](http://cyb.ai/QmSAWEG5u5aSsUyMNYuX2A2Eaz4kEuoYWUkVBRdmu9qmct:ipfs)).
 * ​
 * Copyright ©️ 2018 Galt•Core Blockchain Company 
 * (Founded by [Nikolai Popeka](https://github.com/npopeka) and 
 * Galt•Space Society Construction and Terraforming Company by 
 * [Basic Agreement](http://cyb.ai/QmaCiXUmSrP16Gz8Jdzq6AJESY1EAANmmwha15uR3c1bsS:ipfs)).
 */

import EthData from "@galtproject/frontend-core/libs/EthData";

const EthContract = require('../libs/EthContract');

export default class SpaceCustodianRegistryContract extends EthContract {
    
    async spaceTokenCustodians(spaceTokenId) {
        return this.massCallMethod("spaceCustodians", [spaceTokenId]);
    }
    async spaceTokenCustodianDocuments(spaceTokenId) {
        return (await this.massCallMethod("spaceDocuments", [spaceTokenId])).map(EthData.hexToString);
    }
    async custodianSpaceTokensIds(custodianAddress) {
        return this.massCallMethod("custodianTokens", [custodianAddress]);
    }
}
