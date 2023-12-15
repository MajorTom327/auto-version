"use strict";var e=require("@actions/core"),t=require("@actions/github/lib/context"),r=require("ramda"),o=require("@actions/github"),a=require("@technote-space/github-action-helper"),s=require("ramda-adjunct"),n=require("fs-extra"),i=require("@technote-space/github-action-log-helper");function c(e){var t=Object.create(null);return e&&Object.keys(e).forEach((function(r){if("default"!==r){var o=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(t,r,o.get?o:{enumerable:!0,get:function(){return e[r]}})}})),t.default=e,Object.freeze(t)}var p=c(n);class g{octokit;context;logger;constructor(t,r){const a=e.getInput("GITHUB_TOKEN");this.octokit=o.getOctokit(a,{}),this.context=t,this.logger=r}async getLatestVersion(e){const[t,o]=e.split("/");return this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({package_type:"npm",package_name:o}).then((e=>e)).catch((e=>(this.logger.warn(e.message),this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({org:t,package_type:"npm",package_name:o})))).then((e=>{const t=r.compose(r.head,r.reverse,s.sortByProps(["major","minor","patch"]),r.map(r.applySpec({major:r.compose(parseInt,r.nth(0),r.split(".")),minor:r.compose(parseInt,r.nth(1),r.split(".")),patch:r.compose(parseInt,r.nth(2),r.split("."))})),r.map(r.propOr("0.0.0","name")),r.propOr([],"data"))(e);return this.logger.info(`Latest version is ${t.major}.${t.minor}.${t.patch}`),t}))}async commit(t){const r="main";this.logger.info(`Committing to branch ${r}, version ${t}`);const o=new a.ApiHelper(this.octokit,this.context,this.logger,{refForUpdate:`heads/${r}`,suppressBPError:!0}),s=a.Utils.getWorkspace();await o.commit(s,`🏷️ Update version to ${t}`,["package.json"]),e.setOutput("sha",process.env.GITHUB_SHA+"")}}(async()=>{const e=new t.Context,o=new i.Logger,a=new g(e,o),s=r.compose(r.join("/"),r.props(["owner","repo"]))(e.repo);let n;if("push"===e.eventName&&e.ref.startsWith("refs/tags/")&&!1)o.info(`Getting latest version for ${s} from tag`),n=e.ref.replace("refs/tags/","");else{o.info(`Getting latest version for ${s} from registry and incrementing patch version`);const e=await a.getLatestVersion(s);n=r.compose(r.join("."),r.props(["major","minor","patch"]),r.evolve({patch:r.inc}))(e)}return p.readFile("./package.json","utf8").then((e=>r.assoc("version",n,JSON.parse(e)))).then((e=>p.writeFile("./package.json",JSON.stringify(e)))).then((()=>{o.info(`Updated package.json to version ${n}`),a.commit(n)})).then((()=>!0))})().catch((t=>{e.setFailed(t.message)}));
