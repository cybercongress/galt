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

import * as _ from 'lodash';

export default {
    name: 'account-section',
    template: require('./AccountSection.html'),
    async mounted() {
        this.cutAccountAddress = GaltData.cutHex(this.$route.params.userAddress);
        // this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);

        if(this.$locale.loaded) {
            this.setTabsTitle();
        } else {
            this.onLoadId = this.$locale.onLoad(this.setTabsTitle);
        }
        // this.setUserMemberOfSra();
    },
    methods: {
        setTabsTitle() {
            this.tabs.forEach((tab) => {
                tab.title = this.$locale.get(this.localeKey + '.tabs.' + tab.locale);
            });
        },
        // async setUserMemberOfSra() {
        //     this.userMemberOfSra = this.sraContract && this.user_wallet && (await this.sraContract.getSpaceTokensByOwnerCount(this.user_wallet)) > 0;
        // }
    },
    watch: {
        user_wallet() {
            // this.setUserMemberOfSra();
        },
        // sraContract() {
        //     this.setUserMemberOfSra();
        // }
    },
    computed: {
        visibleTabs() {
            return this.tabs.filter((tab) => {
                tab.title = this.$locale.get(this.localeKey + '.tabs.' + tab.locale);

                if(!tab.onlyFor) {
                    return true;
                }

                if(_.includes(tab.onlyFor, 'oracle')) {
                    return true;
                }
                
                return false;
            });
        },
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    },
    beforeDestroy() {
        this.$locale.unbindOnLoad(this.onLoadId);
    },
    data() {
        return {
            localeKey: 'user_account',
            sraContract: null,
            userMemberOfSra: false,
            cutAccountAddress: '',
            tabs: [{
                route: 'overview',
                locale: 'overview',
                title: ''
            },{
                route: 'space-tokens',
                locale: 'space_tokens',
                title: ''
            },{
                route: 'oracle',
                locale: 'oracle',
                title: '',
                onlyFor: ['oracle']
            },{
                route: 'reputation',
                locale: 'reputation',
                title: ''
            }]
        }
    }
}
