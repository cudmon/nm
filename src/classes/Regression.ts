import { Solver } from "./Solver";

export type Data = { x: number[]; y: number }[];

export type Problem = {
  x: number[][];
  y: number[];
  multiple: boolean;
  target: number[];
};

export abstract class Regression extends Solver {
  protected data: Data = [];
  protected problem: Problem;

  constructor() {
    super();

    this.problem = {
      x: [],
      y: [],
      multiple: false,
      target: [],
    };
  }

  public setData(data: Data) {
    this.data = data;
  }

  public abstract polynomial(
    m: number,
    target: number,
  ): { value: number; a: number[] };

  public abstract multipleLinear(target: number[]): {
    value: number;
    a: number[];
  };

  public abstract save(): Promise<void>;

  public abstract random(multiple: boolean): Promise<{ [key: string]: any }>;
}
