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

import FundSpaceReputationAccountingContract from "./FundSpaceReputationAccountingContract";
import SpaceReputationAccountingContract from "./SpaceReputationAccountingContract";
import GaltData from "../services/galtData";
import FeeContract from "./FeeContract";

const pIteration = require('p-iteration');
const EthContract = require('../libs/EthContract');

export default class FundsRegistryContract extends EthContract {

    async getFundsList() {
        return (await this.massCallMethod('getFundsList', [])).map((a) => a.toLowerCase());
    }
    async getFundsCount() {
        return this.massCallMethod('getFundsCount', []);
    }
    
    async getSRAByAddress(address) {
        let contract = new EthContract();

        try {
            this.initAnotherContract(contract, address, 'fundRA');
            
            await contract.callMethod('fundStorage');

            contract = new FundSpaceReputationAccountingContract();
            await this.initAnotherContract(contract, address, 'fundRA');
            contract.type = 'rsra';
        } catch (e) {
            contract = new SpaceReputationAccountingContract();
            await this.initAnotherContract(contract, address, 'spaceReputationAccounting');
            contract.type = 'sra';
        }

        await contract.fetchGeneralInfo();

        return contract;
    }
    
    async getSRAListByAddresses(addresses) {
        return await pIteration.map(addresses, (address) => {
            return this.getSRAByAddress(address);
        });
    }
    
    async getFeeContract(address) {
        let contract = new FeeContract();

        await this.initAnotherContract(contract, address, 'regularEthFee');
        const details = await contract.getDetails();
        if(details.feeCurrency === 'erc20') {
            contract = new FeeContract();
            await this.initAnotherContract(contract, address, 'regularErc20Fee');
        }
        await contract.fetchInfo();

        return contract;
    }
}
