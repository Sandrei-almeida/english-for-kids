/**
 * fetch-lyrics.mjs
 * Busca legendas reais do YouTube para cada música e atualiza songs.json
 * Uso: node scripts/fetch-lyrics.mjs
 */

import { YoutubeTranscript } from 'youtube-transcript';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SONGS_PATH = join(__dirname, '../src/data/songs.json');

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function bumpVersion(version) {
  const parts = version.split('.');
  parts[parts.length - 1] = String(Number(parts[parts.length - 1]) + 1);
  return parts.join('.');
}

async function fetchLyrics(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    return transcript.map(item => ({
      line: item.text.replace(/\n/g, ' ').replace(/\[.*?\]/g, '').trim(),
      start: Math.round(item.offset / 1000 * 10) / 10,   // ms → seconds
      end:   Math.round((item.offset + item.duration) / 1000 * 10) / 10,
    })).filter(l => l.line.length > 0);
  } catch (err) {
    return null;
  }
}

async function main() {
  const data = JSON.parse(readFileSync(SONGS_PATH, 'utf8'));
  let updated = 0;
  let failed = [];

  for (const song of data.songs) {
    if (!song.youtubeUrl) continue;
    const videoId = extractVideoId(song.youtubeUrl);
    if (!videoId) continue;

    process.stdout.write(`⏳ Buscando: ${song.title} (${videoId})...`);
    const lyrics = await fetchLyrics(videoId);

    if (lyrics && lyrics.length > 0) {
      song.lyrics = lyrics;
      updated++;
      console.log(` ✅ ${lyrics.length} linhas`);
    } else {
      failed.push(song.title);
      console.log(` ❌ não encontrou legenda`);
    }

    // Pausa entre requisições para não ser bloqueado
    await new Promise(r => setTimeout(r, 1500));
  }

  if (updated > 0) {
    data.version = bumpVersion(data.version);
    data.metadata.version = data.version;
    data.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    writeFileSync(SONGS_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n✅ songs.json atualizado (versão ${data.version}) — ${updated} música(s)`);
  }

  if (failed.length > 0) {
    console.log(`\n⚠️  Sem legenda: ${failed.join(', ')}`);
    console.log('   (legenda desativada no vídeo ou idioma não disponível)');
  }
}

main().catch(console.error);
