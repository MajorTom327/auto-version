import { setFailed, getInput } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { compose, join, props, evolve, inc, assoc } from "ramda";
import { Gh } from "./Gh";
import * as fs from "fs-extra";

import { Logger } from "@technote-space/github-action-log-helper";
import { match } from "ts-pattern";

const run = async () => {
  const context = new Context();
  const logger = new Logger();

  const gh = new Gh(context, logger);
  const repository = compose(join("/"), props(["owner", "repo"]))(context.repo);

  // if the event that trigger the github action is a tag
  // then the latestVersion is equal to the tag name

  const isTag =
    context.eventName === "push" && context.ref.startsWith("refs/tags/");
  const updatedVersion = await match(isTag)
    .with(true, () => Promise.resolve(context.ref.replace("refs/tags/", "")))
    .otherwise(async () => {
      const latestVersion = gh.getLatestVersion(repository);
      // @ts-expect-error type
      return compose(
        join("."),
        props(["major", "minor", "patch"]),
        evolve({
          patch: inc,
        })
      )(latestVersion);
    });


    return fs
      .readFile("./package.json", "utf8")
      .then((data) => {
        const updatedData = assoc("version", updatedVersion, JSON.parse(data));

        return updatedData;
      })
      .then((updatedPackage) => {
        return fs.writeFile("./package.json", JSON.stringify(updatedPackage));
      })
      .then(() => {
        logger.info(`Updated package.json to version ${updatedVersion}`);
        gh.commit(updatedVersion);
      })
      .then(() => true);
};

run().catch((error) => {
  setFailed(error.message);
});
