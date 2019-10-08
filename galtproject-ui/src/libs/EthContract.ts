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
import EthContract from "@galtproject/frontend-core/libs/EthContract";
import GaltData from "../services/galtData";

module.exports = class GaltContract extends EthContract {
    async initAnotherContract(contract, address, configName) {
        await this.onReady();
        // console.log(configName + 'Abi', address, GaltData.contractsConfig[configName + 'Abi']);
        contract.init(GaltData.contractsConfig[configName + 'Abi'] || configName, address);

        contract.onMethodNotResponding = this.onMethodNotResponding;

        contract.setErrorHandler(this.errorHandler);

        contract.setWeb3Worker(this.web3Worker);
    }
};
