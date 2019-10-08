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

import AbstractWorker from "./AbstractWorker";
const galtUtils = require('@galtproject/utils');

const ctx: Worker = self as any;

class GeohashesWorker extends AbstractWorker {
    constructor(ctx) {
        super('GeohashWorker', ctx);
    }

    approximateByContour(data) {
        return galtUtils.geohash.contour.approximate(data.contour, data.precision, (processName, index, totalLength) => {
            this.sendEvent('approximateByContourProcess', {
                processName,
                index,
                totalLength
            });
        });
    }

    sortGeohashesByNeighbourDirection(data) {
        return galtUtils.geohash.contour.sortGeohashesByNeighbourDirection(data.existsGeohashes, data.geohashesToAdd);
    }
    sendTransactionToContract(data) {
        console.log('GeohashesWorker.sendTransactionToContract', data);
    }
}

const worker = new GeohashesWorker(ctx);