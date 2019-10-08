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

import AdminOracles from "./AdminOracles/AdminOracles";
import AdminOraclesRoles from "./AdminOraclesRoles/AdminOraclesRoles";
import AdminGaltDex from "./AdminGaltDex/AdminGaltDex";
import AdminGalt from "./AdminGalt/AdminGalt";
import AdminPlotManager from "./AdminPlotManager/AdminPlotManager";
import AdminSpaceDex from "./AdminSpaceDex/AdminSpaceDex";

export default {
    name: 'admin-page',
    template: require('./AdminPage.html'),
    components: {AdminOracles, AdminOraclesRoles, AdminGaltDex, AdminSpaceDex, AdminGalt, AdminPlotManager},
    created() {

    },
    mounted() {
        
    },
    beforeDestroy() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
    },
    methods: {
        
    },
    watch: {
        
    },
    data() {
        return {
            intervals: []
        };
    },
    computed: {
        user_wallet() {
            return this.$store.state.user_wallet;
        },
        is_galt_dex_fee_manager() {
            return this.$store.state.is_galt_dex_fee_manager;
        },
        is_plot_manager_fee_manager() {
            return this.$store.state.is_plot_manager_fee_manager;
        }
    },
}
