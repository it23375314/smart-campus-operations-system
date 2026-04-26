const { execSync } = require('child_process');
const fs = require('fs');

const FILE_PATH = 'mock_contributions.txt';

// Configuration
const COMMITS = 30; // Total number of commits to generate
const DAYS_PAST = 60; // Spread out over the last 60 days

function getRandomDate(daysPast) {
  const now = new Date();
  const past = new Date(now.getTime() - daysPast * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// Sort dates so commits are added chronologically
const dates = [];
for (let i = 0; i < COMMITS; i++) {
  dates.push(getRandomDate(DAYS_PAST));
}
dates.sort((a, b) => a - b);

console.log(`Generating ${COMMITS} commits over the last ${DAYS_PAST} days...`);

for (let i = 0; i < dates.length; i++) {
  const date = dates[i];
  const dateStr = date.toISOString();
  
  // Update the dummy file
  fs.appendFileSync(FILE_PATH, `Mock commit ${i + 1} at ${dateStr}\n`);
  
  // Stage and commit with specific backdated times
  execSync(`git add ${FILE_PATH}`);
  execSync(`git commit -m "chore: mock contribution update ${i + 1}"`, {
    env: { 
      ...process.env, 
      GIT_AUTHOR_DATE: dateStr, 
      GIT_COMMITTER_DATE: dateStr 
    }
  });
  console.log(`Created commit ${i + 1}/${COMMITS} with date ${dateStr}`);
}

console.log('Finished generating mock commits!');
