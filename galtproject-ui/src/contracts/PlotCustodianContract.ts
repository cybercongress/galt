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
import AbstractApplicationContract from "./AbstractApplicationContract";
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default class PlotCustodianContract extends AbstractApplicationContract {

    applicationStatuses = [
        {id: -1, name: 'all'},
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'submitted'},
        {id: 2, name: 'approved'},
        {id: 3, name: 'rejected'},
        {id: 4, name: 'reverted'},
        {id: 5, name: 'accepted'},
        {id: 6, name: 'locked'},
        {id: 7, name: 'review'},
        {id: 8, name: 'completed'},
        {id: 9, name: 'closed'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'pending'},
        {id: 2, name: 'locked'},
        {id: 2.5, name: 'approved'}
    ];

    actionTypes = [
        {id: 0, name: 'attach'},
        {id: 1, name: 'detach'}
    ];

    approveConfirmationsToRoles = {
        0: [],
        1: ['PC_CUSTODIAN_ORACLE_TYPE'],
        2: ['PC_AUDITOR_ORACLE_TYPE'],
        4: ['PC_APPLICANT_ROLE'],
        6: ['PC_APPLICANT_ORACLE_TYPE', 'PC_AUDITOR_ORACLE_TYPE'],
        3: ['PC_CUSTODIAN_ORACLE_TYPE', 'PC_AUDITOR_ORACLE_TYPE'],
        5: ['PC_CUSTODIAN_ORACLE_TYPE', 'PC_APPLICANT_ROLE'],
        7: ['PC_CUSTODIAN_ORACLE_TYPE', 'PC_AUDITOR_ORACLE_TYPE', 'PC_APPLICANT_ROLE']
    };
    
    getActionTypeById(actionId) {
        return _.find(this.actionTypes, (action) => action.id == actionId);
    }

    getActionTypeIdByName(actionName) {
        return _.find(this.actionTypes, (action) => action.name == actionName).id;
    }
    
    async getApplicationById(applicationId, params: any = {}) {
        params = _.clone(params);
        
        let validationForAddress = params.validationForAddress;
        
        delete params.validationForAddress;
        
        const application: any = await super.getApplicationById(applicationId, params);
        
        application.contractType = 'plotCustodian';
        
        application.actionName = (this.getActionTypeById(application.action) || {}).name;
        
        application.custodians = application.custodiansToModify;

        application.assignedOracleTypes = ['PC_APPLICANT_ROLE', 'PC_AUDITOR_ORACLE_TYPE'];
        for(let i = 0; i < application.custodiansToModify.length; i++) {
            application.assignedOracleTypes.push('PC_CUSTODIAN_ORACLE_TYPE');
            if(validationForAddress && application.custodiansToModify[i].toLowerCase() === validationForAddress.toLowerCase()) {
                application.userChoosenCustodian = true;
            }
        }

        application.spaceTokenId = application.spaceTokenId.toString(10);
        
        const currentCustodians = await GaltData.spaceTokenCustodians(application.spaceTokenId);
        for(let i = 0; i < currentCustodians.length; i++) {
            application.assignedOracleTypes.push('PC_CUSTODIAN_ORACLE_TYPE');
            if(validationForAddress && currentCustodians[i].toLowerCase() === validationForAddress.toLowerCase()) {
                application.userCurrentCustodian = true;
            }
        }

        if(validationForAddress) {
            application.validationList = [];
            application.validatorsList = [];
            application.validationObj = {};
            application.waitForLockByAllRoles = false;
            
            const votingInfo = await this.massCallMethod("getApplicationVoting", [applicationId]);
            const rewardsInfo = await this.massCallMethod("getApplicationRewards", [applicationId]);
            
            let voters = votingInfo.voters;
            
            if(!voters.length) {
                voters = _.clone(application.custodiansToModify);
                voters.push(application.applicant);
            }
            
            if(application.auditor === GaltData.nullAddress) {
                voters.splice(voters.length - 1, 0, application.auditor);
            }
            
            await pIteration.forEach(voters, async (voter: string, index) => {
                const roleValidation = await this.massCallMethod("getApplicationCustodian", [applicationId, voter]);
                roleValidation.oracle = voter;

                const accepted = _.find(application.acceptedCustodians, (custodian) => custodian.toLowerCase() === voter.toLowerCase());
                const locked = _.find(application.lockedCustodians, (custodian) => custodian.toLowerCase() === voter.toLowerCase());
                if(roleValidation.approved) {
                    roleValidation.statusName = 'approved';
                } else if(accepted || locked) {
                    roleValidation.statusName = 'locked';
                } else {
                    roleValidation.statusName = 'pending';
                }

                // if(roleValidation.statusName == 'pending') {
                //     application.waitForLockByAllRoles = true;
                // }

                if(application.applicant.toLowerCase() === voter.toLowerCase()) {
                    roleValidation.roleName = 'PC_APPLICANT_ROLE';
                    application.approvedByApplicant = roleValidation.statusName === 'approved';
                } else if(application.auditor.toLowerCase() === voter.toLowerCase()) {
                    roleValidation.roleName = 'PC_AUDITOR_ORACLE_TYPE';
                } else {
                    roleValidation.roleName = 'PC_CUSTODIAN_ORACLE_TYPE';
                }

                roleValidation.role = EthData.stringToHex(roleValidation.roleName);

                if(roleValidation.oracle == '0x0000000000000000000000000000000000000000') {
                    roleValidation.oracle = null;
                }

                if(roleValidation.oracle && roleValidation.oracle == validationForAddress) {
                    application.userStatus = roleValidation.statusName;
                    
                    application.userValidationRole = roleValidation.roleName;
                    application.rewardPaidOut = roleValidation.rewardPaidOut;
                    
                    if(application.applicant.toLowerCase() === voter.toLowerCase()) {
                        application.reward = 0;
                    } else if(application.auditor.toLowerCase() === voter.toLowerCase()) {
                        application.reward = GaltData.weiToEtherRound(rewardsInfo.auditorReward);
                    } else {
                        application.reward = GaltData.weiToEtherRound(rewardsInfo.custodianReward);
                    }
                    
                    if(roleValidation.approved) {
                        application.approvedByUser = true;
                    }
                }

                application.validationList.push(roleValidation);
                if(roleValidation.oracle) {
                    application.validatorsList.push(roleValidation.oracle);
                }
                
                if(application.statusName == 'review' || application.statusName == 'rejected') {
                    return;
                }
                // if(roleValidation.oracle && roleValidation.oracle == validationForAddress) {
                //     if(_.includes(['locked', 'approved', 'rejected', 'reverted'], roleValidation.statusName)) {
                //         // set personal status for oracle
                //         application.status = this.getApplicationStatusIdByName(roleValidation.statusName);
                //         application.statusName = this.getApplicationStatusName(application);
                //     }
                // }
            });
            
            if(!application.userStatus) {
                application.userStatus = 'pending';
            }
        } else {
            const applicantValidation = await this.massCallMethod("getApplicationCustodian", [applicationId, application.applicant]);
            application.approvedByApplicant = applicantValidation.approved;
        }
        
        if(application.auditor === GaltData.nullAddress) {
            application.auditor = null;
        }

        application.readyForAttachToken = application.statusName === 'locked';
        
        // if(_.includes(['submitted', 'locked'], application.statusName)) {
        //     application.readyForAttachToken = false;
        //    
        //     const custodianValidation = await this.massCallMethod("getApplicationOracle", [applicationId, GaltData.stringToHex('PC_CUSTODIAN_ORACLE_TYPE')]);
        //     custodianValidation.statusName = this.getValidationStatusName(custodianValidation);
        //     if(custodianValidation.statusName == 'locked') {
        //         application.readyForAttachToken = true;
        //     }
        // }

        application.tokenAttached = this.address.toLowerCase() === (await GaltData.ownerOfTokenId(application.spaceTokenId)).toLowerCase();
        console.log('tokenAttached', this.address.toLowerCase(), (await GaltData.ownerOfTokenId(application.spaceTokenId)).toLowerCase());
        
        application.approvedBy = this.approveConfirmationsToRoles[application.approveConfirmations];

        // if(params.withFinance) {
        //     const applicationFinance = await this.massCallMethod("getApplicationFinanceById", [applicationId]);
        //     _.extend(application, applicationFinance);
        //
        //     application.price = await GaltData.spaceTokenPrice(application.spaceTokenId);
        // }
        
        application.spaceToken = null;

        application.resolved = false;
        const promises = [];

        const spaceTokenPromise = GaltData.getSpaceTokenObjectById(application.spaceTokenId).then((spaceToken) => {
            application.spaceToken = spaceToken;
        }).catch(() => { });

        try {
            await spaceTokenPromise;
        } catch (e) {

        }

        application.resolvePromise = Promise.all(promises).then(() => {
            application.resolved = true;
        });
        
        return application;
    }

    async submitApplication(sendOptions, application){
        return await this.sendMethod(
            _.extend(sendOptions, {ether: application.feeCurrency == 'eth' ? application.fee : 0}),
            "submit",
            application.multiSig,
            application.tokenId,
            this.getActionTypeIdByName(application.action),
            application.custodians,
            application.feeCurrency == 'galt' ? EthData.etherToWei(application.fee) : "0"
        )
    }
    
    async attachDocuments(sendOptions, applicationId, documents) {
        return await this.sendMethod(
            sendOptions,
            "attachDocuments",
            applicationId,
            documents.map(EthData.stringToHex)
        )
    }

    async attachToken(sendOptions, applicationId) {
        return await this.sendMethod(
            sendOptions,
            "attachToken",
            applicationId
        )
    }
    
    async spaceTokenCustodian(spaceTokenId) {
        return await this.massCallMethod("assignedCustodians", [spaceTokenId]);
    }
}
