import { describe, it, expect } from "vitest";
import { Gh } from "./Gh";
import { compose, evolve, inc, join, props } from "ramda";

describe("Github connector", () => {

  it("Should get the last version of a package from a organization", async () => {
    const gh = new Gh();

    const repository = "CharityCrowd/silkroad-trades";
    // const repository = "formzilla";

    const latestVersion = await gh.getLatestVersion(repository);

    const updatedVersion = compose(
      join("."),
      props(["major", "minor", "patch"]),
      evolve({
        patch: inc,
      })
    )(latestVersion);

    console.log({ latestVersion, updatedVersion });
  });

  it("Should get the last version of a package from a user", async () => {
    const gh = new Gh();

    const repository = "MajorTom327/env-refiner";

    const latestVersion = await gh.getLatestVersion(repository);

    const updatedVersion = compose(
      join("."),
      props(["major", "minor", "patch"]),
      evolve({
        patch: inc,
      })
    )(latestVersion);

    console.log({ latestVersion, updatedVersion });
  });
});
