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
import GaltData from "../../../../../services/galtData";
import * as _ from 'lodash';

export default {
    template: require('./CreateClaimManagerApplicationModal.html'),
    props: [],
    components: {
        ModalItem,
        FeeInput
    },
    async created() {
        this.multisigList = await GaltData.getMulstiSigList();
        
        this.application = {
            beneficiary: this.user_wallet,
            amount: 0,
            multisigAddress: '',
            documents: [],
            fee: null,
            feeCurrency: null
        };
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
                await this.$galtUser.approveGalt(this.$claimManagerContract.address, this.application.fee);

                await this.$galtUser.waitForApproveGalt(this.$claimManagerContract.address, this.application.fee);
            }
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.createClaimManagerApplication(this.application).then(() => {
                this.$root.$asyncModal.close('create-claim-manager-application-modal');
                
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
            this.$root.$asyncModal.close('create-claim-manager-application-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            return this.sending || this.invalidFee || !this.application || !this.application.amount || !this.application.beneficiary || !this.application.multisigAddress || this.application.documents.filter(doc => doc).length < 1;
        },
        user_galt_balance() {
            return this.$store.state.user_galt_balance;
        },
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_applications.create_claim_manager_application_modal',
            multisigList: [],
            application: null,
            invalidFee: null,
            warnText: null,
            sending: false
        }
    }
}
