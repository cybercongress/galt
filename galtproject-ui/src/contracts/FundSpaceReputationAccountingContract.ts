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

import SpaceReputationAccountingContract from './SpaceReputationAccountingContract';
import SpaceLocker from "./SpaceLockerContract";
import GaltData from "../services/galtData";
import FundStorageContract from "./FundStorageContract";

export default class FundSpaceReputationAccountingContract extends SpaceReputationAccountingContract {
    storage;
    
    async getFundStorage() {
        return this.massCallMethod('fundStorage', []);
    }
    async fetchGeneralInfo() {
        const fundStorageAddress = await this.getFundStorage();
        
        this.storage = await this.getFundStorageByAddress(fundStorageAddress);
        
        await this.storage.fetchGeneralInfo();
        
        await super.fetchGeneralInfo();
    }

    async getFundStorageByAddress(address) {
        const contract = new FundStorageContract();

        await this.initAnotherContract(contract, address, 'fundStorage');

        return contract;
    }
}
