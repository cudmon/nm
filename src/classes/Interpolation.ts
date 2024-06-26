import { Solver } from "./Solver";

export type Data = { x: number; y: number }[];

export type Problem = {
  x: number[];
  y: number[];
  target: number;
};

export abstract class Interpolation extends Solver {
  protected data: Data = [];
  protected problem: Problem;

  constructor() {
    super();

    this.problem = {
      x: [],
      y: [],
      target: 0,
    };
  }

  public setData(data: Data): void {
    this.data = data;
  }

  protected filter(points?: number[]): { x: number[]; y: number[] } {
    let x = [];
    let y = [];

    if (points && points.length >= 2) {
      x = points.map((point) => this.data[point].x);
      y = points.map((point) => this.data[point].y);
    } else {
      x = this.data.map((point) => point.x);
      y = this.data.map((point) => point.y);
    }

    return { x, y };
  }

  public abstract interpolate(target: number, points?: number[]): number;

  public abstract save(): Promise<void>;

  public abstract random(): Promise<{ [key: string]: any }>;
}
