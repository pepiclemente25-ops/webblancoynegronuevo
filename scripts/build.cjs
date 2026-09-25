const { execSync } = require('child_process');

// Si NEXT_PRIVATE_STANDALONE está activo, estamos dentro de OpenNext construyendo la app Next.js
if (process.env.NEXT_PRIVATE_STANDALONE === 'true') {
  console.log('--- Construyendo Next.js para OpenNext ---');
  execSync('next build', { stdio: 'inherit' });
} else {
  // Llamada inicial (por ejemplo desde Cloudflare CI): empaquetar para Cloudflare Worker
  console.log('--- Empaquetando Worker para Cloudflare con OpenNext ---');
  execSync('opennextjs-cloudflare build', { stdio: 'inherit' });
}
