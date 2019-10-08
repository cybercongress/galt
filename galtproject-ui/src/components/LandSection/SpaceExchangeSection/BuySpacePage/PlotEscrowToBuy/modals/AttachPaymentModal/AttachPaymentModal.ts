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

import {ModalItem} from '../../../../../../../directives/AsyncModal/index'
import GaltData from "../../../../../../../services/galtData";
import * as _ from 'lodash';

export default {
    template: require('./AttachPaymentModal.html'),
    props: ['orderId'],
    components: {
        ModalItem
    },
    async created() {
        this.order = await this.$root.$plotEscrowContract.getOrderById(this.orderId);
        this.tokenId = this.order.spaceTokenId;
        this.erc20Address = this.order.tokenContract;
        //TODO: user friendly currency
        this.price = this.order.buyer.ask;
        
        this.loading = false;
        
        if(this.erc20Address) {
            this.getTokenApproved();
        }
    },
    methods: {
        async getTokenApproved() {
            this.approved = (await this.$galtUser.getErc20Allowance(this.erc20Address, this.$root.$plotEscrowContract.address)) >= this.price;
        },
        approve() {
            this.approving = true;

            this.$galtUser.approveErc20(this.erc20Address, this.$root.$plotEscrowContract.address, this.price)
                .then(() => {
                    this.approved = true;
                    this.approving = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.approve.title"),
                        text: this.getLocale("success.approve.description")
                    });
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.approve.title"),
                        text: this.getLocale("error.approve.description")
                    });
                    this.approving = false;
                })
        },
        ok() {
            this.sending = true;
            
            this.$galtUser.attachPaymentToPlotEscrow(this.order)
                .then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.attach.title"),
                        text: this.getLocale("success.attach.description")
                    });
                    this.$root.$asyncModal.close('attach-payment-modal', this.tokenId);
                })
                .catch((e) => {
                    console.error(e);
                    
                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.attach.title"),
                        text: this.getLocale("error.attach.description")
                    });
                    this.sending = false;
                })
        },
        cancel() {
            this.$root.$asyncModal.close('attach-payment-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        approvedDisabled(){
            return this.approved || this.approving || this.loading;
        },
        sendDisabled(){
            return (this.erc20Address && !this.approved) || this.sending || this.loading;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'plot_escrow.buy.attach_payment_modal',
            loading: true,
            tokenId: null,
            erc20Address: null,
            price: null,
            approved: false,
            approving: false,
            sending: false
        }
    }
}
