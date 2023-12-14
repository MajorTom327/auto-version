import { Context } from "@actions/github/lib/context";
import type { Octokit } from "@technote-space/github-action-helper/dist/types";
import { Logger } from "@technote-space/github-action-log-helper";
export declare class Gh {
    octokit: Octokit;
    context: Context;
    logger: Logger;
    constructor(context: Context, logger: Logger);
    getLatestVersion(repository: string): Promise<{
        major: number;
        minor: number;
        patch: number;
    }>;
    commit(version: string): Promise<void>;
}
