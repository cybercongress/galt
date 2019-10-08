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

import * as _ from "lodash";
import EthData from "@galtproject/frontend-core/libs/EthData";

const EthContract = require('../libs/EthContract');

export default class GaltDexContract extends EthContract {
    async exchangeEthToGalt(sendOptions, ethAmount) {
        return await this.sendMethod(_.extend(sendOptions, {ether: ethAmount}), 'exchangeEthToGalt');
    }

    async exchangeGaltToEth(sendOptions, galtAmount) {
        return await this.sendMethod(sendOptions, 'exchangeGaltToEth', EthData.etherToWei(galtAmount));
    }
    
    async hasRole(userWallet, role) {
        return this.massCallMethod('hasRole', [userWallet, role]);
    }

    async withdrawEthFee(sendOptions) {
        return await this.sendMethod(sendOptions, 'withdrawEthFee');
    }

    async withdrawGaltFee(sendOptions) {
        return await this.sendMethod(sendOptions, 'withdrawGaltFee');
    }

    async setFee(sendOptions, currency, amount) {
        return await this.sendMethod(sendOptions, "set" + EthData.upperFirst(currency.toLowerCase()) + "Fee", EthData.szaboToWei(amount));
    }
}
