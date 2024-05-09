import type { Env as Env_hono } from 'hono';

export interface State {
  questions: any;
  quizIndex: any;
  score: any;
  user(user: any, quizId: any, score: any): unknown;
  quizId(user: any, quizId: any, score: any): unknown;
  pageToken: string;
}

export type FrameEnv = Env_hono & {
  State: State;
};