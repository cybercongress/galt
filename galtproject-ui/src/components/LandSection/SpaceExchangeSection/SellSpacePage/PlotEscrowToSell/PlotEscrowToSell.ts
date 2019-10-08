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
    EventBus,
    EXPLORER_DRAW_SPACE_TOKEN, 
    EXPLORER_DRAW_SPACE_TOKENS_LIST
} from '../../../../../services/events';

import AttachSpaceTokenModal from "./modals/AttachSpaceTokenModal/AttachSpaceTokenModal";
import GaltData from "../../../../../services/galtData";
import PlotEscrowOrderCard from "../../directives/PlotEscrowOrderCard/PlotEscrowOrderCard";
import Explorer from "../../../../Explorer/Explorer";
import ApplyForCustodianModal from "./modals/ApplyForCustodianModal/ApplyForCustodianModal";

export default {
    name: 'plot-escrow-to-sell',
    template: require('./PlotEscrowToSell.html'),
    components: {
        Explorer,
        PlotEscrowOrderCard
    },
    created() {
        this.getOrdersData();
        this.getOrderStatuses();
        
        setInterval(this.getOrdersData.bind(this), 10000);

        this.$store.watch((state) => state.user_wallet,
            (user_wallet) => this.getOrdersList()
        );
    },
    mounted() {
        
    },
    methods: {
        getOrdersData(){
            this.$galtUser.plotEscrowSellerOrdersCount().then((ordersCount) => {
                if(ordersCount == this.ordersCount) {
                    return;
                }
                this.ordersCount = ordersCount;
                this.getOrdersList();
            });
        },
        async getOrderStatuses() {
            this.orderStatuses = await this.$locale.setTitlesByNamesInList(this.$plotEscrowContract.applicationStatuses, 'order_statuses.');
        },
        async getOrdersList() {
            this.loading = true;
            this.ordersList = await this.$galtUser.plotEscrowSellerOrders();
            this.showOrdersOnMap();
            this.loading = false;
        },
        async showOrdersOnMap(){
            const spaceTokens = await GaltData.spaceTokenIdsToObjects(this.ordersList.map(order => order.spaceTokenId));
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKENS_LIST, spaceTokens);
            
        },
        async showSpaceToken(order) {
            const spaceToken = await GaltData.getSpaceTokenObjectById(order.spaceTokenId);
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, spaceToken);
        },

        updateOrder(order) {
            GaltData.updateApplication(order, this.$galtUser.getOrder(order.contractType, order.id, {

            }))
        },

        changeAsk(order, offer) {
            GaltData.specifyAmountModal({
                title: this.getLocale("change_ask_modal.title"),
                placeholder: this.getLocale("change_ask_modal.placeholder"),
                defaultValue: order.ask
            }).then(async (amount: any) => {
                this.$galtUser.changePlotEscrowAsk(order, offer, amount).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.change_ask.title'),
                        text: this.getLocale('success.change_ask.description')
                    });
                })
            });
        },
        selectOffer(order, offer) {
            GaltData.confirmModal({
                title: this.getLocale("select_offer_modal.title")
            }).then(async () => {
                this.$galtUser.selectPlotEscrowOffer(order, offer).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.select_offer.title'),
                        text: this.getLocale('success.select_offer.description')
                    });
                })
            });
        },
        cancelCurrentOffer(order) {
            GaltData.confirmModal({
                title: this.getLocale("cancel_offer_modal.title")
            }).then(async () => {
                this.$galtUser.cancelPlotEscrowOffer(order, order.buyer).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.cancel_offer.title'),
                        text: this.getLocale('success.cancel_offer.description')
                    });
                })
            });
        },
        withdrawSpaceToken(order) {
            this.$galtUser.withdrawPlotEscrowSpaceToken(order, order.buyer).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.withdraw_space_token.title'),
                    text: this.getLocale('success.withdraw_space_token.description')
                });
            })
        },
        emptyCurrentOffer(order) {
            this.$galtUser.emptyPlotEscrowOffer(order, order.buyer).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.empty_offer.title'),
                    text: this.getLocale('success.empty_offer.description')
                });
            })
        },
        reopenCurrentOffer(order) {
            this.$galtUser.reopenPlotEscrowOrder(order, order.buyer).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.reopen_offer.title'),
                    text: this.getLocale('success.reopen_offer.description')
                });
            })
        },
        attachSpaceToken(order) {
            this.$root.$asyncModal.open({
                id: 'attach-space-token-modal',
                component: AttachSpaceTokenModal,
                props: {
                    tokenId: order.spaceTokenId,
                    orderId: order.id
                },
                onClose: () => {
                    this.updateOrder(order);
                }
            });
        },
        applyForCustodian(order) {
            this.$root.$asyncModal.open({
                id: 'apply-for-custodian-modal',
                component: ApplyForCustodianModal,
                props: {
                    orderId: order.id
                },
                onClose: () => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.apply_for_custodian.title'),
                        text: this.getLocale('success.apply_for_custodian.description')
                    });
                }
            });
        },
        withdrawFromCustodian(order) {
            this.$galtUser.withdrawPlotEscrowSpaceTokenFromCustodian(order).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.withdraw_from_custodian.title'),
                    text: this.getLocale('success.withdraw_from_custodian.description')
                });
            })
        },
        resolve(order) {
            GaltData.confirmModal({
                title: this.getLocale("resolve_modal.title")
            }).then(async () => {
                this.$galtUser.resolvePlotEscrowOffer(order, order.buyer).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.resolve.title'),
                        text: this.getLocale('success.resolve.description')
                    });
                })
            });
        },
        claimPayment(order) {
            this.$galtUser.claimPlotEscrowPayment(order, order.buyer).then(() => {
                this.updateOrder(order);
                this.$notify({
                    type: 'success',
                    title: this.getLocale('success.claim_payment.title'),
                    text: this.getLocale('success.claim_payment.description')
                });
            })
        },
        cancelOrder(order) {
            GaltData.confirmModal({
                title: this.getLocale("cancel_order_modal.title")
            }).then(async () => {
                this.$galtUser.cancelPlotEscrowOrder(order).then(() => {
                    this.updateOrder(order);
                    this.$notify({
                        type: 'success',
                        title: this.getLocale('success.cancel_order.title'),
                        text: this.getLocale('success.cancel_order.description')
                    });
                })
            });
        },
        toggleAllOffers(order){
            this.$set(order, 'showAllOrders', !order.showAllOrders);
        },
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    data() {
        return {
            localeKey: 'plot_escrow.sell',
            loading: true,
            intervals: [],
            orderStatuses: [],
            filterByStatus: 'all',
            ordersList: [],
            ordersCount: null
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet
        },
        filteredOrders() {
            let result;

            if(this.filterByStatus == 'all') {
                result = this.ordersList;
            } else {
                result = this.ordersList.filter((order) => {
                    return order.statusName == this.filterByStatus;
                });
            }

            return result;
        }
    },
}
