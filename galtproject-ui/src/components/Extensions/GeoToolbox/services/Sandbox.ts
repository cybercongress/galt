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

import GaltData from "../../../../services/galtData";
import EthData from "@galtproject/frontend-core/libs/EthData";

const config = require("../../../../../config");
const galtUtils = require('@galtproject/utils');

export default class Sandbox {
    static $contracts: any;
    static $galtUser: any;
    
    static init(vueInstance) {
        this.$contracts = vueInstance.$contracts;
        this.$galtUser = vueInstance.$galtUser;
    }
    
    static async mintSpaceToken(toAddress, contour) {
        const response = await this.$contracts.$splitMergeSandbox.sendMethod(
            this.$galtUser.getSendOptions(),
            "createPackage",
            toAddress,
            contour.map(galtUtils.geohashToGeohash5),
            contour.map(() => 0),
            EthData.etherToWei(galtUtils.geohash.contour.area(contour)),
            '1'
        );
        
        const packageInit = this.$contracts.$splitMergeSandbox.parseEvent('PackageInit', response.receipt);
        
        return packageInit.id;
    }

    static async approveSpaceToken(toAddress, spaceTokenId) {
        return this.$contracts.$spaceTokenSandbox.approveSpace(this.$galtUser.getSendOptions(), toAddress, spaceTokenId);
    }
}
