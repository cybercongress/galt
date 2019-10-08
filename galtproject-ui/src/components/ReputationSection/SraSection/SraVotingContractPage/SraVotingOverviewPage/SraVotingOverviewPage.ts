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

import ProposalManagerCard from "../../../directives/ProposalManagerCard/ProposalManagerCard";

export default {
    name: 'sra-voting-overview-page',
    template: require('./SraVotingOverviewPage.html'),
    components: { ProposalManagerCard },
    async created() {
        
    },
    async mounted() {

    },
    methods: {
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.voting_contract_page.overview',
            loading: true,
            sra: null,
            isSraMember: null,
            proposalsList: [],
            proposalsCount: null
        }
    }
}
