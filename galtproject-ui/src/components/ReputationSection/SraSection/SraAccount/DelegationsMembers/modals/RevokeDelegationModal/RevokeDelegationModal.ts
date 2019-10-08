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

import {ModalItem} from '../../../../../../../directives/AsyncModal/index';
import GaltData from "../../../../../../../services/galtData";

import * as _ from 'lodash';
const pIteration = require('p-iteration');

export default {
    template: require('./RevokeDelegationModal.html'),
    props: ['sraAddress', 'delegatedAddress'],
    components: {
        ModalItem
    },
    async created() {
        this.loading = true;
        this.sra = null;

        const sra = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        await sra.fetchGeneralInfo();
        this.sra = sra;
        
        this.delegatedBalance = await this.sra.getDelegatedBalanceOf( this.user_wallet, this.delegatedAddress);
        this.delegatedBalanceStr = GaltData.beautyNumber(this.delegatedBalance);

        this.loading = false;
    },
    methods: {
        revoke() {
            this.sending = true;

            this.$galtUser.sraRevokeReputation(this.sraAddress, this.delegatedAddress, this.revokeAmount)
                .then(() => {
                    this.sending = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.create.title"),
                        text: this.getLocale("success.create.description")
                    });
                    this.$root.$asyncModal.close('revoke-delegation-modal');
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.create.title"),
                        text: this.getLocale("error.create.description")
                    });
                    this.sending = false;
                })
        },
        
        cancel() {
            this.$root.$asyncModal.close('revoke-delegation-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    watch: {
        async toAddress() {
            this.invalidTo = !(await this.sra.getSpaceTokensByOwnerCount(this.toAddress));
        }
    },
    computed: {
        isInputsInvalid() {
            return !parseFloat(this.revokeAmount) || this.tooMuchAmount;
        },
        tooMuchAmount() {
            return this.delegatedBalance && this.delegatedBalance < parseFloat(this.revokeAmount);
        },
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data: function () {
        return {
            localeKey: 'reputation.sra_section.sra_account.delegation_members.revoke_delegation_modal',
            loading: true,
            sending: false,
            sra: null,
            delegatedBalance: null,
            delegatedBalanceStr: null,
            revokeAmount: null
        }
    }
}
