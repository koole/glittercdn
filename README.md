<div align="center">
<img src="https://glitterbot.appmantle.com/logo.png" width="256px">

# GlitterCDN

### _The central glitter graphics repository_

<br>
<br>
</div>

This repo contains a list of Glitterplaatjes which are used by both Glitterbot for Slack and Glitterbot for Telegram. Changes to this repository are automatically deployed and all Glitterbots will be using 

For more information about Glitterbot, visit the [Glitterbot website](https://glitterbot.appmantle.com/) or the [Glitterbot for Slack](https://github.com/appmantle/glitterbot) GitHub repository.

## Adding new Glitterplaatjes
1. Fork and clone the repo to your own machine.
2. Add your own Glitterplaatjes to the correct folders. Images should not be larger than 2MB, otherwise they won't automatically expand in Slack. To automatically remove bigger images, set `removeBig` to `true` in `cleanup.js`.
3. Install dependencies by running `yarn install` or `npm install`.
4. Run `node cleanup.js` to optimise your newly added Glitterplaatjes and generate an updated `images.json` file.
5. Submit a pull request with your changes to our repository.

