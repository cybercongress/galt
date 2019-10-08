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

import OracleStakes from "../directives/OracleStakes/OracleStakes";
import GaltData from "../../../services/galtData";
import CustodianSpaceTokens from "../directives/CustodianSpaceTokens/CustodianSpaceTokens";
import OracleDescription from "../directives/OracleDescription/OracleDescription";

export default {
    name: 'account-oracle-page',
    template: require('./AccountOraclePage.html'),
    components: {OracleStakes, CustodianSpaceTokens, OracleDescription},
    created() {

    },
    async mounted() {
        this.oracle = await GaltData.getOracle(this.$route.params.userAddress);
    },
    beforeDestroy() {
        
    },
    methods: {
        
    },
    watch: {
        
    },
    data() {
        return {
            localeKey: 'user_account.oracle',
            oracle: null,
            intervals: []
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
}
