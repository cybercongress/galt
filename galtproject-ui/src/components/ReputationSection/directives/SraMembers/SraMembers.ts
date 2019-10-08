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

const pIteration = require('p-iteration');

export default {
    name: 'sra-members',
    template: require('./SraMembers.html'),
    props: ['sraAddress'],
    components: {MemberIdentification},
    async mounted() {
        this.getSraMembersList();
    },
    watch: {
        sraAddress() {
            this.getSraMembersList();
        }
    },
    methods: {
        async getSraMembersList() {
            this.loading = true;

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            const membersAddresses = await this.sraContract.getSpaceTokenOwners();

            this.membersList = await pIteration.map(membersAddresses, async (memberAddress) => {
                const member = {
                    address: memberAddress,
                    balance: await this.sraContract.getBalanceOf(memberAddress),
                    balanceStr: '',
                    ownedBalance: await this.sraContract.getOwnedBalanceOf(memberAddress),
                    ownedBalanceStr: '',
                    spaceTokensCount: await this.sraContract.getSpaceTokensByOwnerCount(memberAddress),
                    identification: ''
                };

                if(this.sraContract.storage) {
                    member.identification = await this.sraContract.storage.getMemberIdentification(memberAddress);
                }

                member.balanceStr = GaltData.beautyNumber(member.balance);
                member.ownedBalanceStr = GaltData.beautyNumber(member.ownedBalance);
                return member;
            });
            
            this.loading = false;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_members',
            sraContract: null,
            membersList: [],
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
