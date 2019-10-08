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

export default class ClaimManagerContract extends AbstractApplicationContract {

    applicationStatuses = [
        {id: -1, name: 'all'},
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'submitted'},
        {id: 2, name: 'approved'},
        {id: 3, name: 'rejected'},
        {id: 4, name: 'reverted'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'pending'},
        {id: 2, name: 'locked'},
        {id: 2.5, name: 'approved'}
    ];

    actionTypes = [
        {id: 0, name: 'approve'},
        {id: 1, name: 'reject'}
    ];
    
    getActionTypeById(actionId) {
        return _.find(this.actionTypes, (action) => action.id == actionId);
    }

    getActionTypeIdByName(actionName) {
        return _.find(this.actionTypes, (action) => action.name == actionName).id;
    }

    async userApplicationsIds(userWallet) {
        //TODO: remove uniq
        return _.uniq(await this.massCallMethod('getApplicationsByApplicant', [userWallet]));
    }
    
    async getAllApplications(options){
        return this.massCallMethod("getAllApplications")
            .then(async (applications_ids) => {
                return await this.getApplicationsByIds(applications_ids, options);
            });
    }
    
    async getApplicationById(applicationId, params: any = {}) {
        params.method = 'claim';
        const application: any = await super.getApplicationById(applicationId, params, (roleValidation, application) => {
            
        });
        
        application.contractType = 'claimManager';
        
        application.amount = GaltData.weiToEtherRound(application.amount);
        application.takenByUser = _.includes(application.oracles, params.validationForAddress);
        // application.takenByUser = localStorage.getItem('ClaimManagerContract.takenByUser.' + params.validationForAddress) == '1';

        application.resolved = false;
        
        let proposalsIdsList;
        if(application.slotsTaken > 0) {
            proposalsIdsList = await this.massCallMethod('getProposals', [application.id])
        } else {
            proposalsIdsList = [];
        }

        application.showProposals = 3;
        application.proposals = [];
        
        const promises = proposalsIdsList.map(async (proposalId) => {
            const proposal = await this.massCallMethod('getProposal', [application.id, proposalId]);

            if(proposal.amount) {
                proposal.amount = EthData.weiToEther(proposal.amount);
            }
            proposal.message = EthData.hexToString(proposal.message);
            proposal.action = (this.getActionTypeById(proposal.action) || {}).name;
            proposal.roles = proposal.roles.map(EthData.hexToString);
            proposal.fines = proposal.fines.map(EthData.weiToEtherRound);
            
            // if(params.validationForAddress && proposal.from == params.validationForAddress) {
            //     application.takenByUser = true;
            //     localStorage.setItem('ClaimManagerContract.takenByUser.' + params.validationForAddress, '1');
            // }
            
            application.proposals.push(proposal);
        });
        
        application.resolvePromise = Promise.all(promises).then(() => {
            application.proposals = _.orderBy(application.proposals, (proposal) => {
                return proposal.votesFor.length;
            }, ['desc']);
            
            application.resolved = true;
        });
        
        return application;
    }

    async submitApplication(sendOptions, options){
        return await this.sendMethod(
            _.extend(sendOptions, {ether: options.feeCurrency == 'eth' ? options.fee : 0}),
            "submit",
            options.multisigAddress,
            options.beneficiary,
            EthData.etherToWei(options.amount),
            options.documents.map(EthData.stringToHex),
            options.feeCurrency == 'galt' ? EthData.etherToWei(options.fee) : "0"
        )
    }
    
    async createProposal(sendOptions, options) {
        if(options.action == 'approve') {
            return await this.sendMethod(
                sendOptions,
                "proposeApproval",
                options.applicationId,
                EthData.stringToHex(options.message),
                EthData.etherToWei(options.amount),
                options.blameList.map((blameItem) => blameItem.address),
                options.blameList.map((blameItem) => EthData.stringToHex(blameItem.role)),
                options.blameList.map((blameItem) => EthData.etherToWei(blameItem.penalty))
            )
        } else if(options.action == 'reject') {
            return await this.sendMethod(
                sendOptions,
                "proposeReject",
                options.applicationId,
                options.message
            )
        }
    }

    async vote(sendOptions, application, proposal){
        return await this.sendMethod(
            sendOptions,
            "vote",
            application.id,
            proposal.id
        )
    }

    async getApplicatioMessagesCount(applicationId) {
        const application = await this.massCallMethod('claim', [applicationId]);
        return application.messageCount;
    }

    async getApplicationWithMessages(applicationId) {
        const application = await this.massCallMethod('claim', [applicationId]);
        application.resolved = false;
        
        application.messages = [];
        const promises = [];
        
        for(let i = 0; i < application.messageCount; i++) {
            const promise = this.getMessage(applicationId, i);
            
            promises.push(promise.then((message) => {
                application.messages.push(message);
            }));
        }
        
        application.resolvePromise = Promise.all(promises).then(() => {
            application.messages = _.orderBy(application.messages, (message) => {
                return message.index;
            }, ['asc']);

            application.resolved = true;
        });
        return application;
    }
    
    async getMessage(applicationId, messageId) {
        const message = await this.massCallMethod('getMessage', [applicationId, messageId]);

        message.index = messageId;
        
        return message;
    }

    async sendMessage(sendOptions, applicationId, text){
        return await this.sendMethod(
            sendOptions,
            "pushMessage",
            applicationId,
            text
        )
    }
}
