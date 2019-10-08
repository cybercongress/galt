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
    template: require('./ValuatePlotModal.html'),
    props: ['spaceTokenId'],
    components: {
        ModalItem,
        FeeInput
    },
    async created() {
        this.tokenIdToHex = EthData.tokenIdToHex(this.spaceTokenId);
    },
    methods: {
        async ok() {
            this.sending = true;

            this.warnText = this.getLocale('tip.sending');

            if(this.application.feeCurrency == 'galt') {
                this.warnText = this.getLocale('tip.approve_galt');
                await this.$galtUser.approveGalt(this.$plotValuationContract.address, this.application.fee);

                await this.$galtUser.waitForApproveGalt(this.$plotValuationContract.address, this.application.fee);
            }
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.applyForPlotValuation({
                tokenId: this.spaceTokenId,
                documents: this.application.documents,
                fee: this.application.fee,
                feeCurrency: this.application.feeCurrency
            }).then(() => {
                this.$root.$asyncModal.close('valuate-plot-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.send_application.title'),
                    text: this.getLocale('success.send_application.description')
                });
            }).catch((e) => {
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
            this.$root.$asyncModal.close('valuate-plot-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            return this.sending || !this.application.documents.length || this.application.documents.some((doc) => !doc) || this.invalidFee;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_territory.valuate_plot_modal',
            tokenIdToHex: null,
            application: {
                documents: [],
                feeCurrency: null,
                fee: null
            },
            invalidFee: null,
            applicationRoles: [],
            warnText: null,
            sending: false
        }
    }
}
