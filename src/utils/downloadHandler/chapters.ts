import { DownloadSetHandler } from "./DownloadSet";
import { OngoingDownload } from "./types";

const handleChaptersDownload = async (
  downloadSet: DownloadSetHandler,
  manga: string,
  start: number,
  end: number,
  compression: boolean,
  deleteAfterCompression: boolean
): Promise<void> => {
  const { downloader } = downloadSet;
  const download: OngoingDownload = {
    fullname: `${manga} chapitre ${start} à ${end}`,
    chapter: "chargement...",
    current: 0,
    total: 0,
    percent: 0,
  };
  downloadSet.setCurrentDownload(download);
  await downloader.downloadChapters(manga, start, end, {
    compression,
    deleteAfterCompression,
    callback: (events) => {
      events.on("start", (manga, links) => {
        download.current = 0;
        download.total = links.length;
        downloadSet.setCurrentDownload(download);
      });

      events.on("startchapter", (attributes, pages, current, total) => {
        download.chapter = attributes.chapter;
        download.current = current;
        download.total = total;
        downloadSet.setCurrentDownload(download);
      });

      /* events.on("noimage", (attributes, link) => {
        });
      }); */
      events.on("page", (attributes, total) => {
        // eg: 2 chapitres, chacun 10 pages
        const chapterPortion = 100 / download.total;
        const pagePortion = chapterPortion / total;
        download.percent =
          chapterPortion * (download.current - 1) +
          pagePortion * +attributes.page;
        console.log(attributes, total);
        downloadSet.setCurrentDownload(download);
      });
      /* if (compression) {
        events.on("compressing", () => {
        });
        events.on("compressed", (attributes, path, stats) => {
        });
      } */
      events.on("done", () => {
        downloadSet.clearCurrentDownload();
      });
    },
  });
};

export default handleChaptersDownload;
