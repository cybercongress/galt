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

import ContourInput from "../../../directives/ContourInput/ContourInput";
import FeeInput from "../../../directives/FeeInput/FeeInput";

import {
    EventBus,
    EXPLORER_DRAW_AREA, 
    GetEventName,
} from '../../../services/events';

import SpecifyCredentialsModal from "./modals/SpecifyCredentialsModal/SpecifyCredentialsModal";
import Explorer from "../../Explorer/Explorer";
import SpaceGeoDataInputs from "../../../directives/SpaceGeoDataInputs/SpaceGeoDataInputs";
import GaltData from "../../../services/galtData";
const galtUtils = require('@galtproject/utils');
const _ = require('lodash');

export default {
    name: 'new-application-page',
    template: require('./NewApplicationPage.html'),
    components: { Explorer, ContourInput, FeeInput, SpaceGeoDataInputs },
    async created() {
        await this.$plotManagerContract.onReady();
        //TODO: make multisig selector
        this.newApplication.multiSig = GaltData.contractsConfig.arbitratorsMultiSigXAddress;
    },
    async mounted() {
        
    },

    methods: {
        async sendApplication() {
            this.newApplication.loading = true;

            this.$root.$asyncModal.open({
                id: 'specify-credentials-modal',
                component: SpecifyCredentialsModal,
                props: {
                    
                },
                onClose: (userData) => {
                    if(!userData) {
                        this.newApplication.loading = false;
                        return;
                    }

                    // this.newApplication.country = userData.country;
                    this.newApplication.credentialsHash = this.$plotManagerContract.generateCredentialsHash(userData.fullName, userData.documentId);

                    this.submitApplication();
                }
            });
        },

        async submitApplication() {
            this.$waitScreen.show();
            this.$waitScreen.changeCenterSubText(this.getLocale('wait_screen.submit_application'));

            if(this.newApplication.feeCurrency == 'galt') {
                if(this.newApplication.fee > this.user_galt_balance) {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.not_enough_galt.title'),
                        text: this.getLocale('error.not_enough_galt.description')
                    });
                    this.$waitScreen.hide();
                    return;
                }
                this.$waitScreen.changeCenterSubText(this.getLocale('wait_screen.approve_galt'));
                const approvePromise = this.$galtUser.approveGalt(this.$plotManagerContract.address, this.newApplication.fee);

                approvePromise.catch(() => {
                    this.$waitScreen.hide();
                });
                
                await approvePromise;

                await this.$galtUser.waitForApproveGalt(this.$plotManagerContract.address, this.newApplication.fee);
            }
            
            this.$galtUser.submitPlotManagerApplication(this.newApplication).then((res) => {
                console.log('NewApplicationPage.txHash', res.hash);
                console.log('NewApplicationPage.receipt.logs', res.receipt.logs);
                const NewApplicationEvent = this.$plotManagerContract.parseEvent('LogNewApplication', res.receipt);
                console.log('NewApplicationPage.NewApplicationEvent', NewApplicationEvent);
                
                this.$waitScreen.hide();
                this.ended = true;
                this.loading = false;
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.submit_application.title'),
                    text: this.getLocale('success.submit_application.description')
                })
            }).catch((e) => {
                this.loading = false;
                if(e) {
                    console.error(e);
                }
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.send_application.title'),
                    text: this.getLocale('error.send_application.description')
                });
                this.$waitScreen.hide();
            })
        },
        
        onContourChange() {
            this.setAreaStr();
        },
        
        setAreaStr() {
            if(_.includes(this.newApplication.type, 'predefined')) {
                this.newApplication.areaStr = GaltData.beautyNumber(this.newApplication.customArea);
            } else {
                this.newApplication.areaStr = GaltData.beautyNumber(galtUtils.geohash.contour.area(this.newApplication.contour));
            }
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
            localeKey: "new_application",
            explorerName: 'main',
            ended: false,
            loading: false,
            newApplication: {
                id: null,
                type: "plot",
                multiSig: '',
                ledgerIdentifier: "",
                description: "",
                additionalDescription: {},
                credentialsHash: "",
                contour: [],
                heights: [],
                feeCurrency: null,
                fee: null,
                area: 0,
                areaStr: null,
                level: 0,
                customArea: 0
            },
            invalidInputs: false,
            invalidFee: false
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        user_galt_balance() {
            return this.$store.state.user_galt_balance;
        },
        pm_user_applications_ids() {
            return this.$store.state.pm_user_applications_ids;
        }
    },
}
