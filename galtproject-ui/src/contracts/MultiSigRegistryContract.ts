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
import SpaceSplitOperationContract from "./SpaceSplitOperationContract";
import OracleStakesContract from "./OracleStakesContract";
import ArbitrationConfigContract from "./AribtrationConfigContract";

const EthContract = require('../libs/EthContract');

export default class MultiSigRegistryContract extends EthContract {
    async getMultiSigAddresses() {
        return this.massCallMethod('getMultiSigList', []);
    }
    async getMultiSig(msAddress) {
        return this.massCallMethod('multiSigs', [msAddress]);
    }
    async getMultiSigCount() {
        return this.massCallMethod('getMultiSigCount', []);
    }
    async getMultiSigByIndex(index) {
        return this.massCallMethod('getMultiSig', [index]);
    }
    async getArbitrationConfigOfMultiSig(msAddress) {
        const msObject = await this.getMultiSig(msAddress);

        const contract = new ArbitrationConfigContract();

        await this.initAnotherContract(contract, msObject.arbitrationConfig, 'arbitrationConfig');

        return contract;
    }
    // async exchangeSpaceToGalt(sendOptions, spaceTokenId) {
    //     return await this.sendMethod(sendOptions, 'exchangeSpaceToGalt', spaceTokenId);
    // }
}
