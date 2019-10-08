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

import {ModalItem} from '../../../../../../directives/AsyncModal/index';

export default {
    template: require('./ProposeNewMultisigManagersModal.html'),
    props: ['sraAddress', 'multisigManagers', 'required'],
    components: {
        ModalItem
    },
    async created() {
        this.loading = true;
        this.sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
        this.newRequired = this.required;
        
        this.loading = false;
    },
    methods: {
        async propose() {
            this.sending = true;
            
            const managerAddress = await this.sra.storage.getFirstContractAddressByType('change_ms_owners');
            
            this.$galtUser.sraNewAbstractProposal(this.sraAddress, managerAddress, {
                newOwners: this.multisigManagers,
                required: this.newRequired,
                description: this.description
            })
                .then(() => {
                    this.sending = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.propose.title"),
                        text: this.getLocale("success.propose.description")
                    });
                    this.$root.$asyncModal.close('propose-new-multisig-managers-modal');
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.propose.title"),
                        text: this.getLocale("error.propose.description", {error: e.message || e})
                    });
                    this.sending = false;
                })
        },
        
        cancel() {
            this.$root.$asyncModal.close('propose-new-multisig-managers-modal');
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    watch: {
        
    },
    computed: {
        isInputsInvalid() {
            return !parseInt(this.newRequired) || !this.description;
        },
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data: function () {
        return {
            localeKey: 'reputation.sra_section.multisig_managers_page.propose_new_multisig_managers_modal',
            loading: true,
            sending: false,
            sra: null,
            newRequired: null,
            description: null
        }
    }
}
