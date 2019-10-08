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
import PriceAndCurrencyInput from "../../../../../../directives/PriceAndCurrencyInput/PriceAndCurrencyInput";
import * as _ from 'lodash';
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    template: require('./PlaceToEscrowModal.html'),
    props: ['spaceTokenId'],
    components: {
        ModalItem,
        PriceAndCurrencyInput,
        FeeInput
    },
    async created() {
        this.tokenIdToHex = EthData.tokenIdToHex(this.spaceTokenId);
    },
    methods: {
        async ok() {
            this.sending = true;

            this.warnText = this.getLocale('tip.sending');
            
            const feeBalance = await this.$galtUser.balance(this.order.feeCurrency);
            
            if(parseFloat(this.order.fee) > feeBalance) {
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.not_enough_balance.title'),
                    text: this.getLocale('error.not_enough_balance.description', {value: feeBalance, currency: this.order.feeCurrency.toUpperCase()})
                });
                this.sending = false;
                return;
            }

            if(this.order.feeCurrency == 'galt') {
                this.warnText = this.getLocale('tip.approve_galt');
                await this.$galtUser.approveGalt(this.$root.$plotEscrowContract.address, this.order.fee);

                await this.$galtUser.waitForApproveGalt(this.$root.$plotEscrowContract.address, this.order.fee);
            }
            
            this.warnText = this.getLocale('tip.sending');

            this.$galtUser.placePlotEscrowOrder({
                tokenId: this.spaceTokenId,
                documents: this.order.documents,
                fee: this.order.fee,
                feeCurrency: this.order.feeCurrency,
                price: this.order.price,
                priceCurrency: this.order.priceCurrency
            }).then(() => {
                this.$root.$asyncModal.close('place-to-escrow-modal');
                
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.send_order.title'),
                    text: this.getLocale('success.send_order.description')
                });
            }).catch((e) => {
                console.error(e);
                this.warnText = '';
                this.sending = false;

                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.send_order.title'),
                    text: this.getLocale('error.send_order.description')
                });
            });
        },
        cancel() {
            this.$root.$asyncModal.close('place-to-escrow-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        sendDisabled(){
            return this.sending || !this.order.price || !this.order.documents.length || this.order.documents.some((doc) => !doc) || this.invalidFee || this.invalidPrice;
        },
        priceLabel() {
            this.$store.state.locale;
            return this.getLocale('price');
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_territory.place_to_escrow_modal',
            tokenIdToHex: null,
            order: {
                price: [],
                documents: [],
                feeCurrency: null,
                fee: null
            },
            invalidFee: null,
            invalidPrice: null,
            warnText: null,
            sending: false
        }
    }
}
