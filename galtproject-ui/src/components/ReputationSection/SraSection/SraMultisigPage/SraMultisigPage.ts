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

import MultisigPage from "@galtproject/frontend-core/components/GaltMultisig/pages/MultisigPage/MultisigPage";

export default {
    name: 'sra-multisig-page',
    template: require('./SraMultisigPage.html'),
    components: {MultisigPage},
    async mounted() {
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
            localeKey: 'reputation.sra.overview_page',
            multisigAddress: null
        }
    }
}
