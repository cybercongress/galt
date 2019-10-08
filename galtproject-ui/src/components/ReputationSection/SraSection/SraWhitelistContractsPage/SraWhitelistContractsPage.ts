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

import ProposalManagerCard from "../../directives/ProposalManagerCard/ProposalManagerCard";

export default {
    name: 'sra-whitelist-contracts-page',
    template: require('./SraWhitelistContractsPage.html'),
    components: { ProposalManagerCard },
    async created() {
        
    },
    async mounted() {
        await this.getWhitelistContractsList();
    },
    methods: {
        async getWhitelistContractsList() {
            this.loading = true;
            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
            this.whitelistContracts = await this.sraContract.storage.getWhiteListedContracts();
            this.loading = false;
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
            localeKey: 'reputation.sra_section.whitelist_contracts_page',
            loading: true,
            whitelistContracts: []
        }
    }
}
