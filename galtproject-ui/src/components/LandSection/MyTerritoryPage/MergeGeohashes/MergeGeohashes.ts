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

import {
    EventBus, 
    EXPLORER_DRAW_AREA, 
    EXPLORER_DRAW_AREAS_LIST,
    GetEventName
} from '../../../../services/events';

import GaltData from "../../../../services/galtData";
const galtUtils = require('@galtproject/utils');

export default {
    name: 'merge-geohashes',
    template: require('./MergeGeohashes.html'),
    components: {},
    created() {

    },
    async mounted() {
        this.$store.watch((state) => state.user_space_balance,
            (user_space_balance) => this.getSpaceList()
        );
        this.$store.watch((state) => state.user_wallet,
            (user_wallet) => this.getSpaceList()
        );
        await this.getSpaceList();
    },

    beforeDestroy() {

    },

    methods: {
        async getSpaceList() {
            this.spaceList = await this.$galtUser.getSpaceTokens('geohash');
            this.allUserGeohashes = GaltData.spaceTokensListToGeohashList(this.spaceList);

            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, [{
                geohashes: this.availableForMergeChildren,
                highlightGeohashes: [],
                contour: [],
                reset: true
            }]);
        },
        showSpaceToken(spaceToken) {
            this.emitExplorerEvent(EXPLORER_DRAW_AREA, {
                geohashes: galtUtils.geohash.getChildren(spaceToken.geohash),
                highlightGeohashes: [spaceToken.geohash],
                contour: [],
                reset: true
            });
        },
        async mergeGeohash(spaceToken) {
            this.$galtUser.mergeGeohash(spaceToken.tokenId);
        },
        subscribeToExplorerEvent(eventName, callback) {
            EventBus.$on(GetEventName(eventName, this.explorerName), callback);
        },
        emitExplorerEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.explorerName), data);
        }
    },
    data() {
        return {
            explorerName: 'main',
            intervals: [],
            spaceList: [],
            allUserGeohashes: []
        };
    },
    watch: {
        filterByType() {
            this.getSpaceList();
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        availableForMergeTokens() {
            return this.$splitMergeContract.getReadyForMergeParents(this.spaceList);
        },
        availableForMergeChildren() {
            let geohashesList = [];
            this.availableForMergeTokens.forEach(spaceToken => {
                geohashesList = geohashesList.concat(galtUtils.geohash.getChildren(spaceToken.geohash));
            });
            return geohashesList;
        }
    },
}
