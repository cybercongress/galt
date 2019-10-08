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

import * as _ from 'lodash';


import {
    EventBus,
    EXPLORER_DRAW_AREA,
    EXPLORER_HIGHLIGHT_GEOHASHES,
    EXPLORER_MOUSE_CLICK,
    GetEventName
} from '../../../../services/events';

import ContourInput from "../../../../directives/ContourInput/ContourInput";
const galtUtils = require('@galtproject/utils');

export default {
    name: 'create-new-pack',
    template: require('./CreateNewPack.html'),
    components: { ContourInput },
    created() {
        this.debounceFindIncludesAndDraw = _.debounce(async (reset: boolean = false) => {
            if(!this.firstRendered) {
                this.firstRendered = true;
                reset = true;
            }

            if(this.newPack.contour.length < 3) {
                if(this.newPack.contour.length > 0) {
                    this.$notify({
                        type: 'error',
                        title: this.$locale.get('create_new_pack.error.min_contour', {value: 3})
                    });
                    this.highlightGeohashesArrayOnMap(this.newPack.contour);
                }

                if(this.newPack.contour.length === 0) {
                    this.emitExplorerEvent(EXPLORER_DRAW_AREA, {
                        geohashes: this.allUserGeohashes,
                        highlightGeohashes: [],
                        contour: [],
                        reset: reset
                    });
                }
                return;
            }

            const emptyGeohashExist = this.newPack.contour.some((geohash) => {
                return !geohash;
            });

            if(emptyGeohashExist) {
                return;
            }

            this.newPack.geohashes = await this.findIncludesGeohashes();

            if(!this.newPack.geohashes.length) {
                this.$notify({
                    type: 'error',
                    title: this.$locale.get('create_new_pack.error.not_found_by_contour')
                });
                this.emitExplorerEvent(EXPLORER_DRAW_AREA, {
                    geohashes: this.allUserGeohashes,
                    highlightGeohashes: [],
                    contour: this.newPack.contour,
                    reset: reset
                });
                return;
            }
            this.approximatedLength = this.newPack.geohashes.length;

            this.emitExplorerEvent(EXPLORER_DRAW_AREA, {
                geohashes: this.allUserGeohashes,
                highlightGeohashes: this.newPack.geohashes,
                contour: this.newPack.contour,
                reset: reset
            });
        }, 2000);
    },

    async mounted() {
        this.$store.watch((state) => state.user_wallet,
            (user_wallet) => this.drawUserGeohashes()
        );

        if(this.user_wallet) {
            this.drawUserGeohashes();
        }
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async initNewPackAndAddGeohashes() {
            this.newPack.creating = true;

            const spaceTokensIds = await this.$galtUser.getSpaceTokensIds();

            this.$waitScreen.show();
            this.$waitScreen.changeCenterSubText(this.$locale.get('create_new_pack.wait_screen.create_pack'));

            await this.$galtUser.initPackage(this.newPack.geohashes[0]);

            if(this.newPack.geohashes.length > 1) {
                this.$notify({
                    type: 'success',
                    title: this.$locale.get('create_new_pack.success.init_pack.title'),
                    text: this.$locale.get('create_new_pack.success.init_pack.description')
                });

                const firstGeohash = this.newPack.geohashes[0];
                const geoashesToAdd = this.newPack.geohashes.slice(1);

                this.$galtUser.waitForAddPackage(spaceTokensIds).then(async (tokenId) => {
                    this.$notify({
                        type: 'success',
                        title: this.$locale.get('create_new_pack.success.init_pack_finish.title'),
                        text: this.$locale.get('create_new_pack.success.init_pack_finish.description')
                    });

                    const isSendTransactions = await this.$galtUser.checkGeohashesCountAndAskUserForInternalWallet('SplitMerge', tokenId, geoashesToAdd.length);

                    if(!isSendTransactions) {
                        this.$waitScreen.hide();
                        return;
                    }
                    this.$waitScreen.changeCenterSubText(this.$locale.get('create_new_pack.wait_screen.set_contour'));

                    this.$galtUser.setPackageContour(tokenId, this.newPack.contour);

                    this.$galtUser.sortGeohashesAndSendToSpaceTokenForAdd(tokenId, [firstGeohash], geoashesToAdd, (operationId) => {
                        this.$waitScreen.setOperationId(operationId);

                        this.$waitScreen.changeCenterSubText(this.$locale.get('create_new_pack.wait_screen.add_geohashes'));

                        this.$web3Worker.callMethod('waitForOperationMined', operationId).then(async (operationState) => {
                            console.log('operationState', operationState);
                            this.$waitScreen.changeCenterSubText(this.$locale.get('create_new_pack.wait_screen.release_rights'));

                            await this.$galtUser.releaseInternalWallet('SplitMerge', tokenId);

                            this.$waitScreen.hide();
                        })
                    }).then(this.clearNewPack);
                });
            } else {
                this.$notify({
                    type: 'success',
                    title: this.$locale.get('create_new_pack.success.single_geohash_pack_finish.title'),
                    text: this.$locale.get('create_new_pack.success.single_geohash_pack_finish.description')
                });
                this.clearNewPack();
            }
        },
        
        drawContour(reset: boolean = false) {
            this.debounceFindIncludesAndDraw(reset);
        },

        onClearContour(){
            this.newPack = {
                geohashes: [],
                contour: [],
                creating: false,
                valid: false
            };
        },

        highlightGeohashOnMap(geohash) {
            if(!geohash) {
                return;
            }
            this.emitExplorerEvent(EXPLORER_HIGHLIGHT_GEOHASHES, [geohash]);
        },
        highlightGeohashesArrayOnMap(geohashes) {
            this.emitExplorerEvent(EXPLORER_HIGHLIGHT_GEOHASHES, geohashes);
        },

        findIncludesGeohashes() {
            return galtUtils.geohash.contour.filterByInside(this.allUserGeohashes, this.newPack.contour);
        },

        subscribeToExplorerEvent(eventName, callback) {
            EventBus.$on(GetEventName(eventName, this.explorerName), callback);
        },
        emitExplorerEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.explorerName), data);
        },
        async drawUserGeohashes() {
            this.allUserGeohashes = await this.$galtUser.getGeohashes();

            this.emitExplorerEvent(EXPLORER_DRAW_AREA, {
                geohashes: this.allUserGeohashes,
                highlightGeohashes: [],
                contour: [],
                reset: true
            });
        }
    },
    data() {
        return {
            explorerName: 'main',
            intervals: [],
            allUserGeohashes: [],
            newPack: {
                contour: [],
                geohashes: [],
                creating: false,
                valid: false
            }
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        filtered_tokens() {
            if(this.filterByType) {
                return this.spaceList.filter((spaceToken) => {
                    return spaceToken.type === this.filterByType;
                });
            } else {
                return this.spaceList;
            }
        },
        createPackDisabled(){
            return !this.user_wallet || this.newPack.contour.length < 3 || this.newPack.geohashes.length < 1 || this.newPack.creating;
        }
    },
}
