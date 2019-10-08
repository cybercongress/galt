module.exports = {
    version: process.env.VERSION,
    rpcServer: process.env.RPC_SERVER,
    rpcServerId: process.env.RPC_SERVER_ID,
    wsServer: process.env.WS_SERVER,
    altRpcServers: process.env.ALT_RPC_SERVERS,
    contractsConfigUrl: process.env.CONTRACTS_CONFIG_URL,
    defaultLang: process.env.DEFAULT_LANG || 'en',
    geoExplorerUrl: process.env.GEO_EXPLORER,
    contractsDeploymentId: process.env.CONTRACTS_DEPLOYMENT_ID,
    enableWebSocket: true,
    explorerTxUrl: 'https://explorer.testnet.galtproject.io/tx/',
    explorerAddressUrl: 'https://explorer.testnet.galtproject.io/address/'
};
