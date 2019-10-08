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

import ArbitratorStakesContract from "./ArbitratorStakesContract";
import OracleStakesContract from "./OracleStakesContract";

import * as _ from 'lodash';
const EthContract = require('../libs/EthContract');

export default class ArbitrationConfigContract extends EthContract {
    async getArbitratorStakesAddress() {
        return this.massCallMethod('getArbitratorStakes', []);
    }

    async getArbitratorStakes() {
        const arbitratorStakesAddress = await this.getArbitratorStakesAddress();
        const contract = new ArbitratorStakesContract();

        await this.initAnotherContract(contract, arbitratorStakesAddress, 'arbitratorStakes');

        return contract;
    }
    
    async getAOracleStakesAddress() {
        return this.massCallMethod('getOracleStakes', []);
    }
    async getOSA() {
        const osaAddress = await this.getAOracleStakesAddress();
        
        const contract = new OracleStakesContract();

        await this.initAnotherContract(contract, osaAddress, 'oracleStakesAccounting');

        return contract;
    }
}
