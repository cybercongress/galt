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

import Explorer from "../../Explorer/Explorer";
import {EventBus, EXPLORER_DRAW_SPACE_TOKEN, EXPLORER_DRAW_SPACE_TOKENS_LIST} from "../../../services/events";

import SraCard from "../directives/SraCard/SraCard";

const pIteration = require('p-iteration');
import * as _ from 'lodash';

export default {
    name: 'space-locker-page',
    template: require('./SrasRegistryPage.html'),
    components: {Explorer, SraCard},
    async mounted() {
        this.getSras();
        
    },
    methods: {
        async getSras(){
            this.loading = true;
            this.srasAddresses = _.reverse(await this.$fundsRegistryContract.getFundsList());
            this.loading = false;
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        
    },
    data() {
        return {
            localeKey: 'reputation.sras_registry',
            loading: true,
            srasAddresses: [],
            currentSraSpaceTokens: [],
            loadingSpaceTokensFor: null
        }
    }
}
