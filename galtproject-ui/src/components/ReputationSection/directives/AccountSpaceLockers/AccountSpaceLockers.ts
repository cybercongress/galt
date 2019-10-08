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

export default {
    name: 'account-space-lockers',
    template: require('./AccountSpaceLockers.html'),
    props: ['userWallet'],
    async mounted() {
        this.getSpaceLockersList();
    },
    watch: {
        userWallet() {
            this.getSpaceLockersList();
        }
    },
    methods: {
        getSpaceLockersList() {
            this.loading = true;
            
            this.$slrContract.getSpaceLockersListByOwner(this.userWallet).then(_lockersList => {
                this.lockersList = _lockersList;

                this.loading = false;
            });
        }
    },
    data() {
        return {
            localeKey: 'reputation.account.space_lockers',
            lockersList: [],
            loading: true
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        }
    }
}
