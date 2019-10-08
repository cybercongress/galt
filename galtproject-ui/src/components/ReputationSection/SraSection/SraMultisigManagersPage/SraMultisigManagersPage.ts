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

import MultisigManagersInput from "../../directives/ProposalFieldInput/MultisigManagersInput/MultisigManagersInput";
import ProposeNewMultisigManagersModal from "./modals/ProposeNewMultisigManagersModal/ProposeNewMultisigManagersModal";
import FundWithdrawalLimits from "../../directives/FundWithdrawalLimits/FundWithdrawalLimits";

const _ = require('lodash');

export default {
    name: 'sra-multisig-managers-page',
    template: require('./SraMultisigManagersPage.html'),
    components: {MultisigManagersInput, FundWithdrawalLimits},
    async mounted() {
        this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        this.changeMsManagersManager = await this.sraContract.storage.getFirstContractAddressByType('change_ms_owners');

        const multisigContract = await this.sraContract.storage.getMultiSigContract();
        this.currentManagers = await multisigContract.getOwners();
        this.required = await multisigContract.required();
        this.baseManagers = _.clone(this.currentManagers);
        this.loading = false;
    },
    methods: {
        async proposeNewManagers() {

            this.$root.$asyncModal.open({
                id: 'propose-new-multisig-managers-modal',
                component: ProposeNewMultisigManagersModal,
                props: {
                    'sraAddress': this.$route.params.sraAddress,
                    'multisigManagers': this.currentManagers,
                    'required': this.required
                }
            });
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        
    },
    computed: {
        changed() {
            return !this.loading && !_.isEqual(_.sortBy(this.baseManagers), _.sortBy(this.currentManagers));
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.multisig_managers_page',
            loading: true,
            baseManagers: null,
            currentManagers: null,
            required: null,
            changeMsManagersManager: null
        }
    }
}
