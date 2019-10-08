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
    EXPLORER_DRAW_AREA, EXPLORER_DRAW_SPACE_TOKEN,
    EXPLORER_DRAW_SPACE_TOKENS_LIST,
    GetEventName
} from '../../../../services/events';

const galtUtils = require('@galtproject/utils');

import ContourInput from "../../../../directives/ContourInput/ContourInput";
import GaltData from "../../../../services/galtData";

export default {
    name: 'merge-pack',
    template: require('./MergePack.html'),
    components: {ContourInput},
    created() {

    },
    async mounted() {
        await this.drawBasePack();
        this.basePackLoading = false;
        await this.getPossibleForMergePacks();
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async drawBasePack() {
            this.basePack = await GaltData.getSpaceTokenObjectById(this.$route.params.tokenId);
            this.emitExplorerEvent(EXPLORER_DRAW_SPACE_TOKEN, this.basePack);
        },
        showSpaceToken(spaceToken) {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, [this.basePack, spaceToken]);
        },
        
        async getPossibleForMergePacks(){
            this.mergePacksLoading = true;
            let packs = await this.$galtUser.getSpaceTokens();
            this.possibleForMergePacks = packs.filter(pack => {
                let possibleForMerge = pack.tokenId !== this.basePack.tokenId
                                            && pack.level === this.basePack.level
                                            && galtUtils.geohash.contour.mergePossible(pack.contour, this.basePack.contour);
                
                pack.expandContourTo = galtUtils.geohash.contour.mergeContours(this.basePack.contour, pack.contour);
                pack.expandAreaTo = galtUtils.geohash.contour.area(pack.expandContourTo);
                
                return possibleForMerge;
            });
            this.mergePacksLoading = false;
        },

        mergePack(spaceToken) {
            this.$waitScreen.show();
            this.$galtUser.mergePackage(this.basePack.tokenId, spaceToken.tokenId).then(() => {
                this.$waitScreen.hide();
                
                this.drawBasePack();
                this.getPossibleForMergePacks();
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.merge.title'),
                    text: this.getLocale('success.merge.description')
                });
            }).catch(() => {
                this.$waitScreen.hide();
            })
        },

        subscribeToExplorerEvent(eventName, callback) {
            EventBus.$on(GetEventName(eventName, this.explorerName), callback);
        },
        emitExplorerEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.explorerName), data);
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'merge_pack',
            explorerName: 'main',
            intervals: [],
            basePackLoading: true,
            mergePacksLoading: true,
            ended: false,
            basePack: {
                tokenId: null,
                contour: [],
                area: null,
                areaAfterSplit: null
            },
            possibleForMergePacks: []
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    }
}
