## Step-by-Step Instructions and Checklist

- [ ] Make sure you run `pnpm rebrand` from the root directory to rebrand your repo.
- [ ] Run `yarn gen`, and follow prompts to generate new package, or server / client components for your library
- [ ] 🌟 Enable [private vulnerability reporting](https://github.com/turboforge-dev/turboforge/security)
- [ ] Set up `CodeCov`
  - Visit Codecov and set up your repo
  - Create [repository secret]((https://github.com/turboforge-dev/turboforge/settings/secrets/actions)) for `CODECOV_TOKEN`
- [ ] Add `NPM_AUTH_TOKEN` to repository secrets to automate package publishing
  - Log in to your [`npm` account](https://www.npmjs.com/login) and create an automation token
  - Create a new repository or organization secret `NPM_AUTH_TOKEN`
- [ ] Update descriptions in `packages/*/package.json`
- [ ] (Optional) Add Repo Stats by visiting and setting up [repobeats](https://repobeats.axiom.co/)
- [ ] Create your libraries and update examples
- [ ] Update READMEs as required
- [ ] (Optional) Set up [Deepsource](https://app.deepsource.com/login) for static code analysis
- [ ] Push your changes/Create PR and see your library being automatically tested and published
- [ ] Optionally deploy your apps/web to Vercel.
- [ ] Feel free to star this template, contribute, and/or sponsor the [`terbo-forge`](https://github.com/turboforge-dev/turboforge) project or my [other open-source work](https://github.com/sponsors/mayank1513)
- [ ] You can also fork the [`terbo-forge`](https://github.com/turboforge-dev/turboforge/fork) and add your package to `scripts/featured.json`
  - If approved, your package will be automatically added to FEATURED.md and also published on the home page of this repo.

## Recommended Repository Settings

Go to [repository settings] and configure the following:
- [ ] Enable Discussions
- [ ] Enable `Always suggest updating pull request branches`
- [ ] Enable `Automatically delete head branches`

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://mayank-chaudhari.vercel.app" target="_blank">Mayank Kumar Chaudhari</a></p>
