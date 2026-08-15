import { spawnSync } from "node:child_process";

const branchKind = process.env.FUSION_BRANCH_KIND;

function runCommand(args) {
  const isWindows = process.platform === "win32";
  const npmCommand = isWindows ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, args, {
    env: process.env,
    shell: isWindows,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  return result.status ?? 1;
}

if (branchKind !== "feature" && branchKind !== "main") {
  console.warn(
    `Skipping database migrations because FUSION_BRANCH_KIND is ${branchKind ?? "unset"}`,
  );

  const seedExitCode = runCommand(["exec", "tsx", "server/prisma/seed.ts"]);
  process.exit(seedExitCode);
}

if (!process.env.DATABASE_URL_UNPOOLED) {
  console.warn(
    "Skipping database migrations because DATABASE_URL_UNPOOLED is not set",
  );

  const seedExitCode = runCommand(["exec", "tsx", "server/prisma/seed.ts"]);
  process.exit(seedExitCode);
}

const migrationExitCode = runCommand(["run", "db:migrate"]);

if (migrationExitCode !== 0) {
  process.exit(migrationExitCode);
}

const seedExitCode = runCommand(["exec", "tsx", "server/prisma/seed.ts"]);
process.exit(seedExitCode);
