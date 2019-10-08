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
import * as pIteration from "p-iteration";
import EthData from "@galtproject/frontend-core/libs/EthData";

const _ = require('lodash');
const EthContract = require('../libs/EthContract');

export default class SpaceReputationAccountingContract extends EthContract {
    spaceTokenOwnersCount;
    totalSupply;
    totalSupplyStr;
    
    async getSpaceTokenOwners() {
        return this.massCallMethod('spaceTokenOwners', []);
    }
    async getSpaceTokensIds() {
        const spaceTokenOwners = await this.getSpaceTokenOwners();

        let spaceTokens = [];
        await pIteration.forEachSeries(spaceTokenOwners, async (spaceOwner) => {
            spaceTokens = spaceTokens.concat(await this.getSpaceTokensByOwner(spaceOwner));
        });

        return spaceTokens;
    }
    async getSpaceTokensAsync(finishCallback?) {
        const spaceTokenOwners = await this.getSpaceTokenOwners();
        
        let spaceTokens = [];
        pIteration.mapSeries(spaceTokenOwners, async (spaceOwner) => {
            const spaceTokensByOwner = await this.getSpaceTokensByOwner(spaceOwner);

            await pIteration.forEachSeries(spaceTokensByOwner, async (spaceTokenId) => {
                const spaceTokenObj = await GaltData.getSpaceTokenObjectById(spaceTokenId);
                spaceTokens.push(spaceTokenObj);
            });
        }).then(() => finishCallback ? finishCallback() : () => {});
        
        return spaceTokens;
    }
    async getSpaceTokenOwnersCount() {
        return parseInt(await this.massCallMethod('spaceTokenOwnersCount', []));
    }
    async getSpaceTokensByOwner(owner) {
        return (await this.massCallMethod('spaceTokensByOwner', [owner])).map(tokenId => tokenId.toString(10));
    }
    async getSpaceTokensByOwnerCount(owner) {
        return parseInt(await this.massCallMethod('spaceTokensByOwnerCount', [owner]));
    }
    async getIsMember(owner) {
        return this.massCallMethod('isMember', [owner]);
    }
    async getOwnerHasSpaceToken(owner, spaceTokenId) {
        return this.massCallMethod('ownerHasSpaceToken', [owner, spaceTokenId]);
    }
    async getTotalSupply() {
        return GaltData.weiToEtherRound(await this.massCallMethod('totalSupply', []));
    }
    async getBalanceOf(owner) {
        return GaltData.weiToEtherRound(await this.massCallMethod('balanceOf', [owner]));
    }
    async getOwnedBalanceOf(owner) {
        return GaltData.weiToEtherRound(await this.massCallMethod('ownedBalanceOf', [owner]));
    }
    async getDelegatedBalanceOf(owner, delegate) {
        return GaltData.weiToEtherRound(await this.massCallMethod('delegatedBalanceOf', [delegate, owner]));
    }
    async getDelegations(owner) {
        return this.massCallMethod('delegations', [owner]);
    }
    async getDelegationsCount(owner) {
        return parseInt(await this.massCallMethod('delegationCount', [owner]));
    }
    async getDelegatedBy(owner) {
        return this.massCallMethod('delegatedBy', [owner]);
    }
    async getDelegatedByCount(owner) {
        return parseInt(await this.massCallMethod('delegatedByCount', [owner]));
    }
    async delegatedBalanceOf(owner, delegate) {
        return GaltData.weiToEtherRound(await this.massCallMethod('delegatedBalanceOf', [owner, delegate]));
    }
    async fetchGeneralInfo() {
        this.spaceTokenOwnersCount = await this.getSpaceTokenOwnersCount();
        this.totalSupply = await this.getTotalSupply();
        this.totalSupplyStr = GaltData.beautyNumber(this.totalSupply);
    }
    async mint(sendOptions, spaceLockerAddress) {
        return await this.sendMethod(sendOptions, 'mint', spaceLockerAddress);
    }
    async burn(sendOptions, spaceLockerAddress) {
        return await this.sendMethod(sendOptions, 'approveBurn', spaceLockerAddress);
    }
    async delegateReputation(sendOptions, fromOwner, toAddress, amount) {
        return await this.sendMethod(sendOptions, 'delegate', toAddress, fromOwner, EthData.etherToWei(amount));
    }
    async revokeReputation(sendOptions, fromOwner, amount) {
        return await this.sendMethod(sendOptions, 'revoke', fromOwner, EthData.etherToWei(amount));
    }
}
