export const queueName = {
    init: "init_website",
    build: "build_website",
    delete: "delete_website",
}

export const GenerateStatus = {
  PENDING: 'pending',
  QUEUED: 'queued',
  GENERATING: 'generating',
  WAITING_FOR_IMAGES: 'waiting_for_images',
  COMPLETED: 'completed',
  FAILED_CONTENT: 'failed_content',
  FAILED_IMAGES: 'failed_images', 
  FAILED: 'failed',
  DRAFT: 'draft',
  PUBLISHED: 'published' 
} as const;

export type GenerateStatusType = typeof GenerateStatus[keyof typeof GenerateStatus];


export enum ToneImageEnum {
  artSchool = 'artSchool',
  doodle = 'doodle',
  popArt = 'popArt',
  dramatic = 'dramatic',
  neonPunk = 'neonPunk',
  ghibli = 'ghibli',
  corporateFlat = 'corporateFlat',
  manga = 'manga',
  clay3d = 'clay3d',
  vintageFilm = 'vintageFilm',
  realisticPhoto = 'realisticPhoto',
  graphicDesign = 'graphicDesign',
  cinematic = 'cinematic',
  eventPhoto = 'eventPhoto',
  pixelArt = 'pixelArt',
  oilPainting = 'oilPainting',
  isometric3d = 'isometric3d'
}