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

import {ModalItem} from '../../../../../directives/AsyncModal/index';
import FeeInput from "../../../../../directives/FeeInput/FeeInput";
import * as _ from 'lodash';

export default {
    template: require('./SubmitApplicationModal.html'),
    props: ['applicationId', 'contractType'],
    components: {
        ModalItem,
        FeeInput
    },
    async created() {
        const contract = this.$contracts['$' + this.contractType];
        this.application = await contract.getApplicationById(this.applicationId);
        
        // if(this.application.statusName == 'new' && contract.getNeedEthForSubmit) {
        //     this.application.needEthForSubmit = await contract.getNeedEthForSubmit(this.applicationId);
        // }
    },
    methods: {
        async ok() {
            this.sending = true;

            this.warnText = this.getLocale('tip.sending');

            if(this.application.feeCurrency == 'galt' && this.application.fee > 0) {
                if(this.application.fee > this.user_galt_balance) {
                    this.$notify({
                        type: 'error',
                        title: this.getLocale('error.not_enough_galt.title'),
                        text: this.getLocale('error.not_enough_galt.description')
                    });
                    this.warnText = '';
                    this.sending = false;
                    return;
                }
                
                this.warnText = this.getLocale('tip.approve_galt');
                await this.$galtUser.approveGalt(this.$plotCustodianContract.address, this.application.fee);

                await this.$galtUser.waitForApproveGalt(this.$plotCustodianContract.address, this.application.fee);
            }
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.submitPlotManagerApplication(this.application).then(() => {
                this.$root.$asyncModal.close('submit-application-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.send_application.title'),
                    text: this.getLocale('success.send_application.description')
                });
            }).catch((e) => {
                console.error(e);
                this.warnText = '';
                this.sending = false;

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.send_application.title'),
                    text: this.getLocale('error.send_application.description')
                });
            });
        },
        cancel() {
            this.$root.$asyncModal.close('submit-application-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            return this.sending || this.invalidFee;
        },
        user_galt_balance() {
            return this.$store.state.user_galt_balance;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_applications.submit_application_modal',
            tokenIdToHex: null,
            application: null,
            custodians: [],
            invalidFee: null,
            actionTypes: [],
            warnText: null,
            sending: false
        }
    }
}
