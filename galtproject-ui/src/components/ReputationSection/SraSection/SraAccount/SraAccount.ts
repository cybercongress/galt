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

import SraAccountGeneralInfo from "./SraAccountGeneralInfo/SraAccountGeneralInfo";
import DelegatedByMembers from "./DelegatedByMembers/DelegatedByMembers";
import DelegationsMembers from "./DelegationsMembers/DelegationsMembers";
import GaltData from "../../../../services/galtData";
import SraAccountSpaceTokens from "./SraAccountSpaceTokens/SraAccountSpaceTokens";

export default {
    name: 'sra-account',
    template: require('./SraAccount.html'),
    components: { SraAccountGeneralInfo, DelegatedByMembers, DelegationsMembers, SraAccountSpaceTokens },
    created() {
        
    },
    mounted() {
        this.cutAccountAddress = GaltData.cutHex(this.$route.params.accountAddress);
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
            localeKey: 'reputation.sra_section.sra_account',
            intervals: [],
            cutAccountAddress: null
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
}
