import fs from 'fs';
import path from 'path';

const MIME_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

const DEFAULT_LOCAL_DATASET_DIR =
  'C:/Penyimpanan Utama/Materi dan Tugas/dataset lukisan indonesia/indonesian_images/final pick';

async function testImageServing() {
  console.log('Testing image retrieval from local dataset:');
  const filesToTest = ['1.webp', '10.webp', '20.webp', '80.webp'];

  for (const file of filesToTest) {
    const fullPath = path.join(DEFAULT_LOCAL_DATASET_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.error(`✗ File not found: ${file}`);
      process.exit(1);
    }
    const stat = fs.statSync(fullPath);
    console.log(`✓ ${file}: ${stat.size} bytes (readable)`);
  }

  console.log('\nAll sample files verified successfully!');
}

testImageServing();
