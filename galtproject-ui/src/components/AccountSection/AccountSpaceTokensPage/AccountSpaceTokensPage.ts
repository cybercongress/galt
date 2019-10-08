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

import SpaceTokenCard from "../../../directives/SpaceTokenCard/SpaceTokenCard";

import * as _ from 'lodash';

export default {
    name: 'account-space-tokens-page',
    template: require('./AccountSpaceTokensPage.html'),
    components: {Explorer, SpaceTokenCard},
    async created() {
        this.throttleDrawSpaceTokens = _.throttle(() => {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, this.spaceTokens);
        }, 1000);
    },
    async mounted() {
        await this.getSpaceTokensList();
    },
    methods: {
        async getSpaceTokensList() {
            this.loading = true;
            this.spaceTokens = await this.$galtUser.getSpaceTokens();
            this.loading = false;
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        spaceTokens(){
            this.throttleDrawSpaceTokens();
        }
    },
    computed: {
        
    },
    data() {
        return {
            localeKey: 'user_account.space_tokens',
            loading: true,
            spaceTokens: []
        }
    }
}
