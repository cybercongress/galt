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
    EXPLORER_DRAW_AREAS_LIST, EXPLORER_DRAW_SPACE_TOKEN,
    GetEventName
} from '../../../../services/events';

const galtUtils = require('@galtproject/utils');

import ContourInput from "../../../../directives/ContourInput/ContourInput";
import FeeInput from "../../../../directives/FeeInput/FeeInput";
import GaltData from "../../../../services/galtData";
import SpecifyCredentialsModal from "../../NewApplicationPage/modals/SpecifyCredentialsModal/SpecifyCredentialsModal";

export default {
    name: 'add-building',
    template: require('./AddBuilding.html'),
    components: {ContourInput, FeeInput},
    created() {

    },
    async mounted() {
        await this.drawBasePack();
        this.loading = false;
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async drawBasePack() {
            this.basePack = await GaltData.getSpaceTokenObjectById(this.$route.params.tokenId);
            this.emitExplorerEvent(EXPLORER_DRAW_SPACE_TOKEN, this.basePack);
        },

        drawContour(reset: boolean = false) {
            this.ended = false;
            
            this.emitExplorerEvent(EXPLORER_DRAW_AREAS_LIST, [this.basePack, {
                highlightGeohashes: this.newBuilding.contour,
                highlightGeohashesType: 'error',
                highlightContour: this.newBuilding.contour,
                highlightContourType: 'error'
            }]);

            this.newBuilding.area = GaltData.beautyNumber(galtUtils.geohash.contour.area(this.newBuilding.contour));
        },

        async sendApplication() {
            this.newBuilding.loading = true;

            this.$root.$asyncModal.open({
                id: 'specify-credentials-modal',
                component: SpecifyCredentialsModal,
                props: {

                },
                onClose: (userData) => {
                    if(!userData) {
                        this.newBuilding.loading = false;
                        return;
                    }

                    // this.newBuilding.country = userData.country;
                    this.newBuilding.credentialsHash = this.$plotManagerContract.generateCredentialsHash(userData.fullName, userData.documentId);

                    this.submitApplication();
                }
            });
        },

        async submitApplication() {
            this.$waitScreen.show();
            this.$waitScreen.changeCenterSubText(this.getLocale('wait_screen.submit_application'));

            if(this.newBuilding.feeCurrency == 'galt') {
                if(this.newBuilding.fee > this.user_galt_balance) {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.not_enough_galt.title'),
                        text: this.getLocale('error.not_enough_galt.description')
                    });
                    this.$waitScreen.hide();
                    return;
                }
                this.$waitScreen.changeCenterSubText(this.getLocale('wait_screen.approve_galt'));
                const approvePromise = this.$galtUser.approveGalt(this.$plotManagerContract.address, this.newBuilding.fee);

                approvePromise.catch(() => {
                    this.$waitScreen.hide();
                });

                await approvePromise;

                await this.$galtUser.waitForApproveGalt(this.$plotManagerContract.address, this.newBuilding.fee);
            }

            this.newBuilding.heights = this.newBuilding.contour.map(() => {return this.newBuilding.height});

            this.$galtUser.submitPlotManagerApplication(this.newBuilding).then(() => {
                this.$waitScreen.hide();
                this.newBuilding.ended = true;
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.submit_application.title'),
                    text: this.getLocale('success.submit_application.description')
                })
            }).catch((e) => {
                if(e) {
                    console.error(e);
                }
                this.$waitScreen.hide();
            })
        },

        onClearContour() {
            this.newBuilding = {
                contour: [],
                area: 0,
                creating: false,
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
            localeKey: 'add_building',
            explorerName: 'main',
            intervals: [],
            loading: true,
            ended: false,
            basePack: null,
            invalidFee: false,
            newBuilding: {
                id: null,
                contour: [],
                height: null,
                area: 0,
                level: null,
                ledgerIdentifier: "",
                creating: false,
                loading: false,
                valid: false,
                readyToSubmit: false,
                ended: false,
                fee: null,
                feeCurrency: null
            }
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        submitApplicationDisabled(){
            return !this.user_wallet || !this.newBuilding.ledgerIdentifier || this.newBuilding.contour.length < 3
                || this.newBuilding.loading || this.invalidFee || this.newBuilding.ended;
        }
    }
}
