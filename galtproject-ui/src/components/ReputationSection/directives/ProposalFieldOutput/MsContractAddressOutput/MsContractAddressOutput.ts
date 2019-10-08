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
import TokenContract from "@galtproject/frontend-core/components/GaltMultisig/contracts/TokenContract";
import GaltData from "../../../../../services/galtData";

export default {
    name: 'ms-contract-address-output',
    template: require('./MsContractAddressOutput.html'),
    props: ['value'],
    async created() {
        this.setCurrency();
    },
    watch: {
        value() {
            this.setCurrency();
        }
    },
    methods: {
        async setCurrency() {
            if(this.value === EthData.oneAddress) {
                this.currency = 'eth';
                this.currencyStr = 'ETH';
            } else {
                this.currency = 'erc20';
                try {
                    this.currencyContract = await EthData.initContract(TokenContract, this.value, GaltData.erc20Abi);
                    this.currencyStr = await this.currencyContract.getSymbol() || "[Unknown]";
                } catch (e) {
                    this.currencyStr = "[Unknown]";
                }
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
            localeKey: 'reputation.sra_section.proposal_fields.output.ms_contract_address',
            currency: null,
            currencyStr: null,
            contractAddress: ''
        }
    }
}
