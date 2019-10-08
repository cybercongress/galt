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

import * as _ from 'lodash';

export default {
    name: 'fund-rule-card',
    template: require('./FundRuleCard.html'),
    props: ['sraAddress', 'id'],
    async created() {
        
    },
    async mounted() {
        this.getFundRule();
    },
    watch: {
        async address() {
            this.getFundRule();
        },

        async sraAddress() {
            this.getFundRule();
        }
    },
    methods: {
        async getFundRule() {
            this.sra = null;

            const sra = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            await sra.fetchGeneralInfo();
            this.sra = sra;
            
            this.fundRule = await sra.storage.getFundRule(this.id);
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.fund_rule_info',
            loading: false,
            fundRule: null
        }
    }
}
