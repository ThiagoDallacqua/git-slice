const minimist = require("minimist");
const path = require("path");
const initializeFolder = require("./cmds/init");
const updateFolderFromMain = require("./cmds/pull");
const updateMainFromFolder = require("./cmds/push");
const showHelp = require("./help");
const { INVALID_ARG_MSG } = require("./constants");

async function parseArgsAndExecute(currentDir, inputArgs) {
  const argv = minimist(inputArgs);
  const { _: [command, ...args], help } = argv;
  if (help) {
    showHelp(command);
    return;
  }

  switch (command) {
    case "init":
      if (argv.repo && argv.folder && args.length) {
        const repo = argv.repo;
        const folders = Array.isArray(argv.folder)
          ? argv.folder
          : [argv.folder];
        const branchName = argv.branch || "master";
        const forkedRepo = args[0];
        const repoName = path.basename(repo);
        const forkedName = path.basename(forkedRepo);
        const folderPaths = folders.map(fd => `${repoName}/${fd}`);
        console.log(
          `Initializing ${forkedName} from ${folderPaths.join(", ")} ...`
        );
        await initializeFolder(
          path.resolve(currentDir, repo),
          folders,
          path.resolve(currentDir, forkedRepo),
          branchName
        );
        console.log(`Successfully forked into ${forkedRepo}`);
      } else {
        console.log(INVALID_ARG_MSG);
        showHelp(command);
      }
      break;
    case "pull":
      await updateFolderFromMain(currentDir);
      break;
    case "push":
      const branchName = argv.branch;
      const commitMsg = argv.message;
      if (branchName && commitMsg) {
        await updateMainFromFolder(currentDir, branchName, commitMsg);
      } else {
        console.log(INVALID_ARG_MSG);
        showHelp(command);
      }
      break;
    default:
      showHelp();
  }
}

module.exports = parseArgsAndExecute;
