export interface Plant {
  id: number;
  user_id: number;
  common_name: string;
  scientific_name?: string | null;
  nickname?: string | null;
  location?: string | null;
  light?: string | null;       
  humidity?: string | null;
  temperature?: string | null;
  notes?: string | null;
  image_gcs_uri?: string | null;
  status: 'active' | 'archived';
  source: 'manual' | 'chat' | 'import';
  created_at: string;          
}

