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

import GaltData from "../../../../services/galtData";
import FundRuleCard from "../../directives/FundRuleCard/FundRuleCard";

import * as _ from 'lodash';
const pIteration = require('p-iteration');

export default {
    name: 'sra-fund-rules-list-page',
    template: require('./SraFundRulesListPage.html'),
    components: { FundRuleCard },
    async created() {
        
    },
    async mounted() {
        await this.getFundRulesList();
    },
    methods: {
        async getFundRulesList() {
            this.loading = true;
            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
            this.fundRules = await this.sraContract.storage.getActiveFundRules();
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
            localeKey: 'reputation.sra_section.fund_rules_list_page',
            loading: true,
            fundRules: []
        }
    }
}
