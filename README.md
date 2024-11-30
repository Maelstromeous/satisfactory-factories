# Satisfactory Factories
This [web tool](https://satisfactory-factories.app/) is designed to help players of the video game Satisfactory&trade; to plan a comprehensive production chain.

The tool highlights bottlenecks in the production chain, and visually tells the player that they have a problem within their designs.

The player can scale up end product factories as they see fit, and check if their production chain can handle the increased load.

## Contributing
Since this is an open source project, all PR requests will be welcomed, as long as proper intent and communication with the project maintainers is maintained.

___
## Local Development
This project has the following requirements:
- Node.js version >20.17.0
- pnpm version >9.14.4
- Docker (for the backend)

### Frontend
1. `cd web`
2. `pnpm install` Recommend brew for this `brew install pnpm@9.14.4`
3. `pnpm dev`

Visit http://localhost:3000 to view the project.

#### Testing
There are tests for the frontend project, run them with `pnpm test`. Tests must pass for PRs to be accepted. Note as of writing the coverage isn't 100%.

### Parsing
The parser is responsible for processing the `Docs.json` from the game and reconstructing a more readable version for our use, since the game's docs file is overwhelmingly large and not very human-readable. The file is located under `X\steamapps\common\Satisfactory\CommunityResources` on Windows. Replace X with where you have installed your steam library.

#### Running the parser and updating the gameData
To run the parser:

```sh
cd parsing
pnpm install
pnpm dev
```

When the parser is run, it outputs to file `/parser/gameData.json`. This file needs copying to `/web/public/gameData_v1.x-xx.json`. The version must directly correlate with the minor version of the game (unless a patch messes with a recipe, unlikely). e.g. `v1.0-11.json` would increment to `v1.0-12.json`. The old version needs deleting when you commit.

Once the new file has been placed, you must also edit `/web/src/config/config.ts` and update the version there too.

This instructs web clients to re-download the game data file with the new version upon refresh and replace their locally stored version.

### Backend
Required for the login and syncing of data features, not required for local development.
1. Start Docker service on your local machine.
2. `cd backend`
3. `./start.sh`

API will be available on http://localhost:3001.

There are no tests currently available for the backend project.

### Deployment
New versions are trunked to `main` branch, once `main` has been pushed, GitHub Actions will create a release then deploy the frontend to Vercel, and create a docker image of the backend to deploy to my personal server.
___

## License
This project is licensed under the GNU License - see the [LICENSE](LICENSE) file for details.

Please kindly consider opening PRs to improve the project, and make it better for everyone rather than making a clone.

## Acknowledgements
- Many thanks to [Greeny (creator of satisfactory-tools)](https://github.com/greeny/SatisfactoryTools) for collating all the game assets required to display the various icons for items and buildings.
- Thanks to the author of [Satisfactory Logistics](https://satisfactory-logistics.xyz), who gave me the inspiration to extend what they did but even further.
