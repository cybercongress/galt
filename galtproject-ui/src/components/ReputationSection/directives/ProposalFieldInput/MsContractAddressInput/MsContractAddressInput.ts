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
    name: 'ms-contract-address-input',
    template: require('./MsContractAddressInput.html'),
    props: ['value'],
    async created() {
        this.setValue();
    },
    watch: {
        currency() {
            this.setValue();
        },
        contractAddress() {
            this.setValue();
        }
    },
    methods: {
        async setValue() {
            if(this.currency === 'eth') {
                this.$emit('input', EthData.oneAddress);
                this.$emit('change', EthData.oneAddress);
            } else {
                this.$emit('input', this.contractAddress);
                this.$emit('change', this.contractAddress);
            }
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.proposal_fields.input.ms_contract_address',
            currency: 'eth',
            contractAddress: ''
        }
    }
}
