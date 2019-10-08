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
    template: require('./AddDelegationModal.html'),
    props: ['sraAddress', 'ownerAddress'],
    components: {
        ModalItem
    },
    async created() {
        // TODO: handle passed ownerAddress
        // this.delegateFromOwner = this.ownerAddress;
        this.loading = true;
        this.sra = null;

        const sra = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        await sra.fetchGeneralInfo();
        this.sra = sra;
        this.getDelegatedBy();

        this.loading = false;
    },
    methods: {
        delegate() {
            this.sending = true;

            this.$galtUser.sraDelegateReputation(this.sraAddress, this.delegateFromOwner.address, this.toAddress, this.delegateAmount)
                .then(() => {
                    this.sending = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.create.title"),
                        text: this.getLocale("success.create.description")
                    });
                    this.$root.$asyncModal.close('add-delegation-modal');
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
        async getDelegatedBy() {
            if(!this.sra) {
                return;
            }
            
            const delegatedByAddresses = await this.sra.getDelegatedBy(this.user_wallet);
            delegatedByAddresses.unshift(this.user_wallet);
            
            this.delegatedByList = await pIteration.map(delegatedByAddresses, async (address) => {
                const obj = {
                    address,
                    delegatedBalance: await this.sra.getDelegatedBalanceOf(address, this.user_wallet),
                    delegatedBalanceStr: null,
                    'toLowerCase': () => address.toLowerCase(),
                    'toString': () => address
                };

                obj.delegatedBalanceStr = GaltData.beautyNumber(obj.delegatedBalance);
                
                return obj;
            })
        },
        
        cancel() {
            this.$root.$asyncModal.close('add-delegation-modal');
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
            return !this.delegateFromOwner || !this.toAddress || !parseFloat(this.delegateAmount) || this.tooMuchAmount;
        },
        tooMuchAmount() {
            return this.delegateFromOwner && this.delegateFromOwner.delegatedBalance < parseFloat(this.delegateAmount);
        },
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data: function () {
        return {
            localeKey: 'reputation.sra_section.sra_account.delegation_members.add_delegation_modal',
            loading: true,
            sending: false,
            sra: null,
            delegatedByList: [],
            delegateFromOwner: null,
            toAddress: null,
            delegateAmount: null,
            invalidTo: false
        }
    }
}
