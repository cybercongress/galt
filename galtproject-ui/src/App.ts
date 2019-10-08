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

import Vue from 'vue';
import * as Vuex from 'vuex';
import VueMaterial from 'vue-material'
import {Modal} from "./directives/AsyncModal";
import {Tabs, Tab} from "./directives/tabs";
import Notifications from 'vue-notification';

import * as _ from 'lodash';

import httpPlugin from '@galtproject/frontend-core/services/http.plugin';
import workersPlugin from '@galtproject/frontend-core/services/workers.plugin';
import sentryPlugin from '@galtproject/frontend-core/services/sentry.plugin';
import localePlugin from '@galtproject/frontend-core/services/locale.plugin';
import storePlugin from '@galtproject/frontend-core/services/store.plugin';
import "@galtproject/frontend-core/filters";
import PrettyHex from "@galtproject/frontend-core/directives/PrettyHex/PrettyHex";
import PrettyDoc from "@galtproject/frontend-core/directives/PrettyDoc/PrettyDoc";
import MetamaskNotActive from "@galtproject/frontend-core/directives/MetamaskNotActive/MetamaskNotActive";

import EthData from "@galtproject/frontend-core/libs/EthData";

import galtUserPlugin from './services/galtUser.plugin';
import internalWalletPlugin from './services/internalWallet.plugin';
import waitScreenPlugin from './services/waitScreen.plugin';
import geoExplorerPlugin from './services/geoExplorer.plugin';
import rpcScreenPlugin from './services/rpcScreen.plugin';
import contractsFactorylugin from './services/contractsFactory.plugin';

import GaltData from './services/galtData';

import Loader from "./directives/Loader/Loader";
import EditField from "./directives/EditField/EditField";
import UserMenu from "./directives/UserMenu/UserMenu";
import WaitScreen from "./directives/WaitScreen/WaitScreen";
import ApplicationCard from "./directives/ApplicationCard/ApplicationCard";
import SpaceTokenCard from "./directives/SpaceTokenCard/SpaceTokenCard";

import AlternativeServersModal from "./modals/AlternativeServersModal/AlternativeServersModal";
import OraclePopup from "./directives/OraclePopup/OraclePopup";
import Web3Manager from "@galtproject/frontend-core/libs/Web3Manager";
import Hint from "@galtproject/frontend-core/directives/Hint/Hint";

Vue.use(Notifications);

Vue.use(httpPlugin);
Vue.use(Vuex as any);
Vue.use(storePlugin, {
    locale: null,
    locale_loaded: false,
    user_wallet: '',
    is_oracle: false,
    is_plot_manager_fee_manager: false,
    is_galt_dex_fee_manager: false,
    is_oracle_manager: false,
    is_roles_manager: false,
    user_eth_balance: null,
    user_space_balance: null,
    user_galt_balance: null,
    pm_user_applications_ids: [],
    pcl_user_applications_ids: [],
    pv_user_applications_ids: [],
    pc_user_applications_ids: [],
    pe_user_applications_ids: [],
    cm_user_applications_ids: [],

    internal_wallet: null,
    internal_wallet_active: null,
    internal_wallet_eth_balance: null,
    internal_wallet_galt_balance: null,
    internal_wallet_space_balance: null
});
Vue.use(workersPlugin);
Vue.use(waitScreenPlugin);
Vue.use(rpcScreenPlugin);
Vue.use(internalWalletPlugin);
Vue.use(galtUserPlugin);
Vue.use(sentryPlugin);
Vue.use(geoExplorerPlugin);
Vue.use(localePlugin);
Vue.use(contractsFactorylugin);

Vue.component('modal', Modal);
Vue.component('tabs', Tabs);
Vue.component('tab', Tab);
Vue.component('loader', Loader);
Vue.component('edit-field', EditField);
Vue.component('application-card', ApplicationCard);
Vue.component('space-token-card', SpaceTokenCard);
Vue.component('pretty-hex', PrettyHex);
Vue.component('pretty-doc', PrettyDoc);
Vue.component('oracle-popup', OraclePopup);
Vue.component('hint', Hint);

Vue.use(VueMaterial);

export default {
    name: 'app',
    template: require('./App.html'),
    components: {UserMenu, WaitScreen, MetamaskNotActive},
    async created() {
        console.log('process.env.CONTRACTS_DEPLOYMENT_ID', GaltData.contractsDeploymentId());

        Web3Manager.onAccountAddressChange(this.setUserWallet.bind(this));
        
        await GaltData.init(this);
        EthData.init(this, GaltData.config);

        (global as any).dev = {
            parseContractData(contractAbi, data) {
                let abi = _.isArray(contractAbi) ? contractAbi : GaltData.contractsConfig[contractAbi + 'Abi'] || JSON.parse(contractAbi);
                return EthData.parseData(data, abi, 0);
            }
        };
        
        this.$galtUser.init(this.$internalWallet, this.$contracts, this.$store);
        
        this.$locale.importModules(['GaltMultisig']);
        this.$locale.init(this.$store, '/locale/').then(() => {
            this.$store.commit('locale_loaded', true);
            this.language = this.$locale.lang;
        });
        this.$locale.onLoad(() => {
            this.$store.commit('locale_loaded', true);
            this.language = this.$locale.lang;
        });

        await this.$locale.waitForLoad();
        this.$waitScreen.setDefaultText(this.$locale.get('wait_screen.default_title'), this.$locale.get('wait_screen.default_tip'));
        this.$rpcScreen.setDefaultText(this.$locale.get('rpc_screen.not_correct'), this.$locale.get('rpc_screen.you_can_use_tip'));
        this.$rpcScreen.setVideoYoutubeId(this.$locale.get('rpc_screen.youtube_video_id'));

        if(Web3Manager.currentNetworkId != GaltData.rpcServerId()) {
            this.$rpcScreen.show(GaltData.rpcServer(), GaltData.altRpcServers());
        }

        this.loading = false;
        
        this.initContracts();

        this.$store.watch(
            (state) => state.user_wallet,
            (user_wallet) => this.getUserData());
        
        this.getUserData();
        
        setInterval(this.getUserData.bind(this), 10000);
        
        this.$locale.waitForLoad().then(() => {
            this.$waitScreen.setDefaultText(this.$locale.get('wait_screen.default_title'), this.$locale.get('wait_screen.default_tip'));
            this.$rpcScreen.setDefaultText(this.$locale.get('rpc_screen.not_correct'), this.$locale.get('rpc_screen.you_can_use_tip'));
            this.$rpcScreen.setVideoYoutubeId(this.$locale.get('rpc_screen.youtube_video_id'));
        });
        
        this.$web3Worker.callMethod('setWeb3', GaltData.callMethodsRpcServer());
        
        this.$web3Worker.onEvent('txFailed', (tx) => {
            this.$sentry.exception(tx);
        });
        this.$web3Worker.onEvent('txError', (tx) => {
            this.$sentry.exception(tx);
        });
    },

    mounted() {
        this.$root.$asyncModal = this.$refs.modal;
        this.$root.$asyncSubModal = this.$refs.sub_modal;
    },
    
    beforeDestroy() {
        this.destroyWebsocket();
    },

    methods: {
        setUserWallet(walletAddress) {
            if(walletAddress) {
                this.showMetamaskNotActive = false;
            } else {
                this.showMetamaskNotActive = true;
            }
            this.$store.commit('user_wallet', walletAddress);
            this.$sentry.setUserAddress(walletAddress);
            this.$galtUser.setAddress(walletAddress);
            
            this.$store.commit('internal_wallet', this.$galtUser.getInternalWallet());
            this.$store.commit('internal_wallet_active', this.$galtUser.getInternalWalletActive());

            this.$galtUser.onInternalWalletSet((walletAddress) => {
                this.$store.commit('internal_wallet', walletAddress);
                this.getInternalWalletData();
            });
            this.$galtUser.onInternalWalletActivated((active) => {
                this.$store.commit('internal_wallet_active', active);
            });

            this.getInternalWalletData();

            setInterval(this.getInternalWalletData.bind(this), 10000);
            
            this.checkInternalWalletForReleased();
        },
        
        serverNotRespondingMessage(contractName) {
            return (options) => {
                this.$notify({
                    type: 'error',
                    title: "Сервер не отвечает",
                    text: `Контракт ${contractName} с адресом ${options.contractAddress} не отвечает на вызов ${options.methodName}`
                });
            }
        },

        async initContracts() {
            GaltData.getContractsConfig(await EthData.curNetworkId()).then(async (contractsConfig) => {
                if (!this.$root.$web3) {
                    if (document.readyState === "complete") {
                        this.$contractsFactory.init(this, contractsConfig);
                    } else {
                        window.addEventListener('load', async () => {
                            this.$contractsFactory.init(this, contractsConfig);
                        })
                    }
                }
            });
        },

        getUserData() {
            if(!this.user_wallet) {
                return;
            }

            this.$galtUser.spaceTokensCount().then(spaceBalance => {
                if(spaceBalance == this.user_space_balance) {
                    return;
                }
                this.$store.commit('user_space_balance', spaceBalance);
            });

            this.$galtUser.galtBalance().then(galtBalance => {
                if(galtBalance == this.user_galt_balance) {
                    return;
                }
                this.$store.commit('user_galt_balance', galtBalance);
            });

            this.$galtUser.ethBalance().then(ethBalance => {
                if(ethBalance == this.user_eth_balance) {
                    return;
                }
                this.$store.commit('user_eth_balance', ethBalance);
            });

            this.$galtUser.userApplicationsIds('plotManager').then((applications_ids) => {
                if(_.isEqual(applications_ids, this.pm_user_applications_ids)) {
                    return;
                }
                this.$store.commit('pm_user_applications_ids', applications_ids);
            });

            this.$galtUser.userApplicationsIds('plotClarification').then((applications_ids) => {
                if(_.isEqual(applications_ids, this.pcl_user_applications_ids)) {
                    return;
                }
                this.$store.commit('pcl_user_applications_ids', applications_ids);
            });

            this.$galtUser.userApplicationsIds('plotValuation').then((applications_ids) => {
                if(_.isEqual(applications_ids, this.pv_user_applications_ids)) {
                    return;
                }
                this.$store.commit('pv_user_applications_ids', applications_ids);
            });

            this.$galtUser.userApplicationsIds('plotCustodian').then((applications_ids) => {
                if(_.isEqual(applications_ids, this.pc_user_applications_ids)) {
                    return;
                }
                this.$store.commit('pc_user_applications_ids', applications_ids);
            });
            
            this.$galtUser.userApplicationsIds('plotEscrow').then((applications_ids) => {
                if(_.isEqual(applications_ids, this.pe_user_applications_ids)) {
                    return;
                }
                this.$store.commit('pe_user_applications_ids', applications_ids);
            });

            this.$galtUser.userApplicationsIds('claimManager').then((applications_ids) => {
                if(_.isEqual(applications_ids, this.cm_user_applications_ids)) {
                    return;
                }
                this.$store.commit('cm_user_applications_ids', applications_ids);
            });

            this.$galtUser.isOracle().then((isOracle) => {
                if(isOracle == this.is_oracle) {
                    return;
                }
                this.$store.commit('is_oracle', isOracle);
            });

            this.$galtUser.hasPlotManagerRole('fee_manager').then((has) => {
                if(has == this.is_plot_manager_fee_manager) {
                    return;
                }
                this.$store.commit('is_plot_manager_fee_manager', has);
            });

            this.$galtUser.hasGaltDexRole('fee_manager').then((has) => {
                if(has == this.is_galt_dex_fee_manager) {
                    return;
                }
                this.$store.commit('is_galt_dex_fee_manager', has);
            });

            this.$galtUser.hasOraclesRole('oracle_manager').then((has) => {
                if(has == this.is_oracle_manager) {
                    return;
                }
                // console.log('is_oracle_manager', has);
                this.$store.commit('is_oracle_manager', has);
            });

            this.$galtUser.hasOraclesRole('roles_manager').then((has) => {
                if(has == this.is_roles_manager) {
                    return;
                }
                // console.log('is_roles_manager', has);
                this.$store.commit('is_roles_manager', has);
            });
        },

        getInternalWalletData() {
            if(!this.internal_wallet) {
                this.$store.commit('internal_wallet_eth_balance', 0);
                this.$store.commit('internal_wallet_galt_balance', 0);
                this.$store.commit('internal_wallet_space_balance', 0);
                return;
            }
            EthData.ethBalance(this.internal_wallet).then((ethBalance) => {
                this.$store.commit('internal_wallet_eth_balance', ethBalance);
            });
            GaltData.galtBalance(this.internal_wallet).then((ethBalance) => {
                this.$store.commit('internal_wallet_galt_balance', ethBalance);
            });
            GaltData.spaceTokensCount(this.internal_wallet).then((spaceBalance) => {
                this.$store.commit('internal_wallet_space_balance', spaceBalance);
            });
        },

        async checkInternalWalletForReleased() {
            const isSpaceApproved = await this.$galtUser.checkAndReleaseApprovedSpaceFromInternal();
            if(isSpaceApproved) {
                this.$waitScreen.show();
                this.$waitScreen.changeCenterText(this.$locale.get('wait_screen.release_rights.space'));
                this.$waitScreen.changeCenterSubText(this.$locale.get('wait_screen.release_rights.tip'));
                await this.$galtUser.waitForReleaseApprovedSpaceFromInternal();
                this.$waitScreen.hide();
            }

            const isApplicationApproved = await this.$galtUser.checkAndReleaseApprovedApplicationFromInternal();
            if(isApplicationApproved) {
                this.$waitScreen.show();
                this.$waitScreen.changeCenterText(this.$locale.get('wait_screen.release_rights.plot_manager'));
                this.$waitScreen.changeCenterSubText(this.$locale.get('wait_screen.release_rights.tip'));
                await this.$galtUser.waitForReleaseApprovedApplicationFromInternal();
                this.$waitScreen.hide();
            }
        },
        destroyWebsocket() {
            if (this.$root.$web3socket) {
                this.$root.$web3socket.onclose = null;
                this.$root.$web3socket.close();
            }
        },
        toggleMenu () {
            this.menuVisible = !this.menuVisible;
            if(!this.menuVisible) {
                setTimeout(() => {
                    this.menuMinimized = true;
                }, 200)
            } else {
                this.menuMinimized = false;
            }
        },
        alternativeServers(){
            this.$root.$asyncModal.open({
                id: 'alternative-servers-modal',
                component: AlternativeServersModal
            });
        },
        changeLanguage(lang){
            if(lang == this.$locale.lang) {
                return;
            }
            this.$store.commit('locale_loaded', false);
            this.$locale.changeLang(lang);
        },
        showChangeLog(){
            GaltData.changelogModal();
        }
    },
    
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        user_space_balance() {
            return this.$store.state.user_space_balance;
        },
        user_galt_balance() {
            return this.$store.state.user_galt_balance;
        },
        pm_user_applications_ids() {
            return this.$store.state.pm_user_applications_ids;
        },
        pv_user_applications_ids() {
            return this.$store.state.pv_user_applications_ids;
        },
        pe_user_applications_ids() {
            return this.$store.state.pe_user_applications_ids;
        },
        pc_user_applications_ids() {
            return this.$store.state.pc_user_applications_ids;
        },
        pcl_user_applications_ids() {
            return this.$store.state.pc_user_applications_ids;
        },
        is_oracle() {
            return this.$store.state.is_oracle;
        },
        is_fee_manager() {
            return this.is_galt_dex_fee_manager || this.is_plot_manager_fee_manager;
        },
        is_galt_dex_fee_manager() {
            return this.$store.state.is_galt_dex_fee_manager;
        },
        is_plot_manager_fee_manager() {
            return this.$store.state.is_plot_manager_fee_manager;
        },
        internal_wallet() {
            return this.$store.state.internal_wallet;
        },
        internal_wallet_active() {
            return this.$store.state.internal_wallet_active;
        },
        internal_wallet_eth_balance() {
            return this.$store.state.internal_wallet_eth_balance;
        },
        internal_wallet_galt_balance() {
            return this.$store.state.internal_wallet_galt_balance;
        },
        internal_wallet_space_balance() {
            return this.$store.state.internal_wallet_space_balance;
        },
        altServersExists() {
            return GaltData.altRpcServers().length;
        },
        languageList() {
            this.$store.state.locale;
            return this.$locale.get('navbar.language.list');
        }
    },
    data() {
        return {
            loading: true,
            version: GaltData.version(),
            showMetamaskNotActive: false,
            registryOwner: null,
            language: null,
            ownerOfParcels: [],
            rpcServer: GaltData.rpcServer(),
            menuVisible: false,
            menuMinimized: true
        }
    },
}
