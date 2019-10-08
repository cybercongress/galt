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

import GaltData from "../../../../services/galtData";
import MemberIdentification from "../MemberIdentification/MemberIdentification";

export default {
    name: 'proposal-voting-members',
    template: require('./ProposalVotingMembers.html'),
    props: ['sraAddress', 'managerAddress', 'proposalId'],
    components: {MemberIdentification},
    async mounted() {
        this.getSraMembersList();
    },
    watch: {
        sraAddress() {
            this.getSraMembersList();
        },
        currentTab() {
            this.getSraMembersList();
        }
    },
    methods: {
        async getSraMembersList() {
            this.loading = true;

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);
            this.managerContract = await this.sraContract.storage.getProposalManagerContract(this.managerAddress);
            this.proposalStatus = await this.managerContract.getProposalStatus(this.proposalId);
            this.proposalVoting = await this.managerContract.getProposalVoting(this.proposalId);
            
            let membersAddresses;
            if(this.currentTab === 'accepted') {
                membersAddresses = this.proposalVoting.accepted;
            } else {
                membersAddresses = this.proposalVoting.declined;
            }

            this.membersList = membersAddresses.map((memberAddress) => {
                const member = {
                    address: memberAddress,
                    balance: null,
                    balanceStr: '...',
                    ownedBalance: null,
                    ownedBalanceStr: '...',
                    identification: ''
                };

                this.sraContract.getBalanceOf(memberAddress).then(async balance => {
                    member.balance = balance;
                    member.balanceStr = GaltData.beautyNumber(member.balance);

                    member.ownedBalance = await this.sraContract.getOwnedBalanceOf(memberAddress);
                    member.ownedBalanceStr = GaltData.beautyNumber(this.ownedBalance);
                    member.identification = await this.sraContract.storage.getMemberIdentification(memberAddress);
                });
                return member;
            });
            
            this.loading = false;
        }
    },
    data() {
        return {
            localeKey: 'reputation.voting_members',
            managerContract: null,
            currentTab: 'accepted',
            membersList: [],
            proposalStatus: null,
            proposalVoting: null,
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
