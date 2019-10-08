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

import * as pIteration from "p-iteration";
import GaltData from "../services/galtData";

const EthContract = require('../libs/EthContract');
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default class AbstractApplicationContract extends EthContract {
    applicationStatuses = [
        {id: 0, name: 'not_exist'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'}
    ];

    getApplicationStatusById(statusId) {
        return _.find(this.applicationStatuses, (status) => status.id == statusId);
    }

    getApplicationStatusIdByName(statusName) {
        return _.find(this.applicationStatuses, (status) => status.name == statusName).id;
    }

    getValidationStatusById(statusId) {
        return _.find(this.validationStatuses, (status) => status.id == statusId);
    }

    getValidationStatusIdByName(statusName) {
        return _.find(this.validationStatuses, (status) => status.name == statusName).id;
    }

    getApplicationStatusName(application) {
        const status = this.getApplicationStatusById(application.status) || {};
        return status.name || 'not_found';
    }

    getValidationStatusName(validation) {
        const status = this.getValidationStatusById(validation.status) || {};
        return status.name || 'not_found';
    }
    
    async userApplicationsIds(userWallet) {
        //TODO: remove uniq
        return _.uniq(await this.massCallMethod('getApplicationsByApplicant', [userWallet]));
    }

    async getAllApplications(options){
        return this.massCallMethod("getAllApplications")
            .then((applications_ids) => {
                return this.getApplicationsByIds(applications_ids, options);
            });
    }

    async getApplicationsByIds(userApplicationsIds, params: any = {}){
        const applications = await pIteration.map(userApplicationsIds, async (applicationId) => {
            // try {
                return await this.getApplicationById(applicationId, params);
            // } catch (e) {
                // console.error(e);
            //     return {
            //         error: e
            //     };
            // }
        });
        return _.reverse(applications);
    }
    
    async getApplicationById(applicationId, params: any = {}, callbackOnRole?) {
        const application = await this.massCallMethod(params.method || "getApplicationById", [applicationId]);
        application.id = applicationId;

        application.statusName = this.getApplicationStatusName(application);
        
        application.generalStatus = application.status;
        application.generalStatusName = application.statusName;
        
        application.feeCurrency = application.currency;
        application.feeCurrencyName = (GaltData.getApplicationCurrencyById(application.feeCurrency) || {}).name;

        const applicationRolesHex = application.assignedOracleTypes;
        if(applicationRolesHex) {
            application.assignedOracleTypes = applicationRolesHex.map(EthData.hexToString);
        }

        if(params.validationForAddress && applicationRolesHex) {// && _.includes(['submitted', 'rejected', 'reverted'], application.statusName)
            application.validationList = [];
            application.validatorsList = [];
            application.validationObj = {};
            application.waitForLockByAllRoles = false;

            await pIteration.forEach(applicationRolesHex, async (roleHex, index) => {
                const roleValidation = await this.massCallMethod("getApplicationOracle", [applicationId, roleHex]);

                roleValidation.statusName = this.getValidationStatusName(roleValidation);

                if(roleValidation.statusName == 'pending') {
                    application.waitForLockByAllRoles = true;
                }

                roleValidation.roleName = application.assignedOracleTypes[index];
                roleValidation.role = roleHex;
                
                if(roleValidation.oracle == '0x0000000000000000000000000000000000000000') {
                    roleValidation.oracle = null;
                }

                if(roleValidation.oracle && roleValidation.oracle == params.validationForAddress) {
                    application.userValidationRole = roleValidation.roleName;
                    application.rewardPaidOut = roleValidation.rewardPaidOut;
                    application.reward = roleValidation.reward;
                }
                
                if(callbackOnRole)
                    callbackOnRole(roleValidation, application);

                // TODO: get paidOut from plotManagerContract
                // application.paidOut = false;
                // if(_.includes(['approved', 'disassembled_by_oracle'], roleValidation.statusName)) {
                //     application.paidOut = await this.massCallMethod("applications", ["roleRewardPaidOut", applicationId, roleHex]);
                // }


                application.validationList[index] = roleValidation;
                application.validationObj[roleValidation.roleName] = roleValidation;
                if(roleValidation.oracle) {
                    application.validatorsList.push(roleValidation.oracle);
                }
            });
        }

        return application;
    }

    async submitApplication(sendOptions, application) {
        return await this.sendMethod(
            sendOptions,
            "submitApplication",
            application.id
        )
    }
    async hasRole(userWallet, role) {
        // return this.massCallMethod('feeManagers', [userWallet]);
        return this.massCallMethod('hasRole', [userWallet, role]);
    }
    async validateApplication(sendOptions, methodName, application, additionalParam?) {
        return this.sendMethod(
            sendOptions,
            methodName,
            application.id,
            additionalParam
        );
    }

    async claimOracleReward(sendOptions, applicationId) {
        return this.sendMethod(
            sendOptions,
            "claimOracleReward",
            applicationId
        );
    }

    async setApplicationFee(sendOptions, currency, amount) {
        return await this.sendMethod(sendOptions, "setMinimalApplicationFeeIn" + EthData.upperFirst(currency.toLowerCase()), EthData.etherToWei(amount));
    }
    async setGaltSpaceShare(sendOptions, currency, amount) {
        return await this.sendMethod(sendOptions, "setGaltSpace" + EthData.upperFirst(currency.toLowerCase()) + "Share", amount);
    }
    async setPaymentMethod(sendOptions, paymentMethod) {
        return await this.sendMethod(sendOptions, "setPaymentMethod", GaltData.getPaymentMethodIdByName(paymentMethod));
    }
    async setGasPriceForDeposits(sendOptions, gasPriceInGwei) {
        return await this.sendMethod(sendOptions, "setGasPriceForDeposits", EthData.gweiToWei(gasPriceInGwei));
    }
    async getOracleApplicationsIds(oracleAddress){
        return _.reverse(await this.massCallMethod("getApplicationsByOracle", [oracleAddress]));
    }

    // async getApplicationGeohashes(application) {
    //     application = await this.getApplicationById(application.id);
    //     return await GaltData.getPackageGeohashes(application.spaceTokenId);
    // }
    //
    // async getApplicationGeohashesCount(application) {
    //     application = await this.getApplicationById(application.id);
    //     return await GaltData.getPackageGeohashesCount(application.spaceTokenId);
    // }

    async getApplicationContour(application) {
        return await GaltData.getPackageContour(application.spaceTokenId);
    }
}
