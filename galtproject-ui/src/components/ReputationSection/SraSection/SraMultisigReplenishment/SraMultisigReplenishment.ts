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

import FeeContractCard from "./FeeContractCard/FeeContractCard";
import TariffPayingControl from "./TariffPayingControl/TariffPayingControl";

export default {
    name: 'sra-multisig-replenishment',
    template: require('./SraMultisigReplenishment.html'),
    components: { FeeContractCard, TariffPayingControl },
    async created() {
    },
    async mounted() {
        this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        await this.getFeeContractsList();
        await this.getFeeProposalsList();
    },
    methods: {
        async getFeeContractsList() {
            this.loadingActual = true;
            this.feeContracts = await this.sraContract.storage.getFeeContractsList();
            this.loadingActual = false;
        },
        async getFeeProposalsList() {
            this.loadingProposals = true;
            this.proposals = await this.sraContract.storage.getFeeProposalsList();
            this.loadingProposals = false;
        },

        setActiveTab(tab) {
            this.activeTab = tab;
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        
    },
    computed: {
        
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.multisig_replenishment',
            loadingActual: true,
            loadingProposals: true,
            activeTab: 'regular',
            feeContracts: [],
            proposals: [],
            itemLoading: {}
        }
    }
}
