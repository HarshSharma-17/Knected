/*
 * githubService.js
 *
 * Handles GitHub repository operations for Knected.
 * Currently responsible for validating a GitHub URL
 * and cloning the repository locally for analysis.
 */

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

/**
 * Clone a GitHub repository.
 *
 * @param {string} githubUrl - Public GitHub repository URL
 * @returns {Promise<object>} - Cloned repository information
 */
const cloneGithubRepository = async (githubUrl) => {
  // Validate GitHub URL
  if (!githubUrl || typeof githubUrl !== "string") {
    throw new Error("GitHub repository URL is required");
  }

  let url;

  try {
    url = new URL(githubUrl);
  } catch (error) {
    throw new Error("Invalid GitHub repository URL");
  }

  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
    throw new Error("Only GitHub repository URLs are supported");
  }

  // Extract owner and repository name
  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = parts[0];
  const repoName = parts[1].replace(/\.git$/, "");

  // Create temporary directory
  const tempDirectory = path.join(
    __dirname,
    "../temp"
  );

  await fs.promises.mkdir(tempDirectory, {
    recursive: true,
  });

  // Create unique folder for this repository
  const cloneFolder = `${repoName}-${Date.now()}`;

  const clonePath = path.join(
    tempDirectory,
    cloneFolder
  );

  console.log("GitHub repository:", `${owner}/${repoName}`);
  console.log("Cloning repository...");
  console.log("Clone path:", clonePath);

  try {
    // Clone repository using Git
    await execFileAsync("git", [
      "clone",
      "--depth",
      "1",
      githubUrl,
      clonePath,
    ]);

    console.log("GitHub repository cloned successfully");

    return {
      success: true,
      owner,
      repoName,
      githubUrl,
      localPath: clonePath,
    };
  } catch (error) {
    console.error("GitHub clone error:", error.message);

    // Remove partially cloned folder if cloning failed
    try {
      await fs.promises.rm(clonePath, {
        recursive: true,
        force: true,
      });
    } catch (cleanupError) {
      console.error(
        "Clone cleanup error:",
        cleanupError.message
      );
    }

    throw new Error(
      "Failed to clone GitHub repository"
    );
  }
};

module.exports = {
  cloneGithubRepository,
};