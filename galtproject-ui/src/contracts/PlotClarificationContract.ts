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
const galtUtils = require('@galtproject/utils');
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default class PlotClarificationContract extends AbstractApplicationContract {
    applicationStatuses = [
        {id: -1, name: 'all'},
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'submitted'},
        {id: 1.5, name: 'locked'}, // custom status for frontend
        {id: 2, name: 'approved'},
        {id: 3, name: 'reverted'}
    ];

    validationStatuses = [
        {id: 0, name: 'not_exist'},
        {id: 1, name: 'pending'},
        {id: 2, name: 'locked'},
        {id: 3, name: 'approved'},
        {id: 4, name: 'rejected'}
    ];
    
    // async stakeOf(address, role) {
    //     return GaltData.weiToEtherRound(await this.massCallMethod('stakeOf', [address, GaltData.stringToHex(role)]));
    // }
    //
    // async addStake(sendOptions, address, role, stake) {
    //     return await this.sendMethod(sendOptions, "stake", address, GaltData.stringToHex(role), GaltData.etherToWei(stake));
    // }


    async getApplicationById(applicationId, params: any = {}) {
        const application: any = await super.getApplicationById(applicationId, params, (roleValidation, application) => {
            if(application.statusName === 'rejected') {
                return;
            }
            
            if(roleValidation.oracle && roleValidation.oracle == params.validationForAddress) {
                if(_.includes(['locked', 'approved', 'rejected', 'reverted'], roleValidation.statusName)) {
                    // set personal status for oracle
                    application.status = this.getApplicationStatusIdByName(roleValidation.statusName);
                    application.statusName = this.getApplicationStatusName(application);
                }
            }
        });

        application.contractType = 'plotClarification';
        application.spaceToken = null;
        
        const payload = await this.massCallMethod('getApplicationPayloadById', [applicationId]);
        application.newGeoData = {
            level: payload.newLevel,
            contour: payload.newContour.map(galtUtils.numberToGeohash),
            heights: payload.newHeights.map(EthData.weiToEtherRound),
            ledgerIdentifier: payload.ledgerIdentifier,
            ledgerIdentifierName: EthData.hexToString(payload.ledgerIdentifier)
        };
        
        application.newGeoData.area = galtUtils.geohash.contour.area(application.newGeoData.contour);

        application.resolved = true;
        const promises = [];

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
        }).catch(() =>{});

        return application;
    }

    async submitApplication(sendOptions, application){
        let description = GaltData.getAdditionalDescriptionForSend(application);
        
        return await this.sendMethod(
            _.extend(sendOptions, {ether: application.feeCurrency == 'eth' ? application.fee : 0}),
            "submitApplication",
            application.multiSig,
            application.tokenId,
            EthData.toBytes(application.ledgerIdentifier),
            description,
            GaltData.geohashArrayToUint(application.contour),
            application.heights.map(EthData.etherToWei),
            application.level,
            application.feeCurrency == 'galt' ? EthData.etherToWei(application.fee) : "0"
        )
    }
}
