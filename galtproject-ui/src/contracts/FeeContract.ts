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
import AbstractApplicationContract from "./AbstractApplicationContract";
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";
import TokenContract from "@galtproject/frontend-core/components/GaltMultisig/contracts/TokenContract";
const pIteration = require('p-iteration');

export default class FeeContract extends AbstractApplicationContract {
    
    currency;
    category;
    rate;
    period;
    title;
    description;
    proposalDescription;
    docLink;

    currencyContract;
    currencyStr;
    
    async fetchInfo() {
        this.rate = await this.getRate();
        this.period = await this.getPeriod();
        
        const details = await this.getDetails();
        this.currency = details.feeCurrency;
        this.category = details.feeCategory;
        
        if(this.currency === 'erc20') {
            try {
                this.currencyContract = await EthData.initContract(TokenContract, await this.getErc20Token(), GaltData.erc20Abi);
                this.currencyStr = await this.currencyContract.getSymbol();
            } catch (e) {
                this.currencyStr = "[Unknown]";
            }
        } else if(this.currency) {
            this.currencyStr = this.currency.toUpperCase();
        }
        this.title = details.title;
        this.description = details.description;
        this.docLink = details.docLink;
    }

    async getRate() {
        return GaltData.weiToEtherRound(await this.getRateWei());
    }
    async getRateWei() {
        return this.massCallMethod('rate', []);
    }
    async getPeriod() {
        return parseInt((await this.massCallMethod('periodLength', [])).toString(10));
    }
    async getInitialTimestamp() {
        return parseInt((await this.massCallMethod('initialTimestamp', [])).toString(10));
    }
    async getErc20Token() {
        return this.massCallMethod('erc20Token', []);
    }
    async getIsDetailsSet() {
        return this.massCallMethod('detailsSet', []);
    }
    async getDetails() {
        const details = await this.massCallMethod('getDetails', []);
        details.feeType = EthData.hexToString(details._feeType);
        details.feeCategory = details.feeType.split('_')[0];
        details.feeCurrency = details.feeType.split('_')[1];
        details.title = details._title;
        details.description = details._description;
        details.docLink = details._docLink;
        return details;
    }
    
    async paidUntil(tokenId) {
        return parseInt((await this.massCallMethod('paidUntil', [tokenId])).toString(10));
    }

    async totalPaid(tokenId) {
        const totalPaidWei = await this.massCallMethod('totalPaid', [tokenId]);
        return EthData.weiToEther(totalPaidWei);
    }

    async calcPeriodsCountToPay(paidUntil, period) {
        const nowTimestamp = Math.round(new Date().getTime() / 1000);
        if(paidUntil > nowTimestamp) {
            return 0;
        }

        // return 1;
        return Math.ceil(Math.round(nowTimestamp - paidUntil) / period);
    }
    

    async getPayData(sraContract, userAddress) {
        const tokensIds = await sraContract.getSpaceTokensByOwner(userAddress);
        if(!tokensIds.length) {
            return {
                tokensIds: [],
                paySums: [],
                sum: 0
            }
        }
        const rateWei = await this.getRateWei();
        const period = await this.getPeriod();
        const initialTimestamp = await this.getInitialTimestamp();
        const curTimestamp = Math.round(new Date().getTime() / 1000);
        
        const tokensIdsForLock = [];
        const tokensIdsForUnlock = [];
        const lockedTokensIds = [];
        
        let sumWei = 0;
        let totalPaidSum = 0;
        let minPaidUntil = 0;
        const paySumsWei = await pIteration.map(tokensIds, async (tokenId) => {
            const paidUntil = await this.paidUntil(tokenId);
            if(paidUntil != 0 && (paidUntil < minPaidUntil || minPaidUntil == 0)) {
                minPaidUntil = paidUntil;
            }
            
            totalPaidSum += await this.totalPaid(tokenId);
            
            if(await sraContract.storage.isSpaceTokenLocked(tokenId)) {
                lockedTokensIds.push(tokenId);
                if(paidUntil > curTimestamp) {
                    tokensIdsForUnlock.push(tokenId);
                }
            } else if(paidUntil < curTimestamp) {
                tokensIdsForLock.push(tokenId)
            }
            
            const periodsCount = await this.calcPeriodsCountToPay(paidUntil || initialTimestamp, period);
            const paySumWei = EthData.mulBN(rateWei, periodsCount);
            sumWei = EthData.addBN(sumWei, paySumWei);
            return paySumWei;
        });
        
        return {
            payPerPeriod: EthData.weiToEther(EthData.mulBN(rateWei, tokensIds.length)),
            tokensIds,
            tokensIdsForLock,
            tokensIdsForUnlock,
            lockedTokensIds,
            paySumsWei,
            paySums: paySumsWei.map(wei => EthData.weiToEther(wei)),
            sumWei,
            sum: EthData.weiToEther(sumWei),
            totalPaidSum,
            minPaidUntil
        }
    }


    async setDetails(sendOptions, params) {
        return this.sendMethod(
            sendOptions,
            "setDetails",
            EthData.stringToHex(params.feeType),
            params.title,
            params.description,
            params.docLink
        )
    }
    
    async payArray(sendOptions, tokensIds, amountsWei, currency) {
        let totalAmount = 0;
        amountsWei.forEach(amount => {
            totalAmount = EthData.addBN(totalAmount, amount)
        });
        if(currency === 'eth') {
            sendOptions = _.extend({}, sendOptions, {value: totalAmount});
        }
        return this.sendMethod(
            sendOptions,
            "payArray",
            tokensIds,
            amountsWei
        )
    }

    async lockArray(sendOptions, tokensIds) {
        return this.sendMethod(
            sendOptions,
            "lockSpaceTokensArray",
            tokensIds
        )
    }

    async unlockArray(sendOptions, tokensIds) {
        return this.sendMethod(
            sendOptions,
            "unlockSpaceTokensArray",
            tokensIds
        )
    }
}
