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
    EXPLORER_DRAW_AREAS_LIST,
    GetEventName
} from '../../../../services/events';
import ContourInput from "../../../../directives/ContourInput/ContourInput";
import FeeInput from "../../../../directives/FeeInput/FeeInput";
import GaltData from "../../../../services/galtData";
import Explorer from "../../../Explorer/Explorer";
import SpaceGeoDataInputs from "../../../../directives/SpaceGeoDataInputs/SpaceGeoDataInputs";

const galtUtils = require('@galtproject/utils');
const _ = require('lodash');

export default {
    name: 'space-token-edit-page',
    template: require('./SpaceTokenEditPage.html'),
    components: {Explorer, SpaceGeoDataInputs},
    props: ['mode'],
    created() {
        if (this.needApproveSpace) {
            this.checkSpaceApproved();
            this.$store.watch((state) => state.user_wallet,
                (user_wallet) => user_wallet && this.checkSpaceApproved.call(this)
            );
        }
        
        if (this.mode === 'clarification') {
            this.spaceToken.tokenId = this.$route.params.tokenId;
        } else if(this.mode === 'resubmit_plot') {
            this.spaceToken.applicationId = this.$route.params.applicationId;
        }
    },
    async mounted() {
        await this.initSpaceToken();
        this.loading = false;
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async initSpaceToken() {
            if (this.mode === 'clarification') {
                this.basePlot = await GaltData.getSpaceTokenObjectById(this.spaceToken.tokenId);
            } else if(this.mode === 'resubmit_plot') {
                this.basePlot = await this.$plotManagerContract.getDetailsAsSpaceToken(this.spaceToken.applicationId);
            }

            this.spaceToken = _.cloneDeep(this.basePlot);
            if(!this.spaceToken.multiSig) {
                await this.$plotManagerContract.onReady();
                //TODO: make multisig selector
                this.newApplication.multiSig = GaltData.contractsConfig.arbitratorsMultiSigXAddress;
            }

            this.drawContour();
        },
        
        async checkSpaceApproved() {
            if(!this.spaceToken.tokenId) {
                return;
            }
            this.spaceApproved = await this.$galtUser.isApprovedSpace(this.contractAddress, this.spaceToken.tokenId);
        },
        approveGalt() {
            this.$waitScreen.show();

            this.$galtUser.approveGalt(this.contractAddress, this.spaceToken.fee)
                .then(() => {
                    this.galtApproved = true;
                    this.$waitScreen.hide();
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.approve_galt.title'),
                        text: this.getLocale('success.approve_galt.description')
                    });
                }).catch((e) => {
                    console.error(e);
                    this.$waitScreen.hide();
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.approve_galt.title'),
                        text: this.getLocale('error.approve_galt.description')
                    });
                })
        },
        approveSpaceToken() {
            this.$waitScreen.show();

            this.$galtUser.approveSpace(this.contractAddress, this.spaceToken.tokenId)
                .then(() => {
                    this.spaceApproved = true;
                    this.$waitScreen.hide();
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.approve_space_token.title'),
                        text: this.getLocale('success.approve_space_token.description')
                    });
                }).catch((e) => {
                console.error(e);
                this.$waitScreen.hide();
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.approve_space_token.title'),
                    text: this.getLocale('error.approve_space_token.description')
                });
            })
        },

        drawContour() {
            this.ended = false;

            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, [{
                highlightGeohashes: this.basePlot.contour,
                highlightGeohashesType: 'error',
                highlightContour: this.basePlot.contour,
                highlightContourType: 'error'
            }, this.spaceToken]);

            if(_.includes(this.spaceToken.type, 'predefined')) {
                this.spaceToken.areaStr = GaltData.beautyNumber(this.spaceToken.customArea);
            } else {
                this.spaceToken.areaStr = GaltData.beautyNumber(galtUtils.geohash.contour.area(this.spaceToken.contour));
            }
        },

        async submit() {
            this.$waitScreen.show();
            this.$waitScreen.changeCenterSubText(this.getLocale('wait_screen.submit'));

            let promise;
            if (this.mode === 'clarification') {
                this.spaceToken.tokenId = this.basePlot.tokenId;
                promise = this.$galtUser.applyForPlotClarification(this.spaceToken);
            } else if(this.mode === 'resubmit_plot') {
                promise = this.$galtUser.resubmitPlotManagetApplication(this.spaceToken);
            }
            
            promise.then(async () => {
                this.$waitScreen.hide();

                this.spaceToken = {
                    contour: [],
                    heights: [],
                    area: 0,
                    level: null,
                    ledgerIdentifier: "",
                    ended: true
                };
                this.loading = false;

                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.submit.title'),
                    text: this.getLocale('success.submit.description')
                });
            }).catch(async (e) => {
                console.error(e);

                this.$waitScreen.hide();
                this.loading = false;

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.submit.title'),
                    text: this.getLocale('error.submit.description')
                });
            });
        },

        onClearContour() {
            this.loading = false;
            this.spaceToken = {
                contour: [],
                area: 0,
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
            explorerName: 'main',
            intervals: [],
            loading: true,
            spaceApproved: false,
            galtApproved: false,
            basePlot: null,
            invalidInputs: false,
            invalidFee: false,
            ended: false,
            spaceToken: {
                applicationId: null,
                contour: [],
                heights: [],
                area: 0,
                level: null,
                ledgerIdentifier: "",
                valid: false,
                fee: null,
                feeCurrency: null,
                editCredentials: false,
                documentId: null,
                fullName: null,
            }
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        isInvalid() {
            return this.loading || this.invalidInputs || this.invalidFee;
        },
        approveSpaceTokenDisabled() {
            return this.isInvalid || this.spaceToken.loading || this.spaceToken.ended;
        },
        approveGaltDisabled() {
            return this.isInvalid || this.spaceToken.loading || this.spaceToken.ended;
        },
        submitDisabled() {
            return this.approveSpaceTokenDisabled 
                || (this.needApproveSpace && !this.spaceApproved) 
                || (this.needApproveGalt && !this.galtApproved);
        },
        needApproveGalt() {
            return this.spaceToken.feeCurrency === 'galt' && this.spaceToken.fee > 0;
        },
        needApproveSpace() {
            return this.mode === 'clarification';
        },
        needCredentials() {
            return this.mode === 'resubmit_plot';
        },
        needGeohashCaching() {
            return true;
        },
        applicationType() {
            return {
                'clarification': 'plotClarification',
                'resubmit_plot': 'plotManagerResubmit'
            }[this.mode];
        },
        localeKey() {
            return {
                'clarification': 'plot_clarification',
                'resubmit_plot': 'resubmit_plot_manager'
            }[this.mode];
        },
        backLink() {
            return {
                'clarification': '/land/my-territory/list',
                'resubmit_plot': '/land/my-applications'
            }[this.mode];
        },
        contractAddress() {
            return {
                'clarification': this.$plotClarificationContract.address,
                'resubmit_plot': this.$plotManagerContract.address
            }[this.mode];
        }
    }

}
