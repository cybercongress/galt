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

import SpaceTokenContour from "../SpaceTokenContour/SpaceTokenContour";

export default {
    name: 'space-token-card',
    template: require('./SpaceTokenCard.html'),
    props: ['spaceToken', 'infoMark', 'full', 'selectable'],
    components: {SpaceTokenContour},
    async mounted() {
        // this.getGeohashesCount();
    },
    watch: {
        async spaceToken() {
            // this.getGeohashesCount();
        }
    },
    methods: {
        // async getGeohashesCount(){
        //     this.geohashesCount = null;
        //     if(this.spaceToken.isPack) {
        //         this.geohashesCount = await GaltData.getPackageGeohashesCount(this.spaceToken.tokenId);
        //     }
        // }
    },
    data() {
        return {
            geohashesCount: null
        }
    }
}
