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
    EXPLORER_DRAW_AREA, EXPLORER_DRAW_AREAS_LIST, EXPLORER_DRAW_SPACE_TOKEN,
    GetEventName
} from '../../../../services/events';

const galtUtils = require('@galtproject/utils');

import ContourInput from "../../../../directives/ContourInput/ContourInput";
import GaltData from "../../../../services/galtData";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'split-pack',
    template: require('./SplitSpaceToken.html'),
    components: {ContourInput},
    created() {

    },
    async mounted() {
        await this.drawSubjectSpaceToken();
        await this.getCurrentOperation();
        this.loading = false;
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async drawSubjectSpaceToken() {
            console.log('drawSubjectSpaceToken tokenId', this.$route.params.tokenId);
            this.subjectSpaceToken = await GaltData.getSpaceTokenObjectById(this.$route.params.tokenId);
            console.log('drawSubjectSpaceToken contour', this.subjectSpaceToken.contour);
            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, [this.subjectSpaceToken]);
        },
        async getCurrentOperation() {
            this.spaceSplitOperation = await this.$splitMergeContract.getCurrentSplitOperation(this.$route.params.tokenId);
            if (this.spaceSplitOperation && this.spaceSplitOperation.active) {
                this.clipping.contour = await this.spaceSplitOperation.getClippingContour();
                await this.spaceSplitOperation.getDoneStage();
            }
        },

        drawContour() {
            this.ended = false;
            
            const splitResult = galtUtils.geohash.contour.splitContours(this.subjectSpaceToken.contour, this.clipping.contour.length > 2 ? this.clipping.contour : [], true);

            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, [{
                contour: splitResult.base,
                level: this.subjectSpaceToken.level,
                reset: false
            }, {
                highlightGeohashes: this.clipping.contour,
                highlightGeohashesType: 'error',
                highlightContour: this.clipping.contour,
                highlightContourType: 'warn'
            }, {
                highlightContour: splitResult.split,
                highlightContourType: 'error'
            }]);

            this.subjectSpaceToken.contourAfterSplit = splitResult.base;
            this.subjectSpaceToken.areaAfterSplit = galtUtils.geohash.contour.area(splitResult.base);
            this.clipping.area = GaltData.beautyNumber(galtUtils.geohash.contour.area(splitResult.split));
        },

        approveSubjectToken() {
            this.clipping.approving = true;
            this.$galtUser.approveSpace(this.$splitMergeContract.address, this.subjectSpaceToken.tokenId).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.approve.title'),
                    text: this.getLocale('success.approve.description')
                });
                this.clipping.approving = false;
                this.approved = true;
            });
        },

        splitSubjectToken() {
            this.clipping.inProcess = true;

            this.$galtUser.startSplitOperation(this.subjectSpaceToken.tokenId, this.clipping.contour).then(async (res) => {
                this.processSplitOperation();
            }).catch(() => {
                this.clipping.inProcess = false;
            })
        },

        async processSplitOperation() {
            this.$waitScreen.show();

            await this.getCurrentOperation();
            
            if(!this.spaceSplitOperation.active) {
                return this.$notify({
                    type: 'error',
                    title: this.getLocale('error.not_active.title'),
                    text: this.getLocale('error.not_active.description')
                });
            }
            const txPrice = (await EthData.gasPrice(2000000)) * 3;

            const mode = await GaltData.useInternalWalletModal('SpaceSplitOperation', this.spaceSplitOperation.address, 7 + this.subjectSpaceToken.contour.length, txPrice).catch(() => {
                this.$waitScreen.hide();
            });

            if (!mode) {
                return;
            }

            const operationId = GaltData.getNewOperationId();
            this.$waitScreen.setOperationId(operationId);

            this.$galtUser.processSplitOperation(this.spaceSplitOperation, operationId)
                .then(async () => {
                    await this.spaceSplitOperation.getDoneStage();

                    if (mode == 'internal_wallet') {
                        await this.$galtUser.releaseInternalWallet('SpaceSplitOperation');
                    }

                    this.$waitScreen.hide();
                    
                    this.clipping.inProcess = false;

                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.split_operation.title'),
                        text: this.getLocale('success.split_operation.description')
                    });
                })
                .catch(() => {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.split_operation.title'),
                        text: this.getLocale('error.split_operation.description')
                    });
                })

        },

        finishSplitToken() {
            if(!this.spaceSplitOperation.active) {
                return this.$notify({
                    type: 'error',
                    title: this.getLocale('error.not_active.title'),
                    text: this.getLocale('error.not_active.description')
                });
            }
            
            this.clipping.inProcess = true;

            this.$galtUser.finishSplitOperation(this.subjectSpaceToken.tokenId).then(async (res) => {
                this.onClearContour();
                
                this.drawSubjectSpaceToken().then(() => {
                    setTimeout(() => {
                        this.drawSubjectSpaceToken();
                    }, 10000);
                });
                
                this.clipping.inProcess = false;
                this.spaceSplitOperation = null;

                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.finish.title'),
                    text: this.getLocale('success.finish.description')
                });
            }).catch((e) => {
                this.clipping.inProcess = false;
                console.error(e);
                return this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.not_active.description')
                });
            })
        },

        cancelSplitToken() {
            if(!this.spaceSplitOperation.active) {
                return this.$notify({
                    type: 'error',
                    title: this.getLocale('error.not_active.title'),
                    text: this.getLocale('error.not_active.description')
                });
            }
            
            this.clipping.inProcess = true;

            this.$galtUser.cancelSplitOperation(this.subjectSpaceToken.tokenId).then(async (res) => {
                this.onClearContour();
                this.drawSubjectSpaceToken();
                setTimeout(() => {
                    this.drawSubjectSpaceToken();
                }, 5000);
                this.clipping.inProcess = false;
                this.spaceSplitOperation = null;
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.cancel.title'),
                    text: this.getLocale('success.cancel.description')
                });
            }).catch((e) => {
                this.clipping.inProcess = false;
                console.error(e);
                return this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.not_active.description')
                });
            })
        },
        
        onClearContour() {
            this.clipping = {
                contour: [],
                area: 0,
                inProcess: false,
                valid: false
            };
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
            localeKey: 'split_space_token',
            explorerName: 'main',
            intervals: [],
            approved: false,
            loading: true,
            ended: false,
            spaceSplitOperation: null,
            subjectSpaceToken: {
                tokenId: null,
                contour: [],
                area: null,
                areaAfterSplit: null,
                contourAfterSplit: null
            },
            clipping: {
                contour: [],
                area: 0,
                approving: false,
                inProcess: false,
                valid: false
            }
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        splitSpaceTokenDisabled() {
            return !this.user_wallet || this.clipping.contour.length < 3 || !galtUtils.geohash.contour.splitPossible(this.subjectSpaceToken.contour, this.clipping.contour) || this.clipping.inProcess || !this.approved;
        }
    }
}
