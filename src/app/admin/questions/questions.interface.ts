export enum BlockType {
  TEXT = 'text',
  VIDEO = 'video',
  IMAGE = 'image',
  QUESTION = 'question'
}

export enum DynamicType {
  MULTIPLE_CHOICE = 'multiple_choice',
  SINGLE_ANSWER = 'single_answer',
  DRAG_AND_DROP = 'drag_and_drop',
  TEXT_INPUT = 'text_input',
  VIDEO_RESOURCE = 'video_resource'
}

export enum QuestionType {
  KNOWLEDGE_CHECK = 'knowledge_check',
  PRACTICE = 'practice',
  ASSESSMENT = 'assessment',
  REFLECTION = 'reflection'
}

export interface Question {
  id: number;
  blockType: BlockType;
  statement: string;
  description?: string;
  resourceUrl?: string;
  dynamicType: DynamicType;
  questionType: QuestionType;
  feedback: string;
  moduleId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}