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

import SraLockerControl from "../SraLockerControl/SraLockerControl";

export default {
    name: 'space-locker-card',
    template: require('./SpaceLockerCard.html'),
    props: ['address', 'sraAddress', 'showControl'],
    components: { SraLockerControl },
    async mounted() {
        this.getSpaceLocker();
    },
    watch: {
        async address() {
            this.getSpaceLocker();
        }
    },
    methods: {
        getSpaceLocker() {
            this.spaceLocker = null;
            
            this.$slrContract.getSpaceLockerByAddress(this.address).then(async spaceLocker => {
                await spaceLocker.fetchTokenInfo();
                await spaceLocker.fetchSrasCount();
                this.spaceLocker = spaceLocker;
            });
        },
        onControlUpdate() {
            
        },
        withdraw() {
            if(this.spaceLocker.srasCount > 0) {
                return this.$notify({
                    type: 'error',
                    title: this.getLocale("error.sras_should_be_0_for_withdraw.title"),
                    text: this.getLocale("error.sras_should_be_0_for_withdraw.description")
                });
            }
            this.loading = true;

            this.$galtUser.spaceLockerWithdraw(this.address, this.spaceLocker.spaceTokenId)
                .then(() => {
                    this.loading = false;
                    this.$notify({
                        type: 'success',
                        title: this.getLocale("success.withdraw.title"),
                        text: this.getLocale("success.withdraw.description")
                    });
                    this.spaceLocker.tokenDeposited = false;
                    this.$emit('update');
                })
                .catch((e) => {
                    console.error(e);

                    this.$notify({
                        type: 'error',
                        title: this.getLocale("error.withdraw.title"),
                        text: this.getLocale("error.withdraw.description")
                    });
                    this.loading = false;
                })
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        showLockerControl() {
            return this.showControl && this.spaceLocker && this.user_wallet && this.spaceLocker.owner.toLowerCase() === this.user_wallet.toLowerCase();
        }
    },
    data() {
        return {
            localeKey: 'reputation.space_locker_info',
            loading: false,
            spaceLocker: null
        }
    }
}
