import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
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
import { match } from "ts-pattern";

export class Gh {
  octokit: Octokit;

  context: Context;
  logger: Logger;

  constructor(context: Context, logger: Logger) {
    const token = match(process.env.NODE_ENV)
      .with("production", () => getInput("GITHUB_TOKEN"))
      .otherwise(() => process.env.GITHUB_TOKEN as string);
    // @ts-expect-error
    this.octokit = getOctokit(token, {
      timeZone: "Canada/Vancouver",
    });

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
        return this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg(
          {
            org: owner,
            package_type: "npm",
            package_name: repo,
          }
        );
      })
      .then((packages) => {
        // @ts-expect-error
        const latestVersion: { major: number; minor: number; patch: number } =
          compose(
            head,
            sortByProps(["major", "minor", "patch"]),
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
            map(propOr("0.0.0", "name")),
            propOr([], "data")
          )(packages);
        return latestVersion;
      });
  }

  async commit(version: string) {
    const branch = "main";

    const helper = new ApiHelper(this.octokit, this.context, this.logger, {
      refForUpdate: `heads/${branch}`,
      suppressBPError: true,
    });

    await helper.commit(".", `🏷️ Update version to ${version}`, [
      "package.json",
    ]);
  }
}
