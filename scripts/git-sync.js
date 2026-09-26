const { execSync } = require('child_process');

function run(cmd, capture = true) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' }).trim();
  } catch (err) {
    if (capture && err.stdout) console.log(err.stdout);
    if (capture && err.stderr) console.error(err.stderr);
    throw err;
  }
}

async function sync(commitMsg) {
  console.log('=== RAVAN SHIPPING — GitHub Automated Sync ===\n');

  // 1. Verify remote and branch
  const remoteUrl = run('git config --get remote.origin.url');
  const currentBranch = run('git branch --show-current');
  const authorName = run('git config user.name');
  const authorEmail = run('git config user.email');

  console.log(`Repository Remote: ${remoteUrl}`);
  console.log(`Current Branch:    ${currentBranch}`);
  console.log(`Author Config:     ${authorName} <${authorEmail}>`);

  // 2. Check for changes
  const statusOutput = run('git status --porcelain');
  if (!statusOutput) {
    console.log('\nNo uncommitted changes found. Checking remote alignment...');
  } else {
    console.log('\nChanged files detected:');
    console.log(statusOutput);

    // Stage changes
    console.log('\nStaging changes: git add -A');
    run('git add -A');

    // Commit
    const message = commitMsg || `chore(sync): automated sync to GitHub [${new Date().toISOString()}]`;
    console.log(`Creating commit: "${message}"`);
    run(`git commit -m "${message}"`);
  }

  // 3. Push to remote
  console.log(`\nPushing to remote origin/${currentBranch}...`);
  run(`git push origin ${currentBranch}`);
  console.log('Push completed successfully.');

  // 4. Verify remote commit matches local HEAD
  const localHead = run('git rev-parse HEAD');
  const remoteRef = run(`git ls-remote origin refs/heads/${currentBranch}`);
  const remoteHead = remoteRef.split(/\s+/)[0];

  console.log('\n=== Synchronization Verification ===');
  console.log(`Local HEAD:  ${localHead}`);
  console.log(`Remote HEAD: ${remoteHead}`);

  if (localHead === remoteHead) {
    console.log('\n[SUCCESS] Local repository is 100% synchronized with GitHub remote!');
  } else {
    console.warn('\n[WARNING] Local HEAD and Remote HEAD do not match. Please verify your connection.');
  }

  return { remoteUrl, currentBranch, localHead, remoteHead, inSync: localHead === remoteHead };
}

if (require.main === module) {
  const customMessage = process.argv.slice(2).join(' ') || undefined;
  sync(customMessage).catch((e) => {
    console.error('\n[ERROR] Sync failed:', e.message);
    process.exit(1);
  });
}

module.exports = { sync };
