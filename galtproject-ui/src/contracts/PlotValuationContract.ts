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
import AbstractApplicationContract from "./AbstractApplicationContract";
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default class PlotValuationContract extends AbstractApplicationContract {

    applicationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'submitted'},
        {id: 1.5, name: 'locked'},
        {id: 2, name: 'valuated'},
        {id: 3, name: 'confirmed'},
        {id: 4, name: 'reverted'},
        {id: 5, name: 'approved'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'pending'},
        {id: 2, name: 'locked'}
    ];
    
    async getApplicationById(applicationId, params?) {
        const application = await super.getApplicationById(applicationId, params, (roleValidation, application) => {
            if(_.includes(['approved', 'reverted', 'rejected'], application.statusName))
                return;
            
            if(roleValidation.oracle && roleValidation.oracle == params.validationForAddress) {
                if(_.includes(['locked', 'approved', 'rejected', 'reverted'], roleValidation.statusName)) {
                    // set personal status for oracle
                    application.status = this.getApplicationStatusIdByName(roleValidation.statusName);
                    application.statusName = this.getApplicationStatusName(application);
                }
            }
        });

        application.contractType = 'plotValuation';

        application.resolved = false;
        const promises = [];

        application.spaceToken = null;
        //TODO: move common spaceToken operations to abstract application

        application.spaceTokenId = application.spaceTokenId.toString(10);
        
        const spaceTokenPromise = GaltData.getSpaceTokenObjectById(application.spaceTokenId).then((spaceToken) => {
            application.spaceToken = spaceToken;
        }).catch(() => { });

        try {
            await spaceTokenPromise;
        } catch (e) {

        }
        
        application.resolvePromise = Promise.all(promises).then(() => {
            application.resolved = true;
        });

        return application;
    }
    
    async submitApplication(sendOptions, application){
        return await this.sendMethod(
            _.extend(sendOptions, {ether: application.feeCurrency == 'eth' ? application.fee : 0}),
            "submitApplication",
            application.tokenId,
            application.documents.map(EthData.stringToHex),
            application.feeCurrency == 'galt' ? EthData.etherToWei(application.fee) : "0"
        )
    }

    async spaceTokenPrice(spaceTokenId) {
        return GaltData.weiToEtherRound(await this.massCallMethod("plotValuations", [spaceTokenId]));
    }
}
