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

import * as _ from 'lodash';

import SpecifyAddressModal from '../../../../modals/SpecifyAddressModal/SpecifyAddressModal';

import {
    EventBus,
    EXPLORER_DRAW_SPACE_TOKEN, 
    EXPLORER_DRAW_SPACE_TOKENS_LIST
} from '../../../../services/events';

import GaltData from "../../../../services/galtData";
import ValuatePlotModal from "./modals/ValuatePlotModal/ValuatePlotModal";
import RegisterCustodianForPlotModal from "./modals/RegisterCustodianForPlotModal/RegisterCustodianForPlotModal";
import PlaceToEscrowModal from "./modals/PlaceToEscrowModal/PlaceToEscrowModal";
import EthData from "@galtproject/frontend-core/libs/EthData";

export default {
    name: 'my-territory-list',
    template: require('./MyTerritoryList.html'),
    components: {},
    created() {

    },
    async mounted() {
        this.$store.watch((state) => state.user_space_balance,
            (user_space_balance) => this.getSpaceList()
        );
        this.$store.watch((state) => state.user_wallet,
            (user_wallet) => this.getSpaceList()
        );
        await this.getSpaceList();

        this.tokenTypes = await this.$locale.setTitlesByNamesInList(GaltData.spaceTokensTypes, 'territory_types.', {level: '...'});
    },

    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },

    methods: {
        async getSpaceList() {
            this.loading = true;
            this.spaceList = await this.$galtUser.getSpaceTokens();
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, this.spaceList);
            this.loading = false;
        },
        showSpaceToken(spaceToken) {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, spaceToken);
        },

        sendSpaceTokenConfirm(spaceToken) {
            this.$root.$asyncModal.open({
                id: 'specify-address-modal',
                component: SpecifyAddressModal,
                props: {
                    contract: 'SpaceToken',
                    method: 'transferFrom',
                    locale: 'transfer_space',
                    subject: EthData.tokenIdToHex(spaceToken.tokenId)
                },
                onClose: (address) => {
                    if(!address) {
                        return;
                    }

                    this.sendSpaceToken(spaceToken, address);
                }
            });
        },

        placeToEscrow(spaceToken) {
            this.$root.$asyncModal.open({
                id: 'place-to-escrow-modal',
                component: PlaceToEscrowModal,
                props: {
                    spaceTokenId: spaceToken.tokenId
                }
            });
        },

        valuatePlot(spaceToken) {
            this.$root.$asyncModal.open({
                id: 'valuate-plot-modal',
                component: ValuatePlotModal,
                props: {
                    spaceTokenId: spaceToken.tokenId
                }
            });
        },

        registerCustodianForPlot(spaceToken) {
            this.$root.$asyncModal.open({
                id: 'register-custodian-for-plot-modal',
                component: RegisterCustodianForPlotModal,
                props: {
                    spaceTokenId: spaceToken.tokenId
                }
            });
        },

        async sendSpaceToken(spaceToken, address) {
            this.$galtUser.transferSpaceToken(address, spaceToken.tokenId).then(() => {
                this.$notify({
                    type: 'success',
                    title: this.$locale.get('my_territory.success.token_sent.title'),
                    text: this.$locale.get('my_territory.success.token_sent.description')
                });

                this.watchToAddSpaceTokenSent(spaceToken.tokenId);
            });
        },

        watchToAddSpaceTokenSent(tokenId) {
            const interval = setInterval(async () => {
                const spaceTokensIds = await this.$galtUser.getSpaceTokensIds();
                this.$store.commit('user_space_balance', spaceTokensIds.length);

                if(!_.includes(spaceTokensIds, tokenId)) {
                    this.getSpaceList();

                    clearInterval(interval);

                    this.$notify({
                        type: 'success',
                        title: this.$locale.get('my_territory.success.token_sent_finish.title')
                    })
                }
            }, 10000);

            this.intervals.push(interval);
        },
    },
    data() {
        return {
            loading: true,
            search: "",
            intervals: [],
            spaceList: [],
            tokenTypes: [],
            levels: [],
            filterByType: null,
            filterByLevel: null
        };
    },
    watch: {
        async filterByType() {
            // await this.getSpaceList();
            
            if(this.filterByType === 'building') {
                this.levels = _.chain(this.spaceList)
                    .uniqBy((spaceItem) => {
                        return spaceItem.level;
                    })
                    .orderBy((spaceItem) => {
                        return spaceItem.level;
                    })
                    .filter((spaceItem) => {
                        return spaceItem.level !== 0;
                    })
                    .map((spaceItem) => {
                        return {
                            name: spaceItem.level,
                            title: this.$locale.get('territory_types.building', {level: spaceItem.level})
                        };
                    })
                    .value();
            }
        }
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        filtered_tokens() {
            let resultList = this.spaceList;
            
            if(this.filterByType && this.filterByType != 'all') {
                resultList = resultList.filter((spaceToken) => {
                    return spaceToken.type === this.filterByType;
                });
                
                if(this.filterByType == 'building' && this.filterByLevel) {
                    resultList = resultList.filter((spaceToken) => {
                        return spaceToken.level === this.filterByLevel;
                    });
                }
            }
            
            if(this.search) {
                resultList = resultList.filter((spaceToken) => {
                    return _.startsWith(spaceToken.tokenId.toString(), this.search) || _.some(spaceToken.contour, (geohash) => _.includes(geohash, this.search));
                });
            }
            
            return resultList;
        }
    },
}
