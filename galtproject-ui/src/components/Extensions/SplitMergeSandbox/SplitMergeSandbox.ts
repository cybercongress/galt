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
} from '../../../services/events';

const galtUtils = require('@galtproject/utils');

import ContourInput from "../../../directives/ContourInput/ContourInput";
import GaltData from "../../../services/galtData";
import Sandbox from "./services/Sandbox";
import Explorer from "../../Explorer/Explorer";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'split-merge-sandbox',
    template: require('./SplitMergeSandbox.html'),
    components: {ContourInput, Explorer},
    props: [],
    async mounted() {
        if(this.$contractsFactory.finished) {
            this.init();
        } else {
            this.$contractsFactory.onFinish(this.init.bind(this))
        }
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async init() {
            Sandbox.init(this);
            await this.getCurrentOperation();
            this.loading = false;
        },
        async drawSubjectSpaceToken() {
            this.subject.contour = await this.$splitMergeSandboxContract.getPackageContour(this.subject.tokenId);
            this.emitExplorerEvent(EXPLORER_DRAW_AREA, this.subject.contour);
        },
        drawInput() {
            this.showMode = 'input';

            console.log('subject.contour', JSON.stringify(this.subject.contour));
            console.log('clipping.contour', JSON.stringify(this.clipping.contour));
            
            let splitResult = {
                base: this.subject.contour,
                split: []
            };
            if(this.subject.contour.length >= 3 && this.clipping.contour.length >= 3) {
                splitResult = galtUtils.geohash.contour.splitContours(this.subject.contour, this.clipping.contour, true);
            }

            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, [{
                contour: splitResult.base,
                level: this.subject.level,
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

            this.subject.contourAfterSplit = splitResult.base;
            this.subject.areaAfterSplit = galtUtils.geohash.contour.area(splitResult.base);
            this.clipping.area = GaltData.beautyNumber(galtUtils.geohash.contour.area(splitResult.split));
        },

        drawOutput() {
            this.showMode = 'output';
            
            console.log('subjectContourResult', JSON.stringify(this.spaceSplitOperation.finishInfo.subjectContourResult));
            console.log('resultContours', JSON.stringify(this.spaceSplitOperation.finishInfo.resultContours));
            
            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, this.spaceSplitOperation.finishInfo.resultContours.map((resultContour) => {
                return {
                    contour: resultContour,
                    level: 0,
                    reset: false
                }
            }).concat([{
                    contour: this.spaceSplitOperation.finishInfo.subjectContourResult,
                    level: 0,
                    reset: false
            }]));
        },
        
        async getCurrentOperation() {
            if(!this.$route.params.splitOperationAddress) {
                return;
            }
            this.spaceSplitOperation = await this.$splitMergeSandboxContract.getSplitOperationByAddress(this.$route.params.splitOperationAddress);
            if (this.spaceSplitOperation) {
                this.clipping.contour = await this.spaceSplitOperation.getClippingContour();
                this.subject.contour = await this.spaceSplitOperation.getSubjectContour();
                this.subject.tokenId = await this.spaceSplitOperation.getSubjectTokenId();
                await this.spaceSplitOperation.getDoneStage();
                if(this.spaceSplitOperation.doneStage === 'polygons_finish') {
                    this.spaceSplitOperation.getFinishInfo();
                }
            }
            this.drawInput();
        },

        async runSplit() {
            this.inProcess = true;
            this.$waitScreen.show(this.$locale.get(this.localeKey + '.wait_screen.subject_token_create'));

            this.subject.tokenId = await Sandbox.mintSpaceToken(this.user_wallet, this.subject.contour);
            
            this.$sentry.breadcrumb('split_merge_sandbox', 'run_split', {
                subject: this.subject.contour,
                clipping: this.clipping.contour
            });
            
            this.$waitScreen.show(this.$locale.get(this.localeKey + '.wait_screen.subject_token_approve'));

            await Sandbox.approveSpaceToken(this.$splitMergeSandboxContract.address, this.subject.tokenId);

            this.$waitScreen.changeCenterText(this.$locale.get(this.localeKey + '.wait_screen.split_operation_start'));

            this.$galtUser.startSplitOperationSandbox(this.subject.tokenId, this.clipping.contour).then(async (splitOperationAddress) => {
                this.$sentry.breadcrumb('split_merge_sandbox', 'create_split_contract', {
                    contractAddress: splitOperationAddress,
                    subject: this.subject.contour,
                    clipping: this.clipping.contour
                });
                
                this.$router.replace({ name: "extensions-split-merge-sandbox", params: {splitOperationAddress: splitOperationAddress} });
                this.$waitScreen.changeCenterText(this.$locale.get(this.localeKey + '.wait_screen.split_operation_process'));
                this.processSplitOperation();
            }).catch(() => {
                this.inProcess = false;
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

            const mode = await this.$galtUser.askForUseInternalWallet(
                'SpaceSplitOperation', 
                this.spaceSplitOperation.address, 
                (await EthData.gasPrice(2000000)) * 3, 
                7 + this.subject.contour.length
            );

            if (!mode) {
                this.$waitScreen.hide();
                return;
            }

            const operationId = GaltData.getNewOperationId();
            this.$waitScreen.setOperationId(operationId);

            this.$sentry.breadcrumb('split_merge_sandbox', 'process_split', {
                contractAddress: this.spaceSplitOperation.address,
                doneStage: this.spaceSplitOperation.doneStage,
                subject: this.subject.contour,
                clipping: this.clipping.contour
            });
            
            this.$galtUser.processSplitOperation(this.spaceSplitOperation, operationId)
                .then(async () => {
                    await this.spaceSplitOperation.getFinishInfo();
                    await this.spaceSplitOperation.getDoneStage();

                    this.$sentry.breadcrumb('split_merge_sandbox', 'finish_split', {
                        contractAddress: this.spaceSplitOperation.address,
                        doneStage: this.spaceSplitOperation.doneStage,
                        subject: this.subject.contour,
                        clipping: this.clipping.contour,
                        subjectContourResult: this.spaceSplitOperation.finishInfo.subjectContourResult,
                        resultContours: this.spaceSplitOperation.finishInfo.resultContours
                    });
                    
                    if (mode == 'internal_wallet') {
                        await this.$galtUser.releaseInternalWallet('SpaceSplitOperation');
                    }

                    this.$waitScreen.hide();

                    this.inProcess = false;

                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.split_operation.title'),
                        text: this.getLocale('success.split_operation.description')
                    });
                })
                .catch((e) => {
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

            this.inProcess = true;

            this.$galtUser.finishSplitOperationSandbox(this.subject.tokenId).then(async (res) => {
                this.drawOutput();
                this.inProcess = false;
                this.spaceSplitOperation.active = false;

                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.finish.title'),
                    text: this.getLocale('success.finish.description')
                });
            }).catch((e) => {
                this.inProcess = false;
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

            this.inProcess = true;

            this.$galtUser.cancelSplitOperationSandbox(this.subject.tokenId).then(async (res) => {
                this.onClearContour();
                this.drawInput();
                this.inProcess = false;
                this.spaceSplitOperation.active = false;

                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.cancel.title'),
                    text: this.getLocale('success.cancel.description')
                });
            }).catch((e) => {
                this.inProcess = false;
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
                valid: false
            };
        },

        reset() {
            this.$router.replace({ name: "extensions-split-merge-sandbox", params: {splitOperationAddress: null} });
            this.spaceSplitOperation = null;
            this.subject.tokenId = null;
            this.subject.contour = [];
            this.clipping.contour = [];
            this.drawInput();
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
            localeKey: 'extensions.split_merge_sandbox',
            explorerName: 'main',
            showMode: 'input',
            intervals: [],
            loading: true,
            ended: false,
            inProcess: false,
            spaceSplitOperation: null,
            subject: {
                tokenId: null,
                contour: [],
                area: null,
                areaAfterSplit: null,
                contourAfterSplit: null
            },
            clipping: {
                contour: [],
                area: 0,
                valid: false
            }
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        splitSpaceTokenDisabled() {
            return !this.user_wallet || this.clipping.contour.length < 3 || this.subject.contour.length < 3 || !galtUtils.geohash.contour.splitPossible(this.subject.contour, this.clipping.contour) || this.inProcess;
        }
    }
}
