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
import EthData from "@galtproject/frontend-core/libs/EthData";

const EthContract = require('../libs/EthContract');

export default class Geodesic extends EthContract {
    
    async cacheGeohashListToLatLonAndUtm(sendOptions, geohashContour) {
        return this.sendMethod(sendOptions, 'cacheGeohashListToLatLonAndUtm', GaltData.geohashArrayToUint(geohashContour));
    }

    async cacheGeohashListToLatLon(sendOptions, geohashContour) {
        return this.sendMethod(sendOptions, 'cacheGeohashListToLatLon', GaltData.geohashArrayToUint(geohashContour));
    }

    async cacheLatLonListToGeohash(sendOptions, latLonList) {
        const etherLatLonList = latLonList.map(latLon => latLon.map(EthData.etherToWei));
        return this.sendMethod(sendOptions, 'cacheLatLonListToGeohash', etherLatLonList, '12');
    }

    async cacheLatLonListToUtm(sendOptions, latLonList) {
        return this.sendMethod(sendOptions, 'cacheLatLonListToUtm', latLonList.map(latLon => latLon.map(EthData.etherToWei)));
    }

    async getContourArea(geohashContour) {
        return GaltData.weiToEtherRound(await this.massCallMethod('getContourArea', [GaltData.geohashArrayToUint(geohashContour)]));
    }
    
    async getCachedLatLonByGeohash(geohash) {
        return (await this.massCallMethod('getCachedLatLonByGeohash', [GaltData.geohashToUint(geohash)])).map((coor) => EthData.roundToDecimal(EthData.weiToEther(coor), 10));
    }

    async getCachedGeohashByLatLon(lat, lon, precision = 12) {
        const uintGeohash = await this.massCallMethod('getCachedGeohashByLatLon', [[EthData.etherToWei(lat), EthData.etherToWei(lon)], precision]);
        return GaltData.uintToGeohash(uintGeohash);
    }

    async getCachedUtmByGeohash(geohash) {
        return (await this.massCallMethod('getCachedUtmByGeohash', [GaltData.geohashToUint(geohash)])).map(EthData.weiToEtherRound);
    }
    
    async getCachedUtmByLatLon(lat, lon) {
        return (await this.massCallMethod('getCachedUtmByLatLon', [[EthData.etherToWei(lat), EthData.etherToWei(lon)]])).map(EthData.weiToEtherRound);
    }
    async getNotCachedGeohashes(geohashContour) {
        const uintGeohashes = await this.massCallMethod('getNotCachedGeohashes', [GaltData.geohashArrayToUint(geohashContour)]);
        return uintGeohashes.map(GaltData.uintToGeohash)
    }
}
