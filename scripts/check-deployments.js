const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    https.get({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      headers: { 'User-Agent': 'NodeJS' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    const deployments = await get('https://api.github.com/repos/hg982567-cell/antigravity-project/deployments?per_page=5');
    if (!Array.isArray(deployments)) {
      console.log('Deployments response:', deployments);
      return;
    }
    console.log(`Found ${deployments.length} deployments:`);
    for (const d of deployments) {
      const statuses = await get(d.statuses_url);
      console.log(`Deployment ID: ${d.id} | SHA: ${d.sha.slice(0, 7)} | Created: ${d.created_at}`);
      if (Array.isArray(statuses)) {
        statuses.forEach(s => {
          console.log(`  State: ${s.state} | Target: ${s.target_url} | Desc: ${s.description}`);
        });
      }
    }
  } catch (err) {
    console.error('Error fetching deployments:', err);
  }
})();
