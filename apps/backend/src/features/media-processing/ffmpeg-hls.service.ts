import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

import { Injectable, Logger } from '@nestjs/common';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
export interface IHlsTranscodeResult {
  readonly outputDir: string;
  readonly masterFileName: string;
  readonly durationSec: number | null;
}

@Injectable()
export class FfmpegHlsService {
  private readonly logger = new Logger(FfmpegHlsService.name);

  async createTempWorkspace(prefix = 'helali-hls-'): Promise<string> {
    return mkdtemp(join(tmpdir(), prefix));
  }

  async removeWorkspace(dir: string): Promise<void> {
    await rm(dir, { recursive: true, force: true });
  }

  async transcodeToHls(inputPath: string, workDir: string): Promise<IHlsTranscodeResult> {
    const outputDir = join(workDir, 'out');
    await mkdir(outputDir, { recursive: true });

    const durationSec = await this.probeDuration(inputPath);
    const variants = this.buildVariantLadder(durationSec);

    const variantPlaylists: string[] = [];

    for (const variant of variants) {
      const playlistName = `${variant.name}.m3u8`;
      const segmentPattern = join(outputDir, `${variant.name}_%03d.ts`);
      const playlistPath = join(outputDir, playlistName);

      await this.runFfmpeg([
        '-y',
        '-i',
        inputPath,
        '-vf',
        `scale=-2:${variant.height}`,
        '-c:v',
        'libx264',
        '-profile:v',
        'main',
        '-preset',
        'veryfast',
        '-b:v',
        variant.videoBitrate,
        '-maxrate',
        variant.videoBitrate,
        '-bufsize',
        variant.bufSize,
        '-c:a',
        'aac',
        '-b:a',
        variant.audioBitrate,
        '-ac',
        '2',
        '-f',
        'hls',
        '-hls_time',
        '4',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        segmentPattern,
        playlistPath,
      ]);

      variantPlaylists.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth},RESOLUTION=${variant.width}x${variant.height}\n${playlistName}`,
      );
    }

    const masterContent = `#EXTM3U\n#EXT-X-VERSION:3\n${variantPlaylists.join('\n')}\n`;
    const masterFileName = 'master.m3u8';
    await writeFile(join(outputDir, masterFileName), masterContent, 'utf8');

    return {
      outputDir,
      masterFileName,
      durationSec,
    };
  }

  private buildVariantLadder(_durationSec: number | null) {
    return [
      {
        name: '360p',
        width: 640,
        height: 360,
        videoBitrate: '800k',
        bufSize: '1200k',
        audioBitrate: '96k',
        bandwidth: 900_000,
      },
      {
        name: '720p',
        width: 1280,
        height: 720,
        videoBitrate: '2500k',
        bufSize: '3750k',
        audioBitrate: '128k',
        bandwidth: 2_800_000,
      },
    ] as const;
  }

  private async probeDuration(inputPath: string): Promise<number | null> {
    try {
      const output = await this.runCommand(this.resolveBinary('ffprobe'), [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        inputPath,
      ]);
      const parsed = Number.parseFloat(output.trim());
      return Number.isFinite(parsed) ? parsed : null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(`ffprobe failed: ${message}`);
      return null;
    }
  }

  private runFfmpeg(args: ReadonlyArray<string>): Promise<void> {
    return this.runCommand(this.resolveBinary('ffmpeg'), args).then(() => undefined);
  }

  private resolveBinary(command: 'ffmpeg' | 'ffprobe'): string {
    if (command === 'ffmpeg') {
      return process.env.FFMPEG_PATH?.trim() || ffmpegStatic || 'ffmpeg';
    }

    return process.env.FFPROBE_PATH?.trim() || ffprobeStatic.path || 'ffprobe';
  }

  private runCommand(command: string, args: ReadonlyArray<string>): Promise<string> {    return new Promise((resolve, reject) => {
      const child = spawn(command, [...args], { windowsHide: true });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on('error', (error) => {
        reject(error);
      });
      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout || stderr);
          return;
        }

        reject(new Error(`${command} exited with code ${code}: ${stderr.slice(-800)}`));
      });
    });
  }
}
