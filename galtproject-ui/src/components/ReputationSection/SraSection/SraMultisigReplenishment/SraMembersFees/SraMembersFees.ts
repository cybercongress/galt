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
    name: 'sra-members-fees',
    template: require('./SraMembersFees.html'),
    props: ['sraAddress', 'feeContractAddress'],
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

            this.feeContract = await GaltData.getFundFeeContract(this.feeContractAddress);

            const membersAddresses = await this.sraContract.getSpaceTokenOwners();

            this.membersList = await pIteration.map(membersAddresses, async (memberAddress) => {
                const member = {
                    address: memberAddress,
                    payData: {
                        minPaidUntil: null,
                        sum: null,
                        totalPaidSum: null,
                        tokensIds: [],
                        tokensIdsForLock: [],
                        lockedTokensIds: []
                    },
                    paySumStr: '',
                    totalPaidStr: '',
                    loading: true
                };

                this.feeContract.getPayData(this.sraContract, memberAddress).then(payData => {
                   member.payData = payData;
                   member.paySumStr = GaltData.beautyNumber(member.payData.sum) + ' ' + this.feeContract.currencyStr;
                   member.totalPaidStr = GaltData.beautyNumber(member.payData.totalPaidSum) + ' ' + this.feeContract.currencyStr;
                   member.loading = false;
               });
               
               return member;
            });
            
            this.loading = false;
        },
        lockSpaceTokens(tokensIds) {
            this.loading = true;
            this.$galtUser.tariffLockArray(this.feeContract, tokensIds).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale(`success.lock.title`),
                    text: this.getLocale(`success.lock.description`)
                });
                
                this.getSraMembersList();
            }).catch((e) => {
                this.loading = false;
                this.$notify({
                    type: 'error',
                    title: this.getLocale(`error.lock.title`),
                    text: this.getLocale(`error.lock.description`, { error: e ? e.message || e : "" })
                });
            })
        },
        unlockSpaceTokens(tokensIds) {
            this.loading = true;
            this.$galtUser.tariffUnlockArray(this.feeContract, tokensIds).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale(`success.unlock.title`),
                    text: this.getLocale(`success.unlock.description`)
                });

                this.getSraMembersList();
            }).catch((e) => {
                this.loading = false;
                this.$notify({
                    type: 'error',
                    title: this.getLocale(`error.unlock.title`),
                    text: this.getLocale(`error.unlock.description`, { error: e ? e.message || e : "" })
                });
            })
        },

        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.sra_members_fees',
            membersList: [],
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        membersLoading() {
            return this.membersList.some(member => member.loading);
        },
        allAvailableForLockTokensIds() {
            let tokensIds = [];
            this.membersList.filter(member => member.payData.tokensIdsForLock.length).forEach(member => {
                tokensIds = tokensIds.concat(member.payData.tokensIdsForLock);
            });
            return tokensIds;
        }
    }
}
