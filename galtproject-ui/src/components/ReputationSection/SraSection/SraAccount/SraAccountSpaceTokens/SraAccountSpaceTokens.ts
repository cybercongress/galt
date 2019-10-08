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
    name: 'sra-account-space-tokens',
    template: require('./SraAccountSpaceTokens.html'),
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
            if(!this.userWallet) {
                return;
            }

            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.sraAddress);

            const spaceTokensIds = await this.sraContract.getSpaceTokensByOwner(this.userWallet);

            this.spaceTokens = await pIteration.map(spaceTokensIds, async (tokenId) => {
                const spaceToken = {
                    tokenId,
                    area: await GaltData.getSpaceTokenArea(tokenId),
                    areaStr: null
                };

                spaceToken.areaStr = GaltData.beautyNumber(spaceToken.area);
                return spaceToken;
            });
            
            this.loading = false;
        }
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.sra_account.space_tokens',
            spaceTokens: [],
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
