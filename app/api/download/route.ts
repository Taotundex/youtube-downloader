import { NextRequest, NextResponse } from 'next/server';
import * as play from 'play-dl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const format = searchParams.get('format');

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  if (play.yt_validate(url) !== 'video') {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    console.log('Starting download for URL:', url);
    const info = await play.video_info(url);
    console.log('Got info for video:', info.video_details.title);
    const rawTitle = info.video_details.title || 'video';
    const videoTitle = rawTitle.replace(/[^\w\s\-_.]/gi, '').slice(0, 80) || 'video';

    const stream = await play.stream(url);
    console.log('Got stream URL:', (stream as any).url);

    // Return the URL for the client to download
    return NextResponse.json({ downloadUrl: (stream as any).url, filename: `${videoTitle}.mp4` });
  } catch (error) {
    console.error('Error downloading video route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to process video', details: message }, { status: 500 });
  }
}
