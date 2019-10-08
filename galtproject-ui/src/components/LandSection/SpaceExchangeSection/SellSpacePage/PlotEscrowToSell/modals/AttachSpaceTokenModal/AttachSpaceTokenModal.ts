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
    template: require('./AttachSpaceTokenModal.html'),
    props: ['orderId'],
    components: {
        ModalItem
    },
    async created() {
        const order = await this.$root.$plotEscrowContract.getOrderById(this.orderId);
        this.tokenId = order.spaceTokenId;
        this.buyer = order.buyer.address;
        
        this.loading = false;
        
        this.getTokenApproved();
    },
    methods: {
        async getTokenApproved() {
            this.approved = await this.$galtUser.isApprovedSpace(this.$root.$plotEscrowContract.address, this.tokenId);
        },
        approve() {
            this.approving = true;
            this.loading = true;

            this.$galtUser.approveSpace(this.$root.$plotEscrowContract.address, this.tokenId)
                .then(() => {
                    this.approved = true;
                    this.approving = false;
                    this.loading = false;
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
                    this.loading = false;
                })
        },
        ok() {
            this.sending = true;
            this.loading = true;
            
            this.$galtUser.attachSpaceTokenToPlotEscrow(this.orderId, this.buyer)
                .then(() => {
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.attach.title"),
                        text: this.getLocale("success.attach.description")
                    });
                    this.$root.$asyncModal.close('attach-space-token-modal', this.tokenId);
                })
                .catch((e) => {
                    console.error(e);
                    
                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.attach.title"),
                        text: this.getLocale("error.attach.description")
                    });
                    this.loading = false;
                    this.sending = false;
                })
        },
        cancel() {
            this.$root.$asyncModal.close('attach-space-token-modal');
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
            return !this.approved || this.sending || this.loading;
        },
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'plot_escrow.sell.attach_space_token_modal',
            tokenId: null,
            loading: true,
            buyer: null,
            approved: false,
            approving: false,
            sending: false
        }
    }
}
