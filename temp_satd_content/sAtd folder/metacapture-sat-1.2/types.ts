export enum CaptureMode {
  LightScan = 'LightScan',
  DeepScan = 'DeepScan',
  OCRMode = 'OCRMode',
  VideoCapture = 'VideoCapture',
  CharacterCard = 'CharacterCard',
}

export interface StructuredData {
  title?: string;
  summary?: string | string[];
  headings?: string[];
  tables?: string[];
  metadata?: Record<string, any>;
  extracted_text?: string;
}

export interface CaptureResult {
  source_url: string;
  capture_mode: CaptureMode;
  timestamp: string;
  extracted_text: string;
  structured_data: StructuredData;
}