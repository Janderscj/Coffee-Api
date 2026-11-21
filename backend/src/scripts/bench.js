import autocannon from 'autocannon';

const cats = ['Espresso', 'Hot', 'Iced', 'Tea', 'Protein', 'Caffeine Free', 'Pastry'];
const requests = [];
for (const c of cats) {
  for (let p = 1; p <= 3; p++) {
    requests.push({
      method: 'GET',
      path: `/api/menu/browse?category=${encodeURIComponent(c)}&page=${p}&limit=20`,
    });
  }
}

const result = await autocannon({
  url: 'http://localhost:5000',
  connections: 20,
  duration: 15,
  requests,
});

console.log({
  reqPerSec: result.requests.average,
  p50: result.latency.p50,
  p99: result.latency.p99,
  errors: result.errors,
  non2xx: result.non2xx,
});
