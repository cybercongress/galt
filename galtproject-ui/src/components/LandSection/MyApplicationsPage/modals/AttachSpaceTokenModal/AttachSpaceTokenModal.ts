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

import {ModalItem} from '../../../../../directives/AsyncModal/index'
import GaltData from "../../../../../services/galtData";
import * as _ from 'lodash';

export default {
    template: require('./AttachSpaceTokenModal.html'),
    props: ['tokenId','applicationId','contractName','methodName','withoutApprove'],
    components: {
        ModalItem
    },
    created() {
        this.contract = this.$root['$' + this.contractName + 'Contract'];
        this.getTokenApproved();
    },
    methods: {
        async getTokenApproved() {
            this.approved = await this.$galtUser.isApprovedSpace(this.contract.address, this.tokenId);
        },
        approve() {
            this.approving = true;

            this.$galtUser.approveSpace(this.contract.address, this.tokenId)
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
            this.attaching = true;
            
            this.$galtUser.attachSpaceToken(this.contractName, {applicationId: this.applicationId, tokenId: this.tokenId})
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
                    this.attaching = false;
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
            return this.approved || this.approving;
        },
        attachDisabled(){
            return (!this.withoutApprove && !this.approved) || this.attaching;
        }
    },
    watch: {},
    data: function () {
        return {
            localeKey: 'my_applications.attach_space_token_modal',
            price: null,
            approved: false,
            approving: false,
            attaching: false
        }
    }
}
