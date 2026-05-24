export interface TourObject {
  id: number;
  name: string;
  type: string;
  description: string;
  imageUrl: string | null;
  audioUrl: string | null;
  latitude: number;
  longitude: number;
  nfcId: string | null;
}

export interface GeoZone {
  id: number;
  zoneName: string;
  radius: number;
  latitude: number;
  longitude: number;
  triggerAudio: string | null;
}
