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

import {
    EventBus, EXPLORER_DRAW_SPACE_TOKEN,
    GetEventName
} from '../../../services/events';
import GaltData from "../../../services/galtData";
import Explorer from "../../Explorer/Explorer";
import SpaceLockerCard from "../directives/SpaceLockerCard/SpaceLockerCard";

import FeeInput from "../../../directives/FeeInput/FeeInput";

export default {
    name: 'deposit-space-locker-page',
    template: require('./DepositSpaceLockerPage.html'),
    components: {Explorer, SpaceLockerCard, FeeInput},
    created() {

    },
    async mounted() {
        await this.drawSpaceToken();
        await this.getSpaceLockerFee();
        
        this.spaceTokenLoading = false;
        
        if(this.$route.params.lockerAddress) {
            this.spaceLocker.created = true;
            this.spaceLocker.approvedGalt = true;
            this.spaceLocker.address = this.$route.params.lockerAddress;
            
            const spaceLockerContract = await this.$slrContract.getSpaceLockerByAddress(this.spaceLocker.address);
            await spaceLockerContract.fetchTokenInfo();
            if(spaceLockerContract.tokenDeposited) {
                this.spaceLocker.approvedSpace = true;
                this.spaceLocker.deposited = true;
            }
        }
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async drawSpaceToken() {
            this.spaceToken = await GaltData.getSpaceTokenObjectById(this.$route.params.tokenId);
            this.emitExplorerEvent(EXPLORER_DRAW_SPACE_TOKEN, this.spaceToken);
        },

        async getSpaceLockerFee() {
            this.galtFee = await this.$contracts.$feeRegistry.getGaltFee("SPACE_LOCKER_FACTORY");
        },
        
        async approveGaltFee() {
            this.spaceLocker.approvingGalt = true;

            this.$galtUser.approveGalt(this.$root.$slfContract.address, this.spaceLocker.fee).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.approve_fee.title'),
                    text: this.getLocale('success.approve_fee.description')
                });
                this.spaceLocker.approvingGalt = false;
                this.spaceLocker.approvedGalt = true;
            }).catch(() => {
                this.spaceLocker.approvingGalt = false;
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.something_wrong.description')
                });
            });
        },

        createSpaceLocker() {
            this.spaceLocker.creatingLocker = true;
            
            this.$galtUser.buildLocker(this.spaceLocker.feeCurrency).then((lockerAddress) => {
                this.$router.replace({ name: "reputation-deposit-space-locker", params: {lockerAddress: lockerAddress} });

                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.create_space_locker.title'),
                    text: this.getLocale('success.create_space_locker.description')
                });
                this.spaceLocker.address = lockerAddress;
                this.spaceLocker.creatingLocker = false;
                this.spaceLocker.created = true;
            }).catch((err) => {
                console.error(err);
                this.spaceLocker.creatingLocker = false;
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.something_wrong.description')
                });
            })
        },

        approveSpaceToken() {
            this.spaceLocker.approvingSpace = true;
            
            this.$galtUser.approveSpace(this.spaceLocker.address, this.spaceToken.tokenId).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.approve.title'),
                    text: this.getLocale('success.approve.description')
                });
                this.spaceLocker.approvingSpace = false;
                this.spaceLocker.approvedSpace = true;
            }).catch(() => {
                this.spaceLocker.approvingSpace = false;
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.something_wrong.description')
                });
            });
        },

        depositSpaceToken() {
            this.spaceLocker.depositing = true;

            this.$galtUser.spaceLockerDeposit(this.spaceLocker.address, this.spaceToken.tokenId).then(async (res) => {
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.deposit.title'),
                    text: this.getLocale('success.deposit.description')
                });
                this.spaceLocker.depositing = false;
                this.spaceLocker.deposited = true;
                this.ended = true;
                
                this.updateSpaceLockerCard();
            }).catch(() => {
                this.spaceLocker.depositing = false;
                this.$notify({
                    type: 'error',
                    title: this.getLocale('error.something_wrong.title'),
                    text: this.getLocale('error.something_wrong.description')
                });
            })
        },
        
        updateSpaceLockerCard(){
            this.hideSpaceLocker = true;
            setTimeout(() => {
                this.hideSpaceLocker = false;
            }, 100);
        },

        subscribeToExplorerEvent(eventName, callback) {
            EventBus.$on(GetEventName(eventName, this.explorerName), callback);
        },
        emitExplorerEvent(eventName, data) {
            EventBus.$emit(GetEventName(eventName, this.explorerName), data);
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        }
    },
    data() {
        return {
            localeKey: 'reputation.deposit_space_locker',
            explorerName: 'main',
            intervals: [],
            galtFee: null,
            spaceTokenLoading: true,
            hideSpaceLocker: false,
            ended: false,
            spaceToken: {
                tokenId: null,
                contour: [],
                area: null
            },
            spaceLocker: {
                address: null,
                
                fee: null,
                feeCurrency: null,
                
                created: false,
                approvedGalt: false,
                approvedSpace: false,
                deposited: false,
                
                creatingLocker: false,
                approvingSpace: false,
                approvingGalt: false,
                depositing: false
            },
            possibleForMergePacks: []
        };
    }
}
