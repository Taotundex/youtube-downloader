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
    };

    if (format === 'lowest') {
      options = { ...options, quality: 'lowest' };
    } else if (['144p', '360p', '480p', '720p', '1080p'].includes(format || '')) {
      options = { ...options, quality: format };
    }

    const formatInfo = ytdl.chooseFormat(info.formats, options);
    console.log('Chosen format:', formatInfo.qualityLabel, formatInfo.url);

    // Return the URL for the client to download
    return NextResponse.json({ downloadUrl: formatInfo.url, filename: `${videoTitle}.mp4` });
  } catch (error) {
    console.error('Error downloading video route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process video', details: message }, { status: 500 });
  }
}
