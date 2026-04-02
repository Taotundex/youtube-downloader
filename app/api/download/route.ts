import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const format = searchParams.get('format');

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  if (!ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    console.log('Starting download for URL:', url);
    const info = await ytdl.getInfo(url);
    console.log('Got info for video:', info.videoDetails.title);
    const rawTitle = info.videoDetails.title || 'video';
    const videoTitle = rawTitle.replace(/[^\w\s\-_.]/gi, '').slice(0, 80) || 'video';

    let options: any = {
      quality: 'highest',
      filter: 'audioandvideo',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      },
      highWaterMark: 1024 * 1024, // 1MB buffer
    };

    if (format === 'lowest') {
      options = { ...options, quality: 'lowest' };
    } else if (['144p', '360p', '480p', '720p', '1080p'].includes(format || '')) {
      options = { ...options, quality: format };
    }

    console.log('Creating stream with options:', options);
    const stream = ytdl.downloadFromInfo(info, options);
    stream.on('error', (err) => {
      console.error('ytdl stream error:', err);
    });

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
    headers.set('Content-Type', 'video/mp4');

    console.log('Returning response');
    // Node Readable stream is not assignable to Web ReadableStream for TypeScript, but Next.js supports Node streams in route handlers in nodejs runtime.
    // @ts-ignore
    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error('Error downloading video route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process video', details: message }, { status: 500 });
  }
}
