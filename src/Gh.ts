import { getInput, setOutput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { Context } from "@actions/github/lib/context";
import { Utils, ContextHelper } from "@technote-space/github-action-helper";
import type { Octokit } from "@technote-space/github-action-helper/dist/types";
import { ApiHelper } from "@technote-space/github-action-helper";
import { Logger } from "@technote-space/github-action-log-helper";
import {
  applySpec,
  compose,
  head,
  map,
  nth,
  prop,
  propOr,
  split,
  tap,
} from "ramda";
import { sortByProps } from "ramda-adjunct";

export class Gh {
  octokit: Octokit;

  context: Context;
  logger: Logger;

  constructor(context: Context, logger: Logger) {
    const token = getInput("GITHUB_TOKEN");
    // @ts-expect-error
    this.octokit = getOctokit(token, {});

    this.context = context;
    this.logger = logger;
  }

  async getLatestVersion(repository: string) {
    const [owner, repo] = repository.split("/");

    return this.octokit.rest.packages
      .getAllPackageVersionsForPackageOwnedByAuthenticatedUser({
        package_type: "npm",
        package_name: repo,
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        this.logger.warn(err.message);
        return this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg(
          {
            org: owner,
            package_type: "npm",
            package_name: repo,
          }
        );
      })
      .then((packages) => {

        const latestVersion: { major: number; minor: number; patch: number } =
          compose(
            tap(console.log),
            head,
            tap(console.log),
            sortByProps(["major", "minor", "patch"]),
            tap(console.log),
            map(
              applySpec({
                // @ts-expect-error
                major: compose(parseInt, nth(0), split(".")),
                // @ts-expect-error
                minor: compose(parseInt, nth(1), split(".")),
                // @ts-expect-error
                patch: compose(parseInt, nth(2), split(".")),
              })
            ),
            tap(console.log),
            map(propOr("0.0.0", "name")),
            tap(console.log),
            propOr([], "data"),
            tap(console.log)
          )(packages);

        this.logger.info(
          `Latest version is ${latestVersion.major}.${latestVersion.minor}.${latestVersion.patch}`
        );
        return latestVersion;
      });
  }

  async commit(version: string) {
    const branch = "main";

    this.logger.info(`Committing to branch ${branch}, version ${version}`);

    const helper = new ApiHelper(this.octokit, this.context, this.logger, {
      refForUpdate: `heads/${branch}`,
      suppressBPError: true,
    });

    const rootDir = Utils.getWorkspace();

    await helper.commit(rootDir, `🏷️ Update version to ${version}`, [
      "package.json",
    ]);

    setOutput("sha", process.env.GITHUB_SHA + "");
  }
}
