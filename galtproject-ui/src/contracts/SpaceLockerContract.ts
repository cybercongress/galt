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

import GaltData from "../services/galtData";
import SpaceReputationAccountingContract from "./SpaceReputationAccountingContract";
import FundSpaceReputationAccountingContract from "./FundSpaceReputationAccountingContract";

const pIteration = require('p-iteration');
const EthContract = require('../libs/EthContract');

export default class SpaceLocker extends EthContract {
    owner;
    spaceTokenId;
    reputation;
    reputationStr;
    tokenDeposited;
    tokenBurned;
    
    srasCount;
    
    async deposit(sendOptions, spaceTokenId) {
        return await this.sendMethod(sendOptions, 'deposit', spaceTokenId);
    }
    async withdraw(sendOptions, spaceTokenId) {
        return await this.sendMethod(sendOptions, 'withdraw', spaceTokenId);
    }
    async approveMint(sendOptions, sraAddress) {
        return await this.sendMethod(sendOptions, 'approveMint', sraAddress);
    }
    async approveBurn(sendOptions, sraAddress) {
        return await this.sendMethod(sendOptions, 'burn', sraAddress);
    }
    async fetchTokenInfo() {
        const tokenInfo = await this.massCallMethod('getTokenInfo', []);
        
        this.owner = tokenInfo._owner.toLowerCase();
        this.spaceTokenId = tokenInfo._spaceTokenId.toString(10);
        this.reputation = GaltData.weiToEtherRound(tokenInfo._reputation);
        this.reputationStr = GaltData.beautyNumber(this.reputation);
        this.tokenDeposited = tokenInfo._tokenDeposited;
        this.tokenBurned = tokenInfo._tokenBurned;
    }
    
    async getSrasAddresses() {
        return (await this.massCallMethod('getSras', [])).map((a) => a.toLowerCase());
    }

    async getSrasCount() {
        return (await this.massCallMethod('getSrasCount', [])).toString(10);
    }
    
    async getIsMinted(sraAddress) {
        return this.massCallMethod('isMinted', [sraAddress]);
    }
    
    async fetchSrasCount() {
        this.srasCount = await this.getSrasCount();
    }
}
