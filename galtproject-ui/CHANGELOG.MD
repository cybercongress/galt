## GaltProject UI v0.7.3 (2019-03-??)

The full list of included changes:

- Create community page
- Geo Toolbox:
  - Converting geohash => latLon
  - Calculating area
  - new types: predefined building and room

## GaltProject UI v0.7.2 (2019-02-24)

The full list of included changes:

- User page by address in url:
  - General info tab
  - Oracle tab with parsed description
  - Space tokens tab
  - Reputation tab: moved from separated page
- Link to explorer for every showed address or transaction in interface
- Added predefined Space token type
- Type selector and description inputs in new PlotManager application
- Name, value structure for SpaceToken description and Oracle description
- Parse documents hashes and make links
- Show info about grouped Space token by contour on map
- Community page:
  - Properties list
  - Improve voting inputs and output fields
  - Show accepted and rejected proposals
- Show oracle info on hover
  
## GaltProject UI v0.7.1 (2019-02-17)

The full list of included changes:

- Voting in community:
  - Voting contracts pages
  - Create proposal with dynamically generated inputs
  - Show proposals by contracts with dynamically generated outputs
  - Accept or decline proposal, trigger approve or reject on enough share
- Community member reputation:
  - Delegations view
  - Control reputation by delegate and revoke functions

## GaltProject UI v0.7.0 (2019-02-11)

The full list of included changes:

- Show space token info and coordinates on click on map
- New color scheme
- Area calculation based on utm coordinates
- Space lockers:
  - Reputation page with Space lockers list
  - Create Space locker page
  - Space locker page with communities list
- Communities:
  - Communities list in Reputation page
  - Join and exit community by Space locker page
  - Make join requests if community is private
  - Communities registry page
  - Community page:
    - Overview tab with members table
    - Space tokens tab
    - Join/Exit tab
    - Join requests tab
    - Whitelist contracts tab
- Migrate to new PlotManager version: caching geohashes before submit the application, get fee based on area
- Fix overlay of grey and green contours on map
- Fix custodians applications
  
## GaltProject UI v0.6.3 (2019-01-18)
 
The full list of included changes:

- Support 0.6.1 contracts version:
  - New PlotManager version with mint on approve
  - New PlotCustodian version:
    - Multiple custodians
    - Accepting by previous custodians
  - New contract: SpaceCustodianRegistry for get result custodians
  - New SplitMergeSandbox contract with free permissions
- Use geo-explorer data for show Space tokens in field of view

## GaltProject UI v0.6.2 (2018-12-30)

The full list of included changes:

- Support 0.6.0 contracts version:
  - Fixes and names migration
  - Multiple multiSigs for claim manager applications
  - Multiple multiSigs for validator stakes in personal cabinet
- Add experimental caching of few callMethod responses
- Add supporting of future multiple networks

## GaltProject UI v0.6.1 (2018-12-17)

The full list of included changes:

- Extensions section
- Split-Merge Sandbox extension:
  - Working with sandbox contracts(SpaceToken Sandbox and SplitMerge Sandbox)
  - Set SpaceSplitOperation contract address to url on split begin for getting info and analysis input and output by open url
  - Show input and output contours by buttons after SpaceSplitOperation finished
- SpaceDex removed
- PlotEscrow renamed to Land and real estate marketplace
- ClaimManager Chat
- Support 0.5.0 contracts version


## GaltProject UI v0.6.0 (2018-12-10)

The full list of included changes:

- New split interface for using SpaceSplitOperation contract
- Switch to websockets and https
- Restrict gas price for don't achieve 100 gwei
- Add support of ethereum.enable()

## GaltProject UI v0.5.1 (2018-11-28)

The full list of included changes:

- Migrate to new PlotManager version
- Migrate to new ClaimManager version
- Option "Show only current" for Space token page
- Upgrade space-renderer package to new version
- New color scheme

## GaltProject UI v0.5.0 (2018-11-06)

The full list of included changes:

- Add PlotClarificationManager contract:
  - Make an application for clarification of level, contour and heights
  - Validate application with highlighting current and new contour of SpaceToken
  - Withdraw token
- Migrate to new contracts version:
  - Fix get validators roles

## GaltProject UI v0.4.0 (2018-10-25)

The full list of included changes:

- Add ClaimManager contract:
  - Make an application for Dispute in My applications page
  - Lock and creating multiple proposals for application by validators in Applications for review page
  - Vote for proposals and mark voted proposals
  - Show blame and voters lists in popup
  - Personal cabinet with show and add validator stakes
- Small fixes:
  - Validator/Custodian info on click working again
  - Wrong network screen now should displaying correctly
- Add loading bar to changelog modal
- Handle Space token not found error and show attention

## GaltProject UI v0.3.0 (2018-10-22)

The full list of included changes:

- Migrate to contracts version 0.3.0:
  - Remove pledges
  - Rework ApplyForPlotOwnership function
  - Remove country
- Add level and heights to SpaceTokens
- Change SpaceToken types to "Land plot" and "Building, floor №..."
- Add page for create PlotManager applications for buildings
- Add Space token page info 
  - 3D view of related Land plots and Buildings
  - Map of related Land plots and Buildings
- Rework headers of Space tokens and Space applications cards to colored
  
## GaltProject UI v0.2.0 (2018-10-14)

The full list of included changes:

- Removed geohashes conception as content of land plots:
  - Removed buttons for operations with geohashes
  - Removed render geohashes inside contour
- Split and merge of packages:
  - Page for split land plot by subtract contour
  - Page for merge land plot by add contour
- Added area indicator of land plots
- Added sorting of contours by clockwise
- Added draw contours for plots
- Migrate from local Geohash lib to using [@galtproject/utils](https://github.com/galtspace/galtproject-utils-js) v0.7.0
  - May cause some bugs of old functional, need to test
- Small fixes:
  - Fix resubmit application after subtract geohashes(problem with negative fee)
  - Add checking for enough balance in creating PlotEscrow application
  - Fix confirming of PlotEscrow application when Custodian already attached
  - Fix some locales
  - Fix leaflet scroll map on click

## GaltProject UI v0.1.0 (2018-10-07)

The full list of included changes:

- PlotEscrow:
  - Place order to PlotEscrow with initial price and documents
    - Choose ERC20 token of price: GALT, DAI or custom
  - Page with orders of seller:
    - Select buyers, change the ask price for buyers
    - Attach Space token
    - Resolve deal and get payment
  - Page with open orders, and orders which user have to buy:
    - Place bids, change bids
    - Attach payment
    - Resolve deal and get Space token
  - Register custodian through PlotEscrow on offer resolve
- SpaceDex and PlotEscrow now in pages Buy Space and Sell Space with descriptions
- Added attention about not active MetaMask - not installed or dont login
- Fix duplicates in custodian list
- Fix get reward for validators in custodian applications
- Fix Space token types select in My territory

## GaltProject UI v0.0.3 (2018-10-01)

The full list of included changes:

- Add loading bars and count labels in pages:
  - My applications
  - My Land Plots
  - Applications for review
  - SpaceDex
- Claim gas deposit of PlotManager applications by validator or applicant
- Edit details of PlotManager applications
- Input for search by geohashes and tokenIds
  
## GaltProject UI v0.0.2 (2018-09-28)

The full list of included changes:

- Versioning of project:
  - Specify first version: v0.0.2
  - Provide CHANGELOG.MD HTML representation to interface via webpack
  
## GaltProject UI v0.0.1 (2018-09-27)

The full list of included changes:

- PlotManager:
  - Create and validate applications
  - Get rewards for validators
  - Administrate of contract
- Territory of user:
  - List of SpaceTokens
  - Split Pack to geohashes
  - Merge geohashes to pack
  - Transfer SpaceTokens to users
- PlotValuating:
  - Create and validate applications
- PlotCustodian:
  - Create and validate applications
- SpaceDex:
  - Sale territory by list
  - Buy territory by list
  - Administrate of contract:
    - Change and get fee
    - Show operations info
- GaltDex:
  - Exchange ETH to GALT and vice versa
- Validators:
  - Show validators with info in each application
  - Show validator info in popup on click
  - Administrate of contract:
    - Edit validators and roles by applications types
- Multi-language interface
