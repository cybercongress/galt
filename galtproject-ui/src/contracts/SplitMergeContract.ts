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

import SpaceSplitOperationContract from "./SpaceSplitOperationContract";

const galtUtils = require('@galtproject/utils');
import GaltData from "../services/galtData";
import * as pIteration from "p-iteration";
import * as _ from "lodash";
import EthData from "@galtproject/frontend-core/libs/EthData";

const EthContract = require('../libs/EthContract');

export default class SplitMergeContract extends EthContract {
    async initPackage(sendOptions, firstGeohash){
        await this.sendMethod(
            sendOptions,//, gas: 1000000
            "initPackage",
            GaltData.geohashToTokenId(firstGeohash)
        );
    }

    async splitGeohash(sendOptions, spaceTokenId){
        await this.sendMethod(
            sendOptions,//, gas: 1000000
            "splitGeohash",
            spaceTokenId
        );
    }

    async mergeGeohash(sendOptions, spaceTokenId){
        await this.sendMethod(
            sendOptions,//, gas: 1000000
            "mergeGeohash",
            spaceTokenId
        );
    }

    getReadyForMergeParents(spaceTokensList) {
        const geohashList = GaltData.spaceTokensListToGeohashList(spaceTokensList);

        return galtUtils.geohash
            .getFullParentsFromGeohashList(geohashList)
            .map((parentGeohash) => {
                return {
                    tokenId: GaltData.geohashToTokenId(parentGeohash),
                    type: 'geohash',
                    geohash: parentGeohash,
                    isPack: false,
                    isGeohash: true
                };
            });
    }

    async filterGeohashesByNotPermittedForAddToPackage(geohashes, userWallet) {
        return await pIteration.filter(geohashes, async (geohash) => {
            return await this.isGeohashNotAllowedForPackage(geohash, userWallet);
        });
    }

    async isGeohashNotAllowedForPackage(geohash, userWallet) {
        const geohashOwner = await this.ownerOfGeohash(geohash);
        return userWallet != geohashOwner;
    }

    filterByGeohashNotExistingInArray(geohashToFilter, geohashesToFind) {
        return geohashToFilter.filter((geohash) => {
            return !_.includes(geohashesToFind, geohash);
        });
    }

    filterByGeohashOrParentsArrayNotExistingInArray(geohashToFilter, geohashesToFind) {
        return geohashToFilter.filter((geohash) => {
            const parent = galtUtils.geohash.getParent(geohash);
            const parentOfParent = galtUtils.geohash.getParent(parent);
            const parentOfParentOfParent = galtUtils.geohash.getParent(parentOfParent);
            return !_.includes(geohashesToFind, geohash) && !_.includes(geohashesToFind, parent) && !_.includes(geohashesToFind, parentOfParent) && !_.includes(geohashesToFind, parentOfParentOfParent);
        });
    }

    filterByGeohashOrParentsArrayExistingInArray(geohashArray, geohashesToFind) {
        return geohashesToFind.filter((geohash) => {
            const parent = galtUtils.geohash.getParent(geohash);
            const parentOfParent = galtUtils.geohash.getParent(parent);
            const parentOfParentOfParent = galtUtils.geohash.getParent(parentOfParent);
            return _.includes(geohashArray, geohash) || _.includes(geohashArray, parent) || _.includes(geohashArray, parentOfParent) || _.includes(geohashArray, parentOfParentOfParent);
        });
    }

    // async getPackageGeohashes(spaceTokenId) {
    //     const packGeohashes = await this.massCallMethod("getPackageGeohashes", [spaceTokenId]);
    //     return packGeohashes.map(GaltData.tokenIdToGeohash);
    // }
    //
    // async getPackageGeohashesCount(spaceTokenId) {
    //     if(!spaceTokenId) {
    //         return 0;
    //     }
    //     const geohashesCount = await this.massCallMethod("getPackageGeohashesCount", [spaceTokenId]);
    //     return parseInt(geohashesCount.toString());
    // }
    
    async getTokenArea(spaceTokenId) {
        const tokenAreaWei = await this.massCallMethod("tokenArea", [spaceTokenId]);
        return EthData.weiToEtherRound(tokenAreaWei);
    }
    
    async getPackageContour(spaceTokenId) {
        const packContour = await this.massCallMethod("getPackageContour", [spaceTokenId]);
        return packContour.map(galtUtils.numberToGeohash);
    }
    
    async getPackageGeoData(spaceTokenId) {
        const geodata = await this.massCallMethod("getPackageGeoData", [spaceTokenId]);
        geodata.contour = geodata.contour.map(galtUtils.numberToGeohash);
        geodata.heights = geodata.heights.map(GaltData.weiToEtherRound);
        return geodata
    }

    async setPackageContour(sendOptions, spaceTokenId, geohashesContour) {
        return this.sendMethod(
            sendOptions,
            "setPackageContour",
            spaceTokenId,
            GaltData.geohashArrayToUint(geohashesContour)
        );
    }

    async startSplitOperation(sendOptions, sourcePackageTokenId, clippingContour){
        const response = await this.sendMethod(
            sendOptions,//, gas: 1000000
            "startSplitOperation",
            sourcePackageTokenId,
            GaltData.geohashArrayToUint(clippingContour)
        );
        
        const splitOperationStart = this.parseEvent('SplitOperationStart', response.receipt);
        return splitOperationStart.splitOperation;
    }

    async cancelSplitOperation(sendOptions, subjectSpaceTokenId){
        return await this.sendMethod(
            sendOptions,//, gas: 1000000
            "cancelSplitPackage",
            subjectSpaceTokenId
        );
    }

    async finishSplitOperation(sendOptions, subjectSpaceTokenId){
        return await this.sendMethod(
            sendOptions,//, gas: 1000000
            "finishSplitOperation",
            subjectSpaceTokenId
        );
    }
    
    async getCurrentSplitOperationAddress(spaceTokenId) {
        return await this.massCallMethod("getCurrentSplitOperation", [spaceTokenId]).catch(() => null);
    }
    async getSplitOperationActive(address) {
        return await this.massCallMethod("activeSplitOperations", [address]);
    }
    
    async getCurrentSplitOperation(spaceTokenId) {
        const address = await this.getCurrentSplitOperationAddress(spaceTokenId).catch(() => null);
        if(!address) {
            return null;
        }
        
        return this.getSplitOperationByAddress(address);
    }
    
    async getSplitOperationByAddress(address) {
        const contract = new SpaceSplitOperationContract();

        await this.initAnotherContract(contract, address, 'spaceSplitOperation');

        contract.active = await this.getSplitOperationActive(address);

        return contract;
    }

    async mergePackage(sendOptions, sourcePackageTokenId, destinationTokenId, newPackageContour){
        return await this.sendMethod(
            sendOptions,//, gas: 1000000
            "mergePackage",
            sourcePackageTokenId,
            destinationTokenId,
            GaltData.geohashArrayToUint(newPackageContour)
        );
    }
}
