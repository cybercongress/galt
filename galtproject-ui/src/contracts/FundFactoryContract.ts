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

const EthContract = require('../libs/EthContract');

export default class FundFactoryContract extends EthContract {
    totalSteps = 8;
    defaultThresholds = [60, 50, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 5];
    
    async buildFirstStep(sendOptions, fundParams) {
        if(fundParams.feeCurrency === 'eth') {
            sendOptions.ether = fundParams.fee;
        }
        const response = await this.sendMethod(sendOptions, 'buildFirstStep', fundParams.operator, fundParams.isPrivate, fundParams.thresholds, fundParams.multiSigInitialOwners, fundParams.multiSigRequired, fundParams.feePeriod);
        // fundMultiSig
        // fundStorage
        // fundController
        return this.parseEvent('CreateFundFirstStep', response.receipt);
    }
    async buildSecondStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildSecondStep', fundParams.fundId);
        // fundRsra
        // modifyConfigProposalManager
        // newMemberProposalManager
        return this.parseEvent('CreateFundSecondStep', response.receipt);
    }
    async buildThirdStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildThirdStep', fundParams.fundId);
        // fineMemberProposalManager
        // whiteListProposalManager
        // expelMemberProposalManager
        return this.parseEvent('CreateFundThirdStep', response.receipt);
    }
    async buildFourthStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildFourthStep', fundParams.fundId);
        // changeNameAndDescriptionProposalManager
        return this.parseEvent('CreateFundFourthStep', response.receipt);
    }
    async buildFifthStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildFifthStep', fundParams.fundId, fundParams.name, fundParams.description);
        // addFundRuleProposalManager
        // deactivateFundRuleProposalManager
        return this.parseEvent('CreateFundFifthStep', response.receipt);
    }
    async buildSixthStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildSixthStep', fundParams.fundId, fundParams.initialSpaceTokensToApprove);
        // changeMultiSigOwnersProposalManager
        return this.parseEvent('CreateFundSixthStep', response.receipt);
    }
    async buildSeventhStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildSeventhStep', fundParams.fundId);
        // changeNameAndDescriptionProposalManager
        return this.parseEvent('CreateFundSeventhStep', response.receipt);
    }
    async buildEighthStep(sendOptions, fundParams) {
        const response = await this.sendMethod(sendOptions, 'buildEighthStep', fundParams.fundId);
        // changeNameAndDescriptionProposalManager
        return this.parseEvent('CreateFundEighthStep', response.receipt);
    }
    
    async getLastCreatedContracts(fundId) {
        if(!fundId) {
            return {currentStep: 0};
        }
        // currentStep
        // rsra
        // fundMultiSig
        // fundStorage
        // fundController
        const lastCreatedContracts = await this.massCallMethod('getLastCreatedContracts', [fundId]);
        lastCreatedContracts.currentStep = parseInt(lastCreatedContracts.currentStep.toString(10));
        lastCreatedContracts.fundRa = lastCreatedContracts.fundRA;
        if(lastCreatedContracts.fundRa === GaltData.nullAddress) {
            lastCreatedContracts.fundRa = null;
        }
        lastCreatedContracts.fundId = fundId.toString(10);
        return lastCreatedContracts;
    }

    async getEthFee() {
        return GaltData.weiToEtherRound(await this.massCallMethod('ethFee', []));
    }

    async getGaltFee() {
        return GaltData.weiToEtherRound(await this.massCallMethod('galtFee', []));
    }
}
