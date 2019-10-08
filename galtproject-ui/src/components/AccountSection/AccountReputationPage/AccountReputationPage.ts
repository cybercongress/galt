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

import AccountSpaceLockers from "../../ReputationSection/directives/AccountSpaceLockers/AccountSpaceLockers";
import AccountSras from "../../ReputationSection/directives/AccountSras/AccountSras";

export default {
    name: 'account-reputation-page',
    template: require('./AccountReputationPage.html'),
    components: {AccountSras, AccountSpaceLockers},
    created() {

    },
    mounted() {
        
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    methods: {
        
    },
    watch: {
        
    },
    data() {
        return {
            localeKey: 'user_account.reputation',
            intervals: []
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
}
