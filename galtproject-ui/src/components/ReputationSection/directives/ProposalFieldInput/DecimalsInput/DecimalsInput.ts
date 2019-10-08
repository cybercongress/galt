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

import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'decimals-input',
    template: require('./DecimalsInput.html'),
    props: ['value', 'placeholder'],
    async created() {
        
    },
    watch: {
        localValue() {
            this.setValue();
        },
        decimals() {
            this.setValue();
        }
    },
    methods: {
        async setValue() {
            this.$emit('input', EthData.etherToDecimals(this.localValue, this.decimals));
            this.$emit('change', EthData.etherToDecimals(this.localValue, this.decimals));
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.proposal_fields.input.decimals',
            localValue: '',
            decimals: 18
        }
    }
}
