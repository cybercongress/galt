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
import Explorer from "../../../Explorer/Explorer";
import {EventBus, EXPLORER_DRAW_SPACE_TOKEN, EXPLORER_DRAW_SPACE_TOKENS_LIST} from "../../../../services/events";

import SpaceTokenCard from "../../../../directives/SpaceTokenCard/SpaceTokenCard";
import ProposalControl from "../../directives/ProposalControl/ProposalControl";

const pIteration = require('p-iteration');

export default {
    name: 'sra-new-member-proposals-page',
    template: require('./SraNewMemberProposalsPage.html'),
    components: {Explorer, SpaceTokenCard, ProposalControl},
    async created() {
        
    },
    async mounted() {
        await this.getSpaceTokensList();
    },
    methods: {
        async getSpaceTokensList() {
            this.loading = true;
            this.sraContract = await this.$fundsRegistryContract.getSRAByAddress(this.$route.params.sraAddress);
            this.proposalManagerContract = await this.sraContract.storage.getNewMemberProposalContract();
            const proposals = await this.proposalManagerContract.getActiveProposals();
            this.proposalsCount = await this.proposalManagerContract.getActiveProposalsCount();
            this.joinRequests = await pIteration.map(proposals, async (proposal) => {
                return {
                    loading: false,
                    proposal: proposal,
                    spaceToken: await GaltData.getSpaceTokenObjectById(proposal.spaceTokenId)
                };
            });
            this.loading = false;
        },
        showSpaceToken(spaceToken) {
            EventBus.$emit(EXPLORER_DRAW_SPACE_TOKEN, spaceToken);
        },
        
        getLocale(key, options?) {
            return this.$locale.get(this.localeKey + "." + key, options);
        }
    },
    watch: {
        
    },
    computed: {
        
    },
    data() {
        return {
            localeKey: 'reputation.sra_section.new_member_proposals_page',
            loading: true,
            proposalsCount: null,
            proposalManagerContract: null,
            joinRequests: []
        }
    }
}
