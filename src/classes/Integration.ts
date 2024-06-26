import nerdamer from "nerdamer";
import { Solver } from "classes/Solver";

export type Problem = {
  equation: string;
  from: number;
  to: number;
};

export abstract class Integration extends Solver {
  protected problem: Problem;

  constructor() {
    super();

    this.problem = {
      equation: "",
      from: 0,
      to: 0,
    };

    this.solve = this.solve.bind(this);
    this.random = this.random.bind(this);
    this.evaluate = this.evaluate.bind(this);
  }

  public evaluate(x: number): number {
    return Number(
      nerdamer(this.problem.equation, { x: x.toString() }).evaluate().text(),
    );
  }

  public static error(trueValue: number, approxValue: number): number {
    return (trueValue - approxValue) / trueValue;
  }

  public abstract save(): Promise<void>;

  public abstract solve(
    equation: string,
    from: number,
    to: number,
    n: number,
  ): number;

  public abstract random(): Promise<{ [key: string]: any }>;
}
