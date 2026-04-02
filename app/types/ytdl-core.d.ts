declare module 'ytdl-core' {
  import { Readable } from 'stream';

  interface VideoDetails {
    title: string;
    lengthSeconds: string;
    videoId: string;
    author: {
      name: string;
    };
    // Add other properties as needed
  }

  interface VideoInfo {
    videoDetails: VideoDetails;
    formats: Array<{
      itag: number;
      qualityLabel?: string;
      container: string;
      hasVideo: boolean;
      hasAudio: boolean;
    }>;
  }

  interface downloadOptions {
    quality?: string | number | string[];
    filter?: 'audioandvideo' | 'video' | 'audio' | ((format: any) => boolean);
    format?: any;
    range?: {
      start: number;
      end: number;
    };
  }

  function getInfo(url: string, options?: any): Promise<VideoInfo>;
  function download(url: string, options?: downloadOptions): Readable;

  export = { getInfo, download };
}