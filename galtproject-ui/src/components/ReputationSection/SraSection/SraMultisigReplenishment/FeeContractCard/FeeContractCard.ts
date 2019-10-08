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

import GaltData from "../../../../../services/galtData";
import TariffPayingControl from "../TariffPayingControl/TariffPayingControl";

const pIteration = require('p-iteration');

export default {
    name: 'fee-contract-card',
    template: require('./FeeContractCard.html'),
    props: ['sraAddress', 'feeContractAddress'],
    components: {TariffPayingControl},
    async mounted() {
        this.getInfo();
    },
    watch: {
        sraAddress() {
            this.getInfo();
        },
        feeContractAddress() {
            this.getInfo();
        }
    },
    methods: {
        async getInfo() {
            this.loading = true;

            this.item = await this.$fundsRegistryContract.getFeeContract(this.feeContractAddress);
            
            this.loading = false;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.tariff_card',
            item: null,
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
