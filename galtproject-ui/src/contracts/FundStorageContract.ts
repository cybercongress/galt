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
import ProposalManagerContract from "./ProposalManagerContract";

import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";
const EthContract = require('../libs/EthContract');
import galtMultisigContracts from "@galtproject/frontend-core/components/GaltMultisig/contracts/index";
import TokenContract from "@galtproject/frontend-core/components/GaltMultisig/contracts/TokenContract";
const galtMultisigConfig = require("@galtproject/frontend-core/components/GaltMultisig/config");

export default class FundStorageContract extends EthContract {
    name;
    description;
    activeFundRulesCount;
    isPrivate;
    
    typeToAbiName = {
        'modify_config': 'modifyConfigProposalManager',
        'new_member': 'newMemberProposalManager',
        'fine_member': 'fineMemberProposalManager',
        'white_list': 'wLProposalManager',
        'expel_member': 'expelMemberProposalManager',
        'change_info': 'changeNameAndDescriptionProposalManager',
        'add_rule': 'addFundRuleProposalManager',
        'deactivate_rule': 'deactivateFundRuleProposalManager',
        'change_ms_owners': 'changeMultiSigOwnersProposalManager',
        'modify_fee': 'modifyFeeProposalManager',
        'modify_ms_manager_details': 'modifyMultiSigManagerDetailsProposalManager',
        'change_ms_withdrawal_limits': 'changeMultiSigWithdrawalLimitsProposalManager',
        'member_identification': 'memberIdentificationProposalManager'
    };
    
    async getName() {
        return this.massCallMethod('name', []);
    }
    async getDescription() {
        return this.massCallMethod('description', []);
    }
    async getMultiSigAddress() {
        return this.massCallMethod('getMultiSig', []);
    }
    async getPeriodLength() {
        return (await this.massCallMethod('periodLength', [])).toString(10);
    }
    async getMultiSigContract() {
        const multisigAddress = await this.getMultiSigAddress();
        const {abi} = _.find(galtMultisigConfig.initTemplates, {name: 'gnosis-multisig'});
        return EthData.initContract(galtMultisigContracts.GnosisMultisigContract, multisigAddress, abi);
    }
    async getWhiteListedContractsAddresses() {
        return this.massCallMethod('getWhiteListedContracts', []);
    }
    async getWhiteListedContracts() {
        const addresses = await this.getWhiteListedContractsAddresses();
        return pIteration.map(addresses, (address) => {
            return this.getWhiteListedContractInfo(address);
        });
    }
    async getWhiteListedContractInfo(address) {
        const info = await this.massCallMethod('getProposalContract', [address]);
        info.contractType = EthData.hexToString(info.contractType);
        info.contractTypeStr = EthData.upperFirst(info.contractType).replace(/_/g, " ");
        info.address = address;
        return info;
    }

    async getActivePeriodLimitsAddresses() {
        return this.massCallMethod('getActivePeriodLimits', []);
    }
    async getActivePeriodLimits() {
        const addresses = await this.getActivePeriodLimitsAddresses();
        return pIteration.map(addresses, (address) => {
            return this.getPeriodLimit(address);
        });
    }
    async getPeriodLimit(address) {
        const info = await this.massCallMethod('getPeriodLimit', [address]);
        info.address = address;
        // info.amount = info.amount.toString(10);
        
        if(address === EthData.oneAddress) {
            info.currency = 'eth';
            info.currencyStr = 'ETH';
            info.amount = EthData.weiToEther(info.amount);
        } else {
            info.currency = 'erc20';
            info.currencyContract = await EthData.initContract(TokenContract, address, GaltData.erc20Abi);
            info.currencyStr = await info.currencyContract.getSymbol();
            info.decimals = await info.currencyContract.getDecimals();
            info.amount = EthData.weiToDecimals(info.amount, EthData.isNumber(info.decimals) ? info.decimals : 18);
        }
        
        return info;
    }
    
    async getActiveFundRules() {
        const ids = await this.getActiveFundRulesIds();
        return pIteration.map(ids, (id) => this.getFundRule(id));
    }
    async getActiveFundRulesIds() {
        return this.massCallMethod('getActiveFundRules', []);
    }
    async getFeeContractsList() {
        const addresses = await this.massCallMethod('getFeeContracts', []);
        return pIteration.map(addresses, GaltData.getFundFeeContract.bind(GaltData))
    }
    async getFeeProposalsList() {
        await this.onReady();
        const modifyFeeProposalContract = await this.getModifyFeeProposalContract();
        const activeProposals = await modifyFeeProposalContract.getActiveProposals();

        activeProposals.forEach((proposal) => {
            const parsedData = EthData.parseData(proposal.data, GaltData.contractsConfig['fundStorageAbi'], 0);
            proposal.address = parsedData.inputs['feeContract'];
        });
        
        return pIteration.map(activeProposals, async (proposal) => {
            const feeContract = await GaltData.getFundFeeContract(proposal.address);
            feeContract.proposalId = proposal.id;
            feeContract.proposalDescription = proposal.description;
            return feeContract;
        })
    }
    async getModifyFeeProposalContract() {
        const modifyFeeProposalAddress = await this.getFirstContractAddressByType('modify_fee');
        return this.getProposalManagerContract(modifyFeeProposalAddress);
    }
    async getActiveFundRulesCount() {
        return (await this.massCallMethod('getActiveFundRulesCount', [])).toString(10);
    }
    async getFundRule(frpId) {
        frpId = frpId.toString(10);
        const fundRule = await this.massCallMethod('getFundRule', [frpId]);
        fundRule.id = frpId;
        return fundRule;
    }
    async getConfigKeys() {
        return this.massCallMethod('getConfigKeys', []);
    }
    async getConfigValue(configKey) {
        return this.massCallMethod('getConfigValue', [configKey]);
    }
    async isMintApproved(spaceTokenId) {
        return this.massCallMethod('isMintApproved', [spaceTokenId]);
    }
    async isSpaceTokenLocked(spaceTokenId) {
        return this.massCallMethod('isSpaceTokenLocked', [spaceTokenId]);
    }
    async getActiveMultisigManagers() {
        return pIteration.map(await this.massCallMethod('getActiveMultisigManagers', []), (address) => this.getMultisigManager(address));
    }
    async getMultisigManager(address) {
        address = address.toLowerCase();
        const manager = await this.massCallMethod('getMultisigManager', [address]);
        manager.address = address;
        manager.documents = manager.documents.map(EthData.hexToString);
        return manager;
    }
    async getMemberIdentification(owner) {
        return _.trimEnd((await this.massCallMethod('getMemberIdentification', [owner])), '0');
    }
    async getIsPrivate() {
        return (await this.massCallMethod('getConfigValue', [EthData.stringToHex('is_private')])) !== GaltData.nullBytes32;
    }
    async fetchGeneralInfo() {
        this.name = await this.getName();
        this.description = await this.getDescription();
        this.activeFundRulesCount = await this.getActiveFundRulesCount();
        this.isPrivate = await this.getIsPrivate();
    }
    async getContractsAddressesByType(contractType) {
        const allContracts = await this.getWhiteListedContracts();
        
        return (await pIteration.filter(allContracts, async (contractInfo) => {
            return contractInfo.contractType === contractType;
        })).map(contractInfo => contractInfo.address);
    }
    async getFirstContractAddressByType(type) {
        return (await this.getContractsAddressesByType(type))[0];
    }
    async getNewMemberProposalContract() {
        const newMemberProposalAddress = await this.getFirstContractAddressByType('new_member');
        return this.getProposalManagerContract(newMemberProposalAddress);
    }
    async getProposalManagerContract(address) {
        const contract = new ProposalManagerContract();
        const whitelistContract = await this.getWhiteListedContractInfo(address);
        await this.initAnotherContract(contract, address, this.typeToAbiName[whitelistContract.contractType]);

        contract.contractType = whitelistContract.contractType;
        contract.contractTypeStr = whitelistContract.contractTypeStr;
        contract.description = whitelistContract.description;
        
        return contract;
    }
    async newProposal(sendOptions, contractAddress, proposalArgs) {
        const newMemberProposalContract = await this.getProposalManagerContract(contractAddress);
        return newMemberProposalContract.propose(sendOptions, proposalArgs);
    }
}
