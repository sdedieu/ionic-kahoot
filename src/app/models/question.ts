import { Choice } from './choice';

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
  correctChoiceId: string;
}
