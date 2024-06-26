import nerdamer from "nerdamer";
import { Solver } from "classes/Solver";

export type Problem = {
  equation: string;
  nth: 1 | 2 | 3 | 4;
  order: 1 | 2 | 4;
  x: number;
  h: number;
};

export abstract class Differentiation extends Solver {
  protected problem: Problem;

  constructor() {
    super();

    this.problem = {
      equation: "",
      nth: 1,
      order: 1,
      x: 0,
      h: 1,
    };

    this.solve = this.solve.bind(this);
    this.evaluate = this.evaluate.bind(this);
  }

  protected evaluate(x: number) {
    return Number(
      nerdamer(this.problem.equation, { x: x.toString() }).evaluate().text(),
    );
  }

  public static error(trueValue: number, approxValue: number): number {
    return (trueValue - approxValue) / trueValue;
  }

  public abstract save(): Promise<void>;

  public abstract random(): Promise<{ [key: string]: any }>;

  public abstract solve(problem: Problem): number;
}
