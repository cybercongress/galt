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
import Vue from 'vue'
import Router from 'vue-router'
import LandSection from "../components/LandSection/LandSection";
import NewApplicationPage from "../components/LandSection/NewApplicationPage/NewApplicationPage";
import MyApplicationsPage from "../components/LandSection/MyApplicationsPage/MyApplicationsPage";
import ValidateApplicationsPage from "../components/LandSection/ValidateApplicationsPage/ValidateApplicationsPage";
import MyTerritoryPage from "../components/LandSection/MyTerritoryPage/MyTerritoryPage";
import MyTerritoryList from "../components/LandSection/MyTerritoryPage/MyTerritoryList/MyTerritoryList";
import CreateNewPack from "../components/LandSection/MyTerritoryPage/CreateNewPack/CreateNewPack";
import GaltDexPage from "../components/GaltDexPage/GaltDexPage";
import AdminPage from "../components/AdminPage/AdminPage";
import TutorialsPage from "../components/TutorialsPage/TutorialsPage";
import PlotEscrowToBuy from "../components/LandSection/SpaceExchangeSection/BuySpacePage/PlotEscrowToBuy/PlotEscrowToBuy";
import PlotEscrowToSell from "../components/LandSection/SpaceExchangeSection/SellSpacePage/PlotEscrowToSell/PlotEscrowToSell";
import BuySpacePage from "../components/LandSection/SpaceExchangeSection/BuySpacePage/BuySpacePage";
import SellSpacePage from "../components/LandSection/SpaceExchangeSection/SellSpacePage/SellSpacePage";
import SplitPack from "../components/LandSection/MyTerritoryPage/SplitSpaceToken/SplitSpaceToken";
import MergePack from "../components/LandSection/MyTerritoryPage/MergePack/MergePack";
import SpaceTokenPage from "../components/LandSection/SpaceTokenPage/SpaceTokenPage";
import AddBuilding from "../components/LandSection/MyTerritoryPage/AddBuilding/AddBuilding";
import AccountSection from "../components/AccountSection/AccountSection";
import SpaceTokenEditPage from "../components/LandSection/MyTerritoryPage/SpaceTokenEditPage/SpaceTokenEditPage";
import Extensions from "../components/Extensions/Extensions";
import ExtensionsRoutes from "../components/Extensions/router";
import ExtensionsContainer from "../components/Extensions/ExtensionsContainer/ExtensionsContainer";
import ReputationSection from "../components/ReputationSection/ReputationSection";
import ChooseForSpaceLockerPage from "../components/ReputationSection/ChooseForSpaceLockerPage/ChooseForSpaceLockerPage";
import DepositSpaceLockerPage from "../components/ReputationSection/DepositSpaceLockerPage/DepositSpaceLockerPage";
import SpaceLockerPage from "../components/ReputationSection/SpaceLockerPage/SpaceLockerPage";
import SraSection from "../components/ReputationSection/SraSection/SraSection";
import SraSpaceTokensPage from "../components/ReputationSection/SraSection/SraSpaceTokensPage/SraSpaceTokensPage";
import SraOverviewPage from "../components/ReputationSection/SraSection/SraOverviewPage/SraOverviewPage";
import SrasRegistryPage from "../components/ReputationSection/SrasRegistryPage/SrasRegistryPage";
import SraJoinExitPage from "../components/ReputationSection/SraSection/SraJoinExitPage/SraJoinExitPage";
import SraNewMemberProposalsPage
    from "../components/ReputationSection/SraSection/SraNewMemberProposalsPage/SraNewMemberProposalsPage";
import SraWhitelistContractsPage
    from "../components/ReputationSection/SraSection/SraWhitelistContractsPage/SraWhitelistContractsPage";
import SraVotingContractPage
    from "../components/ReputationSection/SraSection/SraVotingContractPage/SraVotingContractPage";
import SraAccount from "../components/ReputationSection/SraSection/SraAccount/SraAccount";
import SraCurrentAccount
    from "../components/ReputationSection/SraSection/SraAccount/SraCurrentAccount/SraCurrentAccount";
import AccountOverviewPage from "../components/AccountSection/AccountOverviewPage/AccountOverviewPage";
import AccountOraclePage from "../components/AccountSection/AccountOraclePage/AccountOraclePage";
import AccountReputationPage from "../components/AccountSection/AccountReputationPage/AccountReputationPage";
import AccountSpaceTokensPage from "../components/AccountSection/AccountSpaceTokensPage/AccountSpaceTokensPage";
import SraVotingOverviewPage
    from "../components/ReputationSection/SraSection/SraVotingContractPage/SraVotingOverviewPage/SraVotingOverviewPage";
import SraVotingFinalizedPage
    from "../components/ReputationSection/SraSection/SraVotingContractPage/SraVotingFinalizedPage/SraVotingFinalizedPage";
import SraFundRulesListPage from "../components/ReputationSection/SraSection/SraFundRulesListPage/SraFundRulesListPage";
import SraFundRulePage from "../components/ReputationSection/SraSection/SraFundRulePage/SraFundRulePage";
import CreateCommunityPage from "../components/ReputationSection/CreateCommunityPage/CreateCommunityPage";
import SraMultisigPage from "../components/ReputationSection/SraSection/SraMultisigPage/SraMultisigPage";
import TechInfo from "../components/TechInfo/TechInfo";

import GaltMultisigRoutes from "@galtproject/frontend-core/components/GaltMultisig/services/routes";
import GaltMultisig from "@galtproject/frontend-core/components/GaltMultisig/GaltMultisig";
import SraMultisigReplenishment
    from "../components/ReputationSection/SraSection/SraMultisigReplenishment/SraMultisigReplenishment";
import SraMultisigReplenishmentTariff
    from "../components/ReputationSection/SraSection/SraMultisigReplenishment/SraMultisigReplenishmentTariff/SraMultisigReplenishmentTariff";
import CreateTariffPage
    from "../components/ReputationSection/SraSection/SraMultisigReplenishment/CreateTariffPage/CreateTariffPage";
import SraMultisigManagersPage
    from "../components/ReputationSection/SraSection/SraMultisigManagersPage/SraMultisigManagersPage";
import SraOverviewGeneralPage
    from "../components/ReputationSection/SraSection/SraOverviewGeneralPage/SraOverviewGeneralPage";

const _ = require('lodash');

Vue.use(Router);

export default new Router({
    //mode: 'history',
    routes: [
        {
            path: '/land',
            name: 'land',
            component: LandSection,
            children: [
                {
                    path: 'new-application',
                    name: 'new-application',
                    component: NewApplicationPage
                },
                {
                    path: 'my-applications',
                    name: 'my-applications',
                    component: MyApplicationsPage
                },
                {
                    path: 'my-applications/resubmit-plot/:applicationId',
                    name: 'my-applications-resubmit-plot',
                    component: SpaceTokenEditPage,
                    props: { mode: 'resubmit_plot' }
                },
                {
                    path: 'plot-clarification/:tokenId',
                    name: 'land-plot-clarification',
                    component: SpaceTokenEditPage,
                    props: { mode: 'clarification' }
                },
                {
                    path: 'my-territory',
                    name: 'my-territory',
                    component: MyTerritoryPage,
                    children: [
                        {
                            path: 'list',
                            name: 'my-territory-list',
                            component: MyTerritoryList
                        },
                        {
                            path: 'new-pack',
                            name: 'my-territory-new-pack',
                            component: CreateNewPack
                        },
                        {
                            path: 'add-building/:tokenId',
                            name: 'my-territory-add-building',
                            component: AddBuilding
                        },
                        {
                            path: 'split-pack/:tokenId',
                            name: 'my-territory-split-pack',
                            component: SplitPack
                        },
                        {
                            path: 'merge-pack/:tokenId',
                            name: 'my-territory-merge-pack',
                            component: MergePack
                        },
                        {
                            path: '*', redirect: '/land/my-territory/list'
                        }
                    ]
                },
                {
                    path: 'space-token/:tokenId/:viewType?',
                    name: 'space-token-page',
                    component: SpaceTokenPage
                },
                {
                    path: 'validate',
                    name: 'validate-proposals',
                    component: ValidateApplicationsPage
                },
                {
                    path: 'buy',
                    name: 'land-buy',
                    component: BuySpacePage
                },
                {
                    path: 'buy/plot-escrow',
                    name: 'land-buy-plot-escrow',
                    component: PlotEscrowToBuy
                },
                {
                    path: 'sell',
                    name: 'land-sell',
                    component: SellSpacePage
                },
                {
                    path: 'sell/plot-escrow',
                    name: 'land-sell-plot-escrow',
                    component: PlotEscrowToSell
                }
            ]
        },
        {
            path: '/galdex',
            name: 'galdex',
            component: GaltDexPage
        },
        {
            path: '/tutorials',
            name: 'tutorials',
            component: TutorialsPage
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminPage
        },
        {
            path: '/account/:userAddress',
            name: 'account',
            component: AccountSection,
            children: [
                {
                    path: 'overview',
                    name: 'account-overview',
                    component: AccountOverviewPage
                },
                {
                    path: 'oracle',
                    name: 'account-oracle',
                    component: AccountOraclePage
                },
                {
                    path: 'reputation',
                    name: 'account-reputation',
                    component: AccountReputationPage
                },
                {
                    path: 'space-tokens',
                    name: 'account-space-tokens',
                    component: AccountSpaceTokensPage
                },
                {
                    path: '*', redirect: 'overview'
                }
            ]
        },
        {
            path: '/reputation',
            name: 'reputation',
            component: ReputationSection,
            children: [
                {
                    path: 'communities-registry',
                    name: 'reputation-sras-registry',
                    component: SrasRegistryPage
                },
                {
                    path: 'create-community/:fundId?',
                    name: 'reputation-create-community',
                    component: CreateCommunityPage
                },
                {
                    path: 'choose-for-space-locker/:lockerAddress?',
                    name: 'reputation-new-space-locker',
                    component: ChooseForSpaceLockerPage
                },
                {
                    path: 'deposit-space-locker/:tokenId/:lockerAddress?',
                    name: 'reputation-deposit-space-locker',
                    component: DepositSpaceLockerPage
                },
                {
                    path: 'space-locker/:lockerAddress',
                    name: 'reputation-space-locker',
                    component: SpaceLockerPage
                },
                {
                    path: 'community/:sraAddress',
                    name: 'reputation-sra',
                    component: SraSection,
                    children: [
                        {
                            path: 'overview',
                            name: 'reputation-sra-overview',
                            component: SraOverviewPage,
                            children: [
                                {
                                    path: 'general',
                                    name: 'reputation-sra-general-overview',
                                    component: SraOverviewGeneralPage
                                },
                                {
                                    path: 'multisig-managers',
                                    name: 'reputation-sra-multisig-managers',
                                    component: SraMultisigManagersPage
                                },
                                {
                                    path: 'space-tokens',
                                    name: 'reputation-sra-tokens',
                                    component: SraSpaceTokensPage
                                },
                                {
                                    path: 'laws',
                                    name: 'reputation-sra-fund-rules',
                                    component: SraFundRulesListPage
                                },
                                {
                                    path: 'laws/:ruleId',
                                    name: 'reputation-sra-fund-rule-page',
                                    component: SraFundRulePage
                                },
                            ]
                        },
                        {
                            path: 'my-reputation',
                            name: 'reputation-sra-current-account',
                            component: SraCurrentAccount
                        },
                        {
                            path: 'member/:accountAddress',
                            name: 'reputation-sra-account',
                            component: SraAccount
                        },
                        {
                            path: 'join-exit',
                            name: 'reputation-sra-join-exit',
                            component: SraJoinExitPage
                        },
                        {
                            path: 'join-requests',
                            name: 'reputation-sra-join-requests',
                            component: SraNewMemberProposalsPage
                        },
                        {
                            path: 'contracts',
                            name: 'reputation-sra-whitelist-contracts',
                            component: SraWhitelistContractsPage
                        },
                        {
                            path: 'multisig',
                            name: 'reputation-sra-multisig',
                            component: GaltMultisig,
                            children: [_.extend(GaltMultisigRoutes[1], {props: {showBackToMultisigs: false, localTabsOn: true}})]
                        },
                        {
                            path: 'multisig-replenishment',
                            name: 'reputation-sra-multisig',
                            component: SraMultisigReplenishment
                        },
                        {
                            path: 'multisig-replenishment/:feeContractAddress',
                            name: 'multisig-replenishment-fee-contract',
                            component: SraMultisigReplenishmentTariff
                        },
                        {
                            path: 'create-tariff',
                            name: 'multisig-create-tariff-contract',
                            component: CreateTariffPage
                        },
                        {
                            path: 'voting/:managerAddress',
                            name: 'reputation-sra-voting',
                            component: SraVotingContractPage,
                            children: [
                                {
                                    path: 'overview',
                                    name: 'reputation-sra-voting-overview',
                                    component: SraVotingOverviewPage
                                },
                                {
                                    path: 'approved',
                                    name: 'reputation-sra-voting-approved',
                                    component: SraVotingFinalizedPage,
                                    props: { proposalsType: 'approved' }
                                },
                                {
                                    path: 'rejected',
                                    name: 'reputation-sra-voting-rejected',
                                    component: SraVotingFinalizedPage,
                                    props: { proposalsType: 'rejected' }
                                }
                            ]
                        }
                    ]
                },
                {
                    path: '*', redirect: '/reputation/account'
                }
            ]
        },
        {
            path: '/extensions',
            name: 'extension',
            component: ExtensionsContainer,
            children: [
                {
                    path: 'list',
                    name: 'extensions-list',
                    component: Extensions
                }
            ].concat(ExtensionsRoutes as [])
        },
        {
            path: '/tech-info',
            name: 'tech-info',
            component: TechInfo
        },
        {
            path: '*', redirect: '/land/new-application'
        }
    ]
})
