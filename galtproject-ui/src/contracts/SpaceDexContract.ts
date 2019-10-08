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

const EthContract = require('../libs/EthContract');

export default class SpaceDexContract extends EthContract {
    async isSpaceTokenAvailableForSell(spaceTokenId) {
        return this.massCallMethod('availableForSell', [spaceTokenId]);
    }
    async isSpaceTokenAvailableForBuy(spaceTokenId) {
        return this.massCallMethod('availableForBuy', [spaceTokenId]);
    }
    async spaceTokenPrice(spaceTokenId) {
        return EthData.weiToEtherRound(await this.massCallMethod('getSpaceTokenActualPrice', [spaceTokenId]));
    }
    async feeForAmount(galtAmount, direction) {
        return EthData.weiToEtherRound(await this.massCallMethod('getFeeForAmount', [EthData.etherToWei(galtAmount), direction == 'sell' ? '0' : '1']));
    }
    async spaceTokenPriceWithFee(spaceTokenId) {
        return EthData.weiToEtherRound(await this.massCallMethod('getSpaceTokenActualPriceWithFee', [spaceTokenId]));
    }
    async spaceTokenCustodian(spaceTokenId) {
        return await this.massCallMethod('getSpaceTokenCustodian', [spaceTokenId]);
    }
    async filterSpaceTokensByAvailableForSellOnSpaceDex(spaceTokens) {
        return await pIteration.filter(spaceTokens, async (spaceToken: any) => {
            const isSpaceTokenOnSale = await this.isSpaceTokenAvailableForSell(spaceToken.tokenId);
            if(isSpaceTokenOnSale) {
                spaceToken.price = await this.spaceTokenPrice(spaceToken.tokenId);
                spaceToken.fee = await this.feeForAmount(spaceToken.price, 'sell');
                spaceToken.price = spaceToken.price - spaceToken.fee;
                spaceToken.custodians = await this.spaceTokenCustodian(spaceToken.tokenId);
            }
            return isSpaceTokenOnSale;
        });
    }
    async spaceTokensOnSale() {
        await this.onReady();
        const ownedBySpaceDexTokens = await GaltData.spaceTokenIdsToObjects(await GaltData.getUserSpaceTokensIds(this.address));
        return await this.filterSpaceTokensByAvailableForBuyOnSpaceDex(ownedBySpaceDexTokens);
    }
    async spaceTokensOnSaleCount() {
        await this.onReady();
        return await GaltData.spaceTokensCount(this.address);
    }
    async filterSpaceTokensByAvailableForBuyOnSpaceDex(spaceTokens) {
        return await pIteration.filter(spaceTokens, async (spaceToken: any) => {
            const isSpaceTokenForBuy = await this.isSpaceTokenAvailableForBuy(spaceToken.tokenId);
            if(isSpaceTokenForBuy) {
                spaceToken.price = await this.spaceTokenPrice(spaceToken.tokenId);
                spaceToken.fee = await this.feeForAmount(spaceToken.price, 'buy');
                spaceToken.price = spaceToken.price + spaceToken.fee;
                spaceToken.custodians = await this.spaceTokenCustodian(spaceToken.tokenId);
            }
            return isSpaceTokenForBuy
        });
    }
    async exchangeSpaceToGalt(sendOptions, spaceTokenId) {
        return await this.sendMethod(sendOptions, 'exchangeSpaceToGalt', spaceTokenId);
    }

    async exchangeGaltToSpace(sendOptions, spaceTokenId) {
        return await this.sendMethod(sendOptions, 'exchangeGaltToSpace', spaceTokenId);
    }

    async hasRole(userWallet, role) {
        return this.massCallMethod('hasRole', [userWallet, role]);
    }

    async withdrawFee(sendOptions) {
        return await this.sendMethod(sendOptions, 'withdrawFee');
    }

    async setFee(sendOptions, amount, direction) {
        return await this.sendMethod(sendOptions, "setFee", EthData.szaboToWei(amount), direction == 'sell' ? '0' : '1');
    }
}
