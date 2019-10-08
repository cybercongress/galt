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

const pIteration = require('p-iteration');

export default {
    name: 'delegated-by-members',
    template: require('./DelegatedByMembers.html'),
    props: ['userWallet', 'sraAddress'],
    async mounted() {
        this.getDelegatedByList();
    },
    watch: {
        userWallet() {
            this.getDelegatedByList();
        }
    },
    methods: {
        async getDelegatedByList() {
            this.loading = true;

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            const membersAddresses = await this.sraContract.getDelegatedBy(this.userWallet);
            
            this.delegatedBySum = 0;

            this.membersList = await pIteration.map(membersAddresses, async (memberAddress) => {
                const member = {
                    address: memberAddress,
                    delegatedBalance: await this.sraContract.delegatedBalanceOf(this.userWallet, memberAddress),
                    delegatedBalanceStr: '',
                    balance: await this.sraContract.getBalanceOf(memberAddress),
                    balanceStr: '',
                    ownedBalance: await this.sraContract.getOwnedBalanceOf(memberAddress),
                    ownedBalanceStr: '',
                    delegatedByCount: await this.sraContract.getDelegatedByCount(memberAddress)
                };

                this.delegatedBySum += member.delegatedBalance;

                member.delegatedBalanceStr = GaltData.beautyNumber(member.delegatedBalance);
                member.balanceStr = GaltData.beautyNumber(member.balance);
                member.ownedBalanceStr = GaltData.beautyNumber(member.ownedBalance);
                return member;
            });
            
            this.loading = false;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.sra_account.delegated_by_members',
            membersList: [],
            delegatedBySum: null,
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
