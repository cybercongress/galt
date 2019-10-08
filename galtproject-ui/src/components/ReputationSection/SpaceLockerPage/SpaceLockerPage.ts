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

import GaltData from "../../../services/galtData";
import Explorer from "../../Explorer/Explorer";
import {EventBus, EXPLORER_DRAW_SPACE_TOKEN} from "../../../services/events";

import SpaceLockerCard from "../directives/SpaceLockerCard/SpaceLockerCard";
import SraCard from "../directives/SraCard/SraCard";
import AddSraModal from "./modals/AddSraModal/AddSraModal";

const pIteration = require('p-iteration');

export default {
    name: 'space-locker-page',
    template: require('./SpaceLockerPage.html'),
    components: {Explorer, SpaceLockerCard, SraCard},
    async mounted() {
        await this.getSpaceLocker();
        this.getSpaceToken();
        this.getSras();
    },
    methods: {
        async getSpaceLocker() {
            this.loading = true;
            this.spaceLocker = await this.$slrContract.getSpaceLockerByAddress(this.$route.params.lockerAddress);
            this.loading = false;
        },
        async getSpaceToken() {
            this.loading = true;
            this.updateSpaceLockerCard();
            await this.spaceLocker.fetchTokenInfo();
            if(this.spaceLocker.tokenDeposited) {
                this.spaceToken = await GaltData.getSpaceTokenObjectById(this.spaceLocker.spaceTokenId);
            } else {
                this.spaceToken = null;
            }
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, this.spaceToken || { contour: []});
            this.loading = false;
        },
        async getSras(){
            this.loading = true;
            this.srasAddresses = await this.spaceLocker.getSrasAddresses();
            this.loading = false;
        },
        addSra(){
            this.$root.$asyncModal.open({
                id: 'add-sra-modal',
                component: AddSraModal,
                props: {
                    spaceLockerAddress: this.$route.params.lockerAddress,
                },
                onClose: () => {
                    this.getSras();
                    this.updateSpaceLockerCard();
                }
            });
        },
        updateSpaceLockerCard() {
            this.hideSpaceLocker = true;
            setTimeout(() => {
                this.hideSpaceLocker = false;
            }, 100);
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet && this.$store.state.user_wallet.toLowerCase();
        }
    },
    data() {
        return {
            localeKey: 'reputation.space_locker_page',
            loading: true,
            hideSpaceLocker: false,
            spaceLocker: null,
            spaceToken: null,
            srasAddresses: []
        }
    }
}
