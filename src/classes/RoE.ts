import nerdamer from "nerdamer";
import { Solver } from "classes/Solver";

require("nerdamer/Calculus");

export type Problem = {
  x: number[];
  equation: string;
  type: "f(x)" | "g(x)";
};

export type Result = {
  roots: number[];
  error: number[];
};

export abstract class RoE extends Solver {
  protected result: Result;
  protected problem: Problem;

  constructor() {
    super();

    this.problem = {
      x: [],
      equation: "",
      type: "f(x)",
    };

    this.result = {
      roots: [],
      error: [],
    };

    this.solve = this.solve.bind(this);
    this.evaluate = this.evaluate.bind(this);
  }

  protected evaluate(x: number): number {
    return Number(
      nerdamer(this.problem.equation, { x: x.toString() }).evaluate().text(),
    );
  }

  protected differentiate(x: number): number {
    const derivative = nerdamer(`diff(${this.problem.equation}, x)`);

    const value = nerdamer(derivative, { x: x.toString() }).evaluate();

    return Number(value.text());
  }

  public abstract save(): Promise<void>;

  public abstract solve(equation: string, x: number[]): number[];

  public abstract random(): Promise<{ [key: string]: any }>;
}
