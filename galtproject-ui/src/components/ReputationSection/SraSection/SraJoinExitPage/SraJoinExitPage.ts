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

import SpaceLockerCard from "../../directives/SpaceLockerCard/SpaceLockerCard";
import Explorer from "../../../Explorer/Explorer";

export default {
    name: 'sra-join-exit-page',
    template: require('./SraJoinExitPage.html'),
    components: {SpaceLockerCard, Explorer},
    async mounted() {
        await this.getSpaceLockers();

        this.$store.watch((state) => state.user_wallet, () => this.getSpaceLockers());
    },
    methods: {
        async getSpaceLockers() {
            if(!this.user_wallet) {
                return;
            }
            this.loading = true;
            this.spaceLockers = await this.$slrContract.getSpaceLockersAddressesByOwner(this.user_wallet);
            this.loading = false;
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.join_exit_page',
            spaceLockers: [],
            loading: true,
        }
    }
}
