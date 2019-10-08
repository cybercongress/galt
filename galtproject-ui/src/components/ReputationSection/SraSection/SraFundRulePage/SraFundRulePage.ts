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

import FundRuleCard from "../../directives/FundRuleCard/FundRuleCard";
import ProposalVotingMembers from "../../directives/ProposalVotingMembers/ProposalVotingMembers";

export default {
    name: 'sra-fund-rule-page',
    template: require('./SraFundRulePage.html'),
    components: { FundRuleCard, ProposalVotingMembers },
    async created() {
        
    },
    async mounted() {
        this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        this.managerAddress = await this.sraContract.storage.getFirstContractAddressByType('add_rule');
    },
    methods: {
        
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
            localeKey: 'reputation.sra_section.fund_rule_page',
            managerAddress: null,
            loading: true
        }
    }
}
