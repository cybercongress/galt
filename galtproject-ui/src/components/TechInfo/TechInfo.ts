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

import GaltData from "../../services/galtData";

const _ = require('lodash');

export default {
    name: 'tech-info',
    template: require('./TechInfo.html'),
    props: [],
    async created(){
        await this.$galtTokenContract.onReady();
        this.contractsConfig = GaltData.contractsConfig;
        this.loading = false;
    },
    beforeDestroy() {

    },
    methods: {
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        
    },

    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    
    data() {
        return {
            localeKey: 'tech_info',
            loading: true,
            contractsConfig: null
        }
    }
}
