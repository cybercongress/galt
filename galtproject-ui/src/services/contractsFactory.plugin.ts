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

import PlotManagerContract from "../contracts/PlotManagerContract";
import PlotValuationContract from "../contracts/PlotValuationContract";
import GaltTokenContract from "../contracts/GaltTokenContract";
import SpaceTokenContract from "../contracts/SpaceTokenContract";
import SplitMergeContract from "../contracts/SplitMergeContract";
import OraclesContract from "../contracts/OraclesContract";
import GaltDexContract from "../contracts/GaltDexContract";
import PlotCustodianContract from "../contracts/PlotCustodianContract";
import PlotEscrowContract from "../contracts/PlotEscrowContract";
import GaltData from "./galtData";
import ClaimManagerContract from "../contracts/ClaimManagerContract";
import PlotClarificationContract from "../contracts/PlotClarificationContract";
import SpaceReputationAccountingContract from "../contracts/SpaceReputationAccountingContract";
import MultiSigRegistryContract from "../contracts/MultiSigRegistryContract";
import SpaceCustodianRegistryContract from "../contracts/SpaceCustodianRegistryContract";
import SpaceLockerRegistryContract from "../contracts/SpaceLockerRegistryContract";
import SpaceLockerFactoryContract from "../contracts/SpaceLockerFactoryContract";
import Geodesic from "../contracts/GeodesicContract";
import FundsRegistryContract from "../contracts/FundsRegistryContract";
import FundFactoryContract from "../contracts/FundFactoryContract";

import * as _ from 'lodash';
import FeeRegistryContract from "../contracts/FeeRegistryContract";
import FundFeeFactoryContract from "../contracts/FundFeeFactoryContract";

export default {
    install(Vue, options: any = {}) {
        const contracts = {
            'plotManager': PlotManagerContract,
            'plotClarification': PlotClarificationContract,
            'plotValuation': PlotValuationContract,
            'plotCustodian': PlotCustodianContract,
            'spaceCustodianRegistry': SpaceCustodianRegistryContract,
            'galtToken': GaltTokenContract,
            'spaceToken': SpaceTokenContract,
            'splitMerge': SplitMergeContract,
            'spaceTokenSandbox': SpaceTokenContract,
            'splitMergeSandbox': SplitMergeContract,
            'oracles': OraclesContract,
            'galtDex': GaltDexContract,
            'geodesic': Geodesic,
            'plotEscrow': PlotEscrowContract,
            'claimManager': ClaimManagerContract,
            'spaceRA': SpaceReputationAccountingContract,
            'spaceLockerRegistry': SpaceLockerRegistryContract,
            'spaceLockerFactory': SpaceLockerFactoryContract,
            'multiSigRegistry': MultiSigRegistryContract,
            'fundsRegistry': FundsRegistryContract,
            'fundFactory': FundFactoryContract,
            'feeRegistry': FeeRegistryContract,
            'regularEthFeeFactory': FundFeeFactoryContract,
            'regularErc20FeeFactory': FundFeeFactoryContract
        };

        const aliases = {
            'spaceCustodianRegistry': 'scr',
            'spaceRA': 'sra',
            'spaceLockerRegistry': 'slr',
            'spaceLockerFactory': 'slf',
            'multiSigRegistry': 'msr'
        };

        Vue.prototype.$contracts = {};

        _.forEach(contracts, (ContractClass, contractName) => {
            Vue.prototype['$' + contractName + 'Contract'] = new ContractClass();

            Vue.prototype.$contracts['$' + contractName] = Vue.prototype['$' + contractName + 'Contract'];
            if(aliases[contractName]) {
                Vue.prototype.$contracts['$' + aliases[contractName]] = Vue.prototype['$' + contractName + 'Contract'];
                Vue.prototype['$' + aliases[contractName] + 'Contract'] = Vue.prototype['$' + contractName + 'Contract'];
            }
        });

        const onFinishedCallbacks = [];

        Vue.prototype.$contractsFactory = {
            finished: false,
            onFinish(callback) {
                onFinishedCallbacks.push(callback);
            },

            init(vueInstance, contractsConfig) {
                this.$notify = vueInstance.$notify;
                this.$locale = vueInstance.$locale;

                _.forEach(contracts, (ContractClass, contractName) => {
                    const contractInstance = Vue.prototype['$' + contractName + 'Contract'];

                    const contractAbi = contractsConfig[contractName + 'Abi'];
                    const contractAddress = contractsConfig[contractName + 'Address'];

                    if (!contractAbi) {
                        return console.error('Abi not found for contract', contractName);
                    }
                    if (!contractAddress) {
                        return console.error('Address not found for contract', contractAddress);
                    }

                    contractInstance.init(contractAbi, contractAddress);

                    contractInstance.onMethodNotResponding = this.serverNotRespondingMessage(contractName);

                    contractInstance.setErrorHandler(vueInstance.$sentry.exception);

                    contractInstance.setWeb3Worker(vueInstance.$web3Worker);
                    contractInstance.setName(contractName);
                });

                onFinishedCallbacks.forEach((callback) => callback());
                this.finished = true;
            },
            serverNotRespondingMessage(contractName) {
                return (options) => {
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get('server_not_responding.title'),
                        text: this.$locale.get('server_not_responding.title', {
                            contract_name: contractName,
                            contract_address: options.contractAddress,
                            method_name: options.methodName
                        })
                    });
                }
            },
        };
    }
}
