import { setFailed, getInput } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { compose, join, props, evolve, inc, assoc } from "ramda";
import { Gh } from "./Gh";
import * as fs from "fs-extra";

import { Logger } from "@technote-space/github-action-log-helper";

const run = async () => {
  const context = new Context();
  const logger = new Logger();

  const gh = new Gh(context, logger);

  const repository = compose(join("/"), props(["owner", "repo"]))(context.repo);
  const latestVersion = await gh.getLatestVersion(repository);

  // @ts-expect-error type
  const updatedVersion = compose(
    join("."),
    props(["major", "minor", "patch"]),
    evolve({
      patch: inc,
    })
  )(latestVersion);

  fs.readFile("./package.json", "utf8")
    .then((data) => {
      const updatedData = assoc("version", updatedVersion, JSON.parse(data));

      return updatedData;
    })
    .then((updatedPackage) => {
      return fs.writeFile("./package.json", JSON.stringify(updatedPackage));
    })
    .then(() => {});
};

run().catch((error) => {
  setFailed(error.message);
});
