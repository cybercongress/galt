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
import AddDelegationModal from "./modals/AddDelegationModal/AddDelegationModal";
import RevokeDelegationModal from "./modals/RevokeDelegationModal/RevokeDelegationModal";
import {EventBus, REPUTATION_DELEGATION_CHANGED} from "../../../../../services/events";

const pIteration = require('p-iteration');

export default {
    name: 'delegations-members',
    template: require('./DelegationsMembers.html'),
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

            const membersAddresses = await this.sraContract.getDelegations(this.userWallet);

            this.delegatedSum = 0;
            
            this.membersList = await pIteration.map(membersAddresses, async (memberAddress) => {
                const member = {
                    address: memberAddress,
                    delegatedBalance: await this.sraContract.delegatedBalanceOf(memberAddress, this.userWallet),
                    delegatedBalanceStr: '',
                    balance: await this.sraContract.getBalanceOf(memberAddress),
                    balanceStr: '',
                    ownedBalance: await this.sraContract.getOwnedBalanceOf(memberAddress),
                    ownedBalanceStr: '',
                    // delegationsCount: await this.sraContract.getDelegationsCount(memberAddress)
                };

                this.delegatedSum += member.delegatedBalance;

                member.balanceStr = GaltData.beautyNumber(member.balance);
                member.ownedBalanceStr = GaltData.beautyNumber(member.ownedBalance);
                member.delegatedBalanceStr = GaltData.beautyNumber(member.delegatedBalance);
                return member;
            });
            
            this.loading = false;
        },

        addDelegation() {
            this.$root.$asyncModal.open({
                id: 'add-delegation-modal',
                component: AddDelegationModal,
                props: {
                    'sraAddress': this.$route.params.sraAddress
                },
                onClose: () => {
                    this.getDelegatedByList();
                    EventBus.$emit(REPUTATION_DELEGATION_CHANGED);
                }
            });
        },

        revokeDelegation(address) {
            this.$root.$asyncModal.open({
                id: 'revoke-delegation-modal',
                component: RevokeDelegationModal,
                props: {
                    'sraAddress': this.$route.params.sraAddress,
                    'delegatedAddress': address
                },
                onClose: () => {
                    this.getDelegatedByList();
                    EventBus.$emit(REPUTATION_DELEGATION_CHANGED);
                }
            });
        },
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.sra_account.delegation_members',
            membersList: [],
            delegatedSum: null,
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
