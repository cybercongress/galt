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

export default {
    name: 'custodians-space-tokens',
    template: require('./CustodianSpaceTokens.html'),
    props: ['userWallet'],
    async mounted() {
        this.getSpaceTokensList();
    },
    watch: {
        userWallet() {
            this.getSpaceTokensList();
        }
    },
    methods: {
        getSpaceTokensList() {
            this.loading = true;
            
            this.$spaceCustodianRegistryContract.custodianSpaceTokensIds(this.userWallet).then(tokensIds => {
                this.tokensList = tokensIds.map(tokenId => {
                    const tokenObj = {
                        tokenId,
                        owner: null,
                        documents: []
                    };
                    
                    GaltData.ownerOfTokenId(tokenId).then(owner => {
                        tokenObj.owner = owner;
                    });

                    this.$spaceCustodianRegistryContract.spaceTokenCustodianDocuments(tokenId).then(documents => {
                        tokenObj.documents = documents;
                    });
                    
                    return tokenObj;
                });

                this.loading = false;
            });
        }
    },
    data() {
        return {
            localeKey: 'user_account.custodian_space_tokens',
            tokensList: [],
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
