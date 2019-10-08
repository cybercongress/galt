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
import SpaceLocker from "./SpaceLockerContract";

const pIteration = require('p-iteration');
import * as _ from 'lodash';
const EthContract = require('../libs/EthContract');

export default class SpaceLockerRegistryContract extends EthContract {
    async getSpaceLockersListByOwner(ownerAddress) {
        const lockersAddresses = await this.getSpaceLockersAddressesByOwner(ownerAddress);
        return pIteration.map(lockersAddresses, async (lockersAddress) => {
            const spaceLocker = await this.getSpaceLockerByAddress(lockersAddress);
            await spaceLocker.fetchTokenInfo();
            return spaceLocker;
        })
    }
    async getSpaceLockersAddressesByOwner(ownerAddress) {
        return this.massCallMethod('getLockersListByOwner', [ownerAddress]);
    }
    
    async getSpaceLockersCountByOwner(ownerAddress) {
        return this.massCallMethod('getLockersCountByOwner', [ownerAddress]);
    }

    async getSpaceLockerByAddress(address) {
        const contract = new SpaceLocker();

        await this.initAnotherContract(contract, address, 'spaceLocker');

        return contract;
    }

    async getSrasByMemberAsync(member) {
        const spaceLockers = await this.getSpaceLockersAddressesByOwner(member);

        const sras = [];
        
        const srasCountByAddress = {
            
        };
        pIteration.mapSeries(spaceLockers, async (spaceLocker) => {
            const spaceLockerContract = await this.getSpaceLockerByAddress(spaceLocker);

            await pIteration.forEachSeries(await spaceLockerContract.getSrasAddresses(), async (sraAddress) => {
                const sraObj = await GaltData.getSraByAddress(sraAddress);
                await sraObj.fetchGeneralInfo();
                
                srasCountByAddress[sraAddress] = srasCountByAddress[sraAddress] ? srasCountByAddress[sraAddress] + 1 : 1;
                
                if(srasCountByAddress[sraAddress] === 1) {
                    sras.push({
                        address: sraObj.address,
                        spaceTokenOwnersCount: sraObj.spaceTokenOwnersCount,
                        totalSupply: sraObj.totalSupply,
                        totalSupplyStr: sraObj.totalSupplyStr,
                        lockersCount: srasCountByAddress[sraAddress]
                    });
                } else {
                    const insertedSra = _.find(sras, {address: sraObj.address});
                    insertedSra.lockersCount = srasCountByAddress[sraAddress];
                }
            });
        });

        return sras;
    }
    
    // async isSpaceTokenAvailableForBuy(spaceTokenId) {
    //     return this.massCallMethod('availableForBuy', [spaceTokenId]);
    // }
    // async spaceTokenPrice(spaceTokenId) {
    //     return GaltData.weiToEtherRound(await this.massCallMethod('getSpaceTokenActualPrice', [spaceTokenId]));
    // }
    // async exchangeSpaceToGalt(sendOptions, spaceTokenId) {
    //     return await this.sendMethod(sendOptions, 'exchangeSpaceToGalt', spaceTokenId);
    // }
}
