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

import * as _ from 'lodash';

export default {
    name: 'sra-tabs',
    template: require('./SraTabs.html'),
    props: ['displayTabs', 'tabsClass'],
    async mounted() {
        this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
        this.sraContract.storage.getMultiSigAddress().then((multisigAddress) => {
            this.multisigAddress = multisigAddress;
        }).catch(() => {
            this.multisigAddress = null;
        });

        if (this.$locale.loaded) {
            this.setTabsTitle();
        } else {
            this.onLoadId = this.$locale.onLoad(this.setTabsTitle);
        }
        this.setUserMemberOfSra();
    },
    watch: {
        user_wallet() {
            this.setUserMemberOfSra();
        },
        sraContract() {
            this.setUserMemberOfSra();
        }
    },
    methods: {
        setTabsTitle() {
            this.tabs.forEach((tab) => {
                tab.title = this.$locale.get(this.localeKey + '.tabs.' + tab.locale);
            });
        },
        async setUserMemberOfSra() {
            this.userMemberOfSra = this.sraContract && this.user_wallet && (await this.sraContract.getSpaceTokensByOwnerCount(this.user_wallet)) > 0;
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        visibleTabs() {
            return this.tabs.filter((tab) => {
                if (!_.includes(this.displayTabs, tab.locale)) {
                    return false;
                }

                tab.title = this.$locale.get(this.localeKey + '.tabs.' + tab.locale);

                if (tab.locale === 'multisig') {
                    tab.route = 'multisig/' + this.multisigAddress;
                    return this.multisigAddress;
                }

                if (!tab.onlyFor) {
                    return true;
                }

                if (_.includes(tab.onlyFor, 'private')) {
                    return this.sraContract && this.sraContract.storage && this.sraContract.storage.isPrivate;
                }

                if (_.includes(tab.onlyFor, 'withStorage')) {
                    return this.sraContract && this.sraContract.storage;
                }

                if (_.includes(tab.onlyFor, 'userMember')) {
                    return this.userMemberOfSra;
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
            localeKey: 'reputation.sra_section',
            sraContract: null,
            userMemberOfSra: false,
            multisigAddress: null,
            tabs: [
                {
                    route: 'overview/general',
                    locale: 'overview',
                    title: ''
                }, {
                    route: 'overview/general',
                    locale: 'overview_general',
                    title: ''
                }, {
                    route: 'overview/laws',
                    locale: 'fund_rules',
                    title: '',
                    onlyFor: ['withStorage']
                }, {
                    route: 'overview/space-tokens',
                    locale: 'space_tokens',
                    title: ''
                }, {
                    route: 'overview/multisig-managers',
                    locale: 'multisig_managers',
                    title: ''
                }, {
                    route: 'contracts',
                    locale: 'whitelist_contracts',
                    title: '',
                    onlyFor: ['withStorage']
                }, {
                    route: 'join-exit',
                    locale: 'join_exit',
                    title: ''
                }, {
                    route: 'join-requests',
                    locale: 'new_member_proposals',
                    title: '',
                    onlyFor: ['private']
                }, {
                    route: 'multisig-replenishment',
                    locale: 'multisig_replenishment',
                    title: ''
                }, {
                    route: 'multisig',
                    locale: 'multisig',
                    title: ''
                }, {
                    route: 'my-reputation',
                    locale: 'my_reputation',
                    title: '',
                    onlyFor: ['userMember']
                }
            ]
        }
    }
}
