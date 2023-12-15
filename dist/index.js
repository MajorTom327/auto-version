"use strict";var e=require("@actions/core"),t=require("@actions/github/lib/context"),r=require("ramda"),o=require("@actions/github"),s=require("@technote-space/github-action-helper"),a=require("ramda-adjunct"),i=require("fs-extra"),n=require("@technote-space/github-action-log-helper"),c=require("ts-pattern");function p(e){var t=Object.create(null);return e&&Object.keys(e).forEach((function(r){if("default"!==r){var o=Object.getOwnPropertyDescriptor(e,r);Object.defineProperty(t,r,o.get?o:{enumerable:!0,get:function(){return e[r]}})}})),t.default=e,Object.freeze(t)}var g=p(i);class h{octokit;context;logger;constructor(t,r){const s=e.getInput("GITHUB_TOKEN");this.octokit=o.getOctokit(s,{}),this.context=t,this.logger=r}async getLatestVersion(e){const[t,o]=e.split("/");return this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({package_type:"npm",package_name:o}).then((e=>e)).catch((e=>(this.logger.warn(e.message),this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({org:t,package_type:"npm",package_name:o})))).then((e=>{const t=r.compose(r.tap((e=>this.logger.info(JSON.stringify(e)))),r.head,r.tap((e=>this.logger.info(JSON.stringify(e)))),a.sortByProps(["major","minor","patch"]),r.tap((e=>this.logger.info(JSON.stringify(e)))),r.map(r.applySpec({major:r.compose(parseInt,r.nth(0),r.split(".")),minor:r.compose(parseInt,r.nth(1),r.split(".")),patch:r.compose(parseInt,r.nth(2),r.split("."))})),r.tap((e=>this.logger.info(JSON.stringify(e)))),r.map(r.propOr("0.0.0","name")),r.tap((e=>this.logger.info(JSON.stringify(e)))),r.propOr([],"data"),r.tap((e=>this.logger.info(JSON.stringify(e)))))(e);return this.logger.info(`Latest version is ${t.major}.${t.minor}.${t.patch}`),t}))}async commit(t){const r="main";this.logger.info(`Committing to branch ${r}, version ${t}`);const o=new s.ApiHelper(this.octokit,this.context,this.logger,{refForUpdate:`heads/${r}`,suppressBPError:!0}),a=s.Utils.getWorkspace();await o.commit(a,`🏷️ Update version to ${t}`,["package.json"]),e.setOutput("sha",process.env.GITHUB_SHA+"")}}(async()=>{const e=new t.Context,o=new n.Logger,s=new h(e,o),a=r.compose(r.join("/"),r.props(["owner","repo"]))(e.repo),i="push"===e.eventName&&e.ref.startsWith("refs/tags/")&&!1,p=await c.match(i).otherwise((async()=>{const e=s.getLatestVersion(a);return r.compose(r.join("."),r.props(["major","minor","patch"]),r.evolve({patch:r.inc}))(e)}));return g.readFile("./package.json","utf8").then((e=>r.assoc("version",p,JSON.parse(e)))).then((e=>g.writeFile("./package.json",JSON.stringify(e)))).then((()=>{o.info(`Updated package.json to version ${p}`),s.commit(p)})).then((()=>!0))})().catch((t=>{e.setFailed(t.message)}));
