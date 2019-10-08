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

import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";
const EthContract = require('../libs/EthContract');

export default class ProposalManagerContract extends EthContract {

    contractType;
    contractTypeStr;
    description;
    
    proposalStatuses = {
        "0": "null",
        "1": "active",
        "2": "approved",
        "3": "rejected",
    };
    
    proposalChoices = {
        "0": "pending",
        "1": "accepted",
        "2": "declined"
    };
    
    solTypeToJs = {
        "uint256": "number",
        "string": "string"
    };
    
    async getActiveProposals() {
        const ids = (await this.massCallMethod('getActiveProposals', [])).map(proposalId => proposalId.toString(10));
        return pIteration.map(ids, (id) => this.getProposalObjById(id));
    }
    async getActiveProposalsCount() {
        return parseInt((await this.massCallMethod('getActiveProposalsCount', [])).toString(10));
    }
    async getActiveProposalsBySender(sender) {
        const ids = (await this.massCallMethod('getActiveProposalsBySender', [sender])).map(proposalId => proposalId.toString(10));
        return pIteration.map(ids, (id) => this.getProposalObjById(id));
    }
    async getActiveProposalsBySenderCount(sender) {
        return parseInt((await this.massCallMethod('getActiveProposalsBySenderCount', [sender])).toString(10));
    }
    async proposeByObj(sendOptions, proposalObj) {
        const proposalArgs = this.getProposalInputFields().map((field) => {
            let argValue = proposalObj[field.name];
            if(field.type === 'bytes32' && !GaltData.isHex(argValue)) {
                //TODO: make more flexible
                if(GaltData.isNumber(argValue)) {
                    argValue = EthData.numberToHex(argValue);
                } else {
                    argValue = EthData.stringToHex(argValue);
                }
            }
            return argValue;
        });
        const response = await this.propose(sendOptions, proposalArgs);
        return (this.parseEvent('NewProposal', response.receipt)).proposalId;
    }
    async propose(sendOptions, proposalArgs) {
        return this.sendMethod.apply(this, [sendOptions, 'propose'].concat(proposalArgs));
    }
    
    async acceptProposal(sendOptions, proposalId) {
        return this.sendMethod(sendOptions, 'aye', proposalId);
    }
    async declineProposal(sendOptions, proposalId) {
        return this.sendMethod(sendOptions, 'nay', proposalId);
    }
    
    async triggerApproveProposal(sendOptions, proposalId) {
        return this.sendMethod(sendOptions, 'triggerApprove', proposalId);
    }
    async triggerRejectProposal(sendOptions, proposalId) {
        return this.sendMethod(sendOptions, 'triggerReject', proposalId);
    }
    
    async getThreshold() {
        // return GaltData.weiToEtherRound(await this.massCallMethod('getThreshold', []));
        return parseInt((await this.massCallMethod('getThreshold', [])).toString(10));
    }

    async getAcceptShare(proposalId) {
        // return GaltData.weiToEtherRound(await this.massCallMethod('getAyeShare', [proposalId]).catch(() => '0'));
        return parseInt((await this.massCallMethod('getAyeShare', [proposalId]).catch(() => '0')).toString(10));
    }

    async getDeclineShare(proposalId) {
        // return GaltData.weiToEtherRound(await this.massCallMethod('getNayShare', [proposalId]).catch(() => '0'));
        return parseInt((await this.massCallMethod('getNayShare', [proposalId]).catch(() => '0')).toString(10));
    }

    async getProposalVoting(proposalId) {
        const proposalVoting = await this.massCallMethod('getProposalVoting', [proposalId]);
        proposalVoting.status = this.proposalStatuses[proposalVoting.status];
        proposalVoting.accepted = proposalVoting.ayes;
        proposalVoting.declined = proposalVoting.nays;
        return proposalVoting;
    }
    
    async getProposalStatus(proposalId) {
        const proposalStatus = await this.massCallMethod('getProposalStatus', [proposalId]);
        proposalStatus.status = this.proposalStatuses[proposalStatus.status];
        proposalStatus.acceptedCount = proposalStatus.ayesCount;
        proposalStatus.declinedCount = proposalStatus.naysCount;
        return proposalStatus;
    }

    async getProposalObjById(proposalId) {
        const proposal = await this.massCallMethod('getProposal', [proposalId]);
        
        // trim fields
        _.forEach(proposal, (value, field) => {
            delete proposal[field];
            proposal[_.trim(field)] = value;
        });
        
        proposal.id = proposalId;
        
        const statusObj = await this.getProposalStatus(proposalId);
        proposal.status = statusObj.status;
        
        return proposal;
    }

    async getProposalShares(proposalId) {
        const threshold = await this.getThreshold();
        const acceptShare = await this.getAcceptShare(proposalId);
        const declineShare = await this.getDeclineShare(proposalId);
        
        return {
            threshold,
            acceptShare,
            declineShare
        }
    }
    async getProposalsChoice(proposalId, participant) {
        return this.proposalChoices[(await this.massCallMethod('getParticipantProposalChoice', [proposalId, participant]).catch(() => '0'))];
    }
    
    getProposalInputFields() {
        const proposeMethodAbi = this.getMethodAbi('propose');
        return proposeMethodAbi.inputs.map((field) => {
            return {
                name: _.trim(field.name, '-_'),
                type: this.solTypeToJs[field.type] || field.type
            };
        })
    }

    getProposalOutputFields() {
        const proposeMethodAbi = this.getMethodAbi('getProposal');
        return proposeMethodAbi.outputs.map((field) => {
            return {
                name: _.trim(field.name, '-_'),
                type: this.solTypeToJs[field.type] || field.type
            };
        })
    }

    async getApprovedProposalsIds() {
        return (await this.massCallMethod('getApprovedProposals', [])).map(proposalId => proposalId.toString(10));
    }
    async getApprovedProposals() {
        const ids = await this.getApprovedProposalsIds();
        return pIteration.map(ids, (id) => this.getProposalObjById(id));
    }

    async getApprovedProposalsCount() {
        return (await this.massCallMethod('getApprovedProposalsCount', [])).toString(10);
    }

    async getRejectedProposalsIds() {
        return (await this.massCallMethod('getRejectedProposals', [])).map(proposalId => proposalId.toString(10));
    }
    async getRejectedProposals() {
        const ids = await this.getRejectedProposalsIds();
        return pIteration.map(ids, (id) => this.getProposalObjById(id));
    }

    async getRejectedProposalsCount() {
        return (await this.massCallMethod('getRejectedProposalsCount', [])).toString(10);
    }
}
