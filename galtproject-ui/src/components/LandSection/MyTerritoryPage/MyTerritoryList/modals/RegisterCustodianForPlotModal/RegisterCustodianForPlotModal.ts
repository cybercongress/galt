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

import {ModalItem} from '../../../../../../directives/AsyncModal/index'
import GaltData from "../../../../../../services/galtData";
import FeeInput from "../../../../../../directives/FeeInput/FeeInput";
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    template: require('./RegisterCustodianForPlotModal.html'),
    props: ['spaceTokenId'],
    components: {
        ModalItem,
        FeeInput
    },
    async created() {
        this.tokenIdToHex = EthData.tokenIdToHex(this.spaceTokenId);
        //TODO: make multisig selector
        this.application.multiSig = GaltData.contractsConfig.arbitratorsMultiSigXAddress;
        
        this.actionTypes = await this.$locale.setTitlesByNamesInList(this.$plotCustodianContract.actionTypes, 'plot_custodian.action_types.');
        
        this.getCustodians();
    },
    methods: {
        getCustodians(){
            this.custodians = this.$galtUser.getCustodians();
            this.custodians.then((custodians) => {
                console.log('custodians', custodians);
            })
        },

        addCustodian() {
            this.application.custodians.push('');
        },
        removeCustodian(custodianIndex) {
            this.application.custodians.splice(custodianIndex, 1);
        },
        
        async ok() {
            this.sending = true;

            this.warnText = this.getLocale('tip.sending');

            if(this.application.feeCurrency == 'galt') {
                if(this.application.fee > this.user_galt_balance) {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.not_enough_galt.title'),
                        text: this.getLocale('error.not_enough_galt.description')
                    });
                    this.warnText = '';
                    return;
                }
                
                this.warnText = this.getLocale('tip.approve_galt');
                await this.$galtUser.approveGalt(this.$plotCustodianContract.address, this.application.fee);

                await this.$galtUser.waitForApproveGalt(this.$plotCustodianContract.address, this.application.fee);
            }
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.applyForPlotCustodian({
                multiSig: this.application.multiSig,
                tokenId: this.spaceTokenId,
                custodians: this.application.custodians.map(c => c.address),
                action: this.application.action,
                fee: this.application.fee,
                feeCurrency: this.application.feeCurrency
            }).then(() => {
                this.$root.$asyncModal.close('register-custodian-for-plot-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.send_application.title'),
                    text: this.getLocale('success.send_application.description')
                });
            }).catch((e) => {
                this.sending = false;
                console.error(e);
                this.warnText = '';

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.send_application.title'),
                    text: this.getLocale('error.send_application.description')
                });
            });
        },
        cancel() {
            this.$root.$asyncModal.close('register-custodian-for-plot-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            return this.sending || !this.application.custodians.filter(custodian => custodian).length || !this.application.action || this.invalidFee;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_territory.register_custodian_for_plot_modal',
            tokenIdToHex: null,
            application: {
                multiSig: null,
                custodians: [''],
                action: "attach",
                feeCurrency: null,
                fee: null
            },
            custodians: [],
            invalidFee: null,
            actionTypes: [],
            warnText: null,
            sending: false
        }
    }
}
