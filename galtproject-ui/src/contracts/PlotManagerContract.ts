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
const galtUtils = require('@galtproject/utils');
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";
const Web3 = require('web3');

export default class PlotManagerContract extends AbstractApplicationContract {

    applicationStatuses = [
        {id: -1, name: 'all'},
        {id: 1, name: 'submitted'},
        {id: 2.5, name: 'locked'}, // custom status for frontend
        {id: 2, name: 'approved'},
        {id: 3, name: 'rejected'},
        {id: 4, name: 'reverted'},
        {id: 5, name: 'closed'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'pending'},
        {id: 2, name: 'locked'},
        {id: 3, name: 'approved'},
        {id: 4, name: 'rejected'},
        {id: 5, name: 'reverted'}
    ];
    
    generateCredentialsHash(fullName, documentId) {
        return Web3.utils.sha3(fullName + "." + documentId)
    }
    
    async getApplicationById(applicationId, params: any = {}) {
        const application: any = await super.getApplicationById(applicationId, params, (roleValidation, application) => {
            if(application.statusName === 'rejected') {
                return;
            }
            if(roleValidation.oracle && roleValidation.oracle == params.validationForAddress) {
                if(_.includes(['locked', 'approved', 'rejected', 'reverted'], roleValidation.statusName)) {
                    // set personal status for oracle
                    application.status = this.getApplicationStatusIdByName(roleValidation.statusName);
                    application.statusName = this.getApplicationStatusName(application);
                }
            }
        });

        application.spaceTokenId = application.spaceTokenId.toString(10);
        
        application.contractType = 'plotManager';
        if(application.spaceTokenId == 0) {
            application.spaceTokenId = null;
        }
        application.spaceToken = null;
        
        application.ledgerIdentifierName = EthData.hexToString(application.ledgerIdentifier);
        
        GaltData.setAdditionalDescription(application);

        application.claimed = true;
        
        application.resolved = false;
        const promises = [];
        
        let spaceTokenPromise;
        
        if(application.spaceTokenId) {
            spaceTokenPromise = GaltData.getSpaceTokenObjectById(application.spaceTokenId).then((spaceToken) => {
                application.spaceToken = spaceToken;
                if(spaceToken.owner.toLowerCase() === this.address.toLowerCase()) {
                    application.claimed = false;
                }
            }).catch(() => { });
        } else {
            spaceTokenPromise = this.getDetailsAsSpaceToken(applicationId).then((details) => {
                application.spaceToken = details;
            });
        }
        
        try {
            await spaceTokenPromise;
        } catch (e) {

        }

        if(params.withFinance) {
            _.extend(application, {
                price: null,
                oraclesReward: null,
                galtSpaceReward: null,
                gasDepositEstimation: null,
                latestCommittedFee: null,
                feeRefundAvailable: null,
                gasDepositRedeemed: null,
                galtSpaceRewardPaidOut: null
            });

            const financePromise = this.massCallMethod("getApplicationFees", [applicationId]).then(async (applicationFinance) => {
                _.extend(application, applicationFinance);
                if(application.spaceTokenId) {
                    application.price = await GaltData.spaceTokenPrice(application.spaceTokenId);
                }
            });
            promises.push(financePromise);
        }

        application.resolvePromise = Promise.all(promises).then(() => {
            application.resolved = true;
        }).catch(() =>{});
        
        return application;
    }
    
    async getDetailsAsSpaceToken(applicationId) {
        const application = await this.massCallMethod("getApplicationById", [applicationId]);
        
        return this.massCallMethod('getApplicationDetailsById', [applicationId]).then((details) => {
            details.applicationId = applicationId;
            details.level = parseInt(details.level);
            details.contour = details.packageContour.map(galtUtils.numberToGeohash);
            details.heights = details.heights.map(GaltData.weiToEtherRound);
            details.areaSource = parseInt(details.areaSource.toString(10));

            details.ledgerIdentifier = EthData.hexToString(details.ledgerIdentifier);

            if(details.areaSource === 1) {
                details.type = details.level == 0 ? 'plot' : 'building'
            } else {
                if(_.includes(details.description, 'room=')) {
                    details.type = 'predefined_room';
                } else {
                    details.type = 'predefined_building';
                }
            }
            details.area = GaltData.weiToEtherRound(details.area);
            details.colorLevel = details.level < 10 ? details.level : details.level % 10 + 1;

            details.description = application.description;
            GaltData.setAdditionalDescription(details);
            
            details.currency = application.currency === '1' ? 'galt' : "eth";
            
            return details;
        });
    }

    async applyForPlotOwnership(sendOptions, options) {
        return this.sendMethod(
            _.extend(sendOptions),
            "applyForPlotOwnership",
            GaltData.geohashArrayToUint(options.packageContour),
            options.heights.map(EthData.etherToWei),
            options.level,
            '0',
            options.credentialsHash,
            EthData.toBytes(options.ledgerIdentifier)
        )
    }

    async addZeroGeohashes(sendOptions, application) {
        return this.sendMethod(
            sendOptions,
            "addGeohashesToApplication",
            application.id,
            [],
            [],
            []
        )
    }
    
    async changeApplicationDetails(sendOptions, application) {
        return this.sendMethod(
            sendOptions,
            'changeApplicationDetails',
            application.id,
            application.credentialsHash,
            EthData.toBytes(application.ledgerIdentifier),
            application.precision,
            // GaltData.toBytes(application.country)
        );
    }

    async submitApplication(sendOptions, application) {
        let valueToSend;
        let method = "submitApplication";

        if(application.fee < 0) {
            application.fee = 0;
        }

        if(application.feeCurrency == 'eth') {
            valueToSend = EthData.etherToWei(application.fee);
        }

        let description = GaltData.getAdditionalDescriptionForSend(application);

        return this.sendMethod(
            _.extend(sendOptions, {value: valueToSend}),
            method,
            application.multiSig,
            GaltData.geohashArrayToUint(application.contour),
            application.heights.map(EthData.etherToWei),
            application.level,
            EthData.etherToWei(application.customArea || 0),
            application.credentialsHash,
            EthData.toBytes(application.ledgerIdentifier),
            description,
            application.feeCurrency == 'galt' ? EthData.etherToWei(application.fee) : "0"
        )
    }

    async resubmitApplication(sendOptions, application) {
        let valueToSend = 0;
        if(application.feeCurrency == 'eth') {
            valueToSend = EthData.etherToWei(application.fee);
        }
        
        let description = GaltData.getAdditionalDescriptionForSend(application);
        
        return this.sendMethod(
            _.extend(sendOptions, {value: valueToSend}),
            "resubmitApplication",
            application.id || application.applicationId,
            application.credentialsHash,
            EthData.toBytes(application.ledgerIdentifier),
            description,
            GaltData.geohashArrayToUint(application.contour),
            application.heights.map(EthData.etherToWei),
            application.level,
            EthData.etherToWei(application.customArea || 0),
            application.feeCurrency == 'galt' ? EthData.etherToWei(application.fee) : "0"
        )
    }

    async getNeedWeiForSubmit(applicationId) {
        return this.massCallMethod('getEstimatedGasDeposit', [applicationId]);
    }

    async getNeedEthForSubmit(applicationId) {
        return GaltData.weiToEtherRound(await this.getNeedWeiForSubmit(applicationId));
    }

    async approveApplicationForOperator(sendOptions, approveToWallet, approveApplicationId){
        return this.sendMethod(sendOptions, 'approveOperator', approveApplicationId, approveToWallet);
        // return this.sendMethod(sendOptions, 'approve', approveToWallet, approveApplicationId);
    }

    async isApprovedApplicationForOperator(approveToWallet, approveApplicationId){
        return (await this.massCallMethod('getApplicationOperator', [approveApplicationId])) == approveToWallet;
        // return (await this.massCallMethod('getApproved', [approveApplicationId])) == approveToWallet;
    }
    
    async setApplicationFee(sendOptions, currency, amount) {
        let galtFeeRate;
        if(currency.toLowerCase() == 'galt') {
            galtFeeRate = amount;
        } else {
            galtFeeRate = await this.massCallMethod('submissionFeeRateGalt');
        }

        let ethFeeRate;
        if(currency.toLowerCase() == 'eth') {
            ethFeeRate = amount;
        } else {
            ethFeeRate = await this.massCallMethod('submissionFeeRateEth');
        }
        
        return this.sendMethod(sendOptions, "setSubmissionFeeRate", ethFeeRate, galtFeeRate);
    }
}
