"use strict";var e=require("@actions/core"),t=require("@actions/github/lib/context"),o=require("ramda"),r=require("@actions/github"),a=require("@technote-space/github-action-helper"),s=require("ramda-adjunct"),n=require("fs-extra"),i=require("@technote-space/github-action-log-helper"),c=require("ts-pattern");function p(e){var t=Object.create(null);return e&&Object.keys(e).forEach((function(o){if("default"!==o){var r=Object.getOwnPropertyDescriptor(e,o);Object.defineProperty(t,o,r.get?r:{enumerable:!0,get:function(){return e[o]}})}})),t.default=e,Object.freeze(t)}var g=p(n);class h{octokit;context;logger;constructor(t,o){const a=e.getInput("GITHUB_TOKEN");this.octokit=r.getOctokit(a,{}),this.context=t,this.logger=o}async getLatestVersion(e){const[t,r]=e.split("/");return this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({package_type:"npm",package_name:r}).then((e=>e)).catch((e=>(this.logger.warn(e.message),this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg({org:t,package_type:"npm",package_name:r})))).then((e=>{const t=o.compose(o.tap((e=>this.logger.info(e))),o.head,o.tap((e=>this.logger.info(e))),s.sortByProps(["major","minor","patch"]),o.tap((e=>this.logger.info(e))),o.map(o.applySpec({major:o.compose(parseInt,o.nth(0),o.split(".")),minor:o.compose(parseInt,o.nth(1),o.split(".")),patch:o.compose(parseInt,o.nth(2),o.split("."))})),o.tap((e=>this.logger.info(e))),o.map(o.propOr("0.0.0","name")),o.tap((e=>this.logger.info(e))),o.propOr([],"data"),o.tap((e=>this.logger.info(e))))(e);return this.logger.info(`Latest version is ${t.major}.${t.minor}.${t.patch}`),t}))}async commit(t){const o="main";this.logger.info(`Committing to branch ${o}, version ${t}`);const r=new a.ApiHelper(this.octokit,this.context,this.logger,{refForUpdate:`heads/${o}`,suppressBPError:!0}),s=a.Utils.getWorkspace();await r.commit(s,`🏷️ Update version to ${t}`,["package.json"]),e.setOutput("sha",process.env.GITHUB_SHA+"")}}(async()=>{const e=new t.Context,r=new i.Logger,a=new h(e,r),s=o.compose(o.join("/"),o.props(["owner","repo"]))(e.repo),n="push"===e.eventName&&e.ref.startsWith("refs/tags/")&&!1,p=await c.match(n).otherwise((async()=>{const e=a.getLatestVersion(s);return o.compose(o.join("."),o.props(["major","minor","patch"]),o.evolve({patch:o.inc}))(e)}));return g.readFile("./package.json","utf8").then((e=>o.assoc("version",p,JSON.parse(e)))).then((e=>g.writeFile("./package.json",JSON.stringify(e)))).then((()=>{r.info(`Updated package.json to version ${p}`),a.commit(p)})).then((()=>!0))})().catch((t=>{e.setFailed(t.message)}));
