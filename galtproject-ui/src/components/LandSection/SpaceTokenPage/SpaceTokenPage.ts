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

import GaltData from "../../../services/galtData";
import SpaceTokenCloudpoints from "./SpaceTokenCloudpoints/SpaceTokenCloudpoints";
import SpaceToken3d from "./SpaceToken3d/SpaceToken3d";
import SpaceTokenMap from "./SpaceTokenMap/SpaceTokenMap";

export default {
    name: 'space-token-page',
    template: require('./SpaceTokenPage.html'),
    components: {SpaceTokenCloudpoints, SpaceToken3d, SpaceTokenMap},
    async created() {
        this.loadPageData();
    },
    mounted() {
        
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async loadPageData(){
            this.viewType = this.$route.params.viewType || this.defaultTab;

            //TODO: uncomment after no need ownerHardCode
            // if(!this.lastSpaceTokenId || this.$route.params.tokenId != this.lastSpaceTokenId) {
                this.lastSpaceTokenId = this.$route.params.tokenId;
                
                this.spaceTokenLoading = true;
                await this.getSpaceToken();
                await this.getSpaceTokensTree();
                this.spaceTokenLoading = false;
            // }
        },
        async getSpaceToken() {
            this.spaceToken = await GaltData.getSpaceTokenObjectById(this.$route.params.tokenId);
        },
        async getSpaceTokensTree() {
            this.spaceTokensTree = await GaltData.getSpaceTokensTree(this.spaceToken, this.viewType !== '3d');
            this.applyFilters();
        },
        applyFilters() {
            this.spaceTokensTree = this.spaceTokensTree.map(spaceTokenItem => {
                if(spaceTokenItem.current) {
                    spaceTokenItem.hide = false;
                } else {
                    spaceTokenItem.hide = this.showOnlyCurrent;
                }
                return spaceTokenItem;
            })
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'space_token_page',
            defaultTab: 'map',
            intervals: [],
            spaceTokenLoading: true,
            ended: false,
            spaceToken: null,
            spaceTokensTree: [],
            spaceListForRender: [],
            viewType: null,
            lastSpaceTokenId: null,
            showOnlyCurrent: true
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    watch: {
        '$route' (to, from) {
            this.loadPageData();
        },
        'showOnlyCurrent'(){
            this.applyFilters();
        }
    }
}
