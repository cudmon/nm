import { Solver } from "classes/Solver";

export type Problem = {
  x?: number[];
  vector: number[];
  matrix: number[][];
  symetric: boolean;
  iteration?: boolean;
};

export type Result = number[];

export abstract class Matrix extends Solver {
  protected result: Result;
  protected problem: Problem;

  constructor() {
    super();

    this.problem = {
      vector: [],
      matrix: [],
      symetric: false,
      iteration: false,
    };

    this.result = [];

    this.solve = this.solve.bind(this);
  }

  protected determinant(matrix: number[][]): number {
    if (matrix.length === 1) {
      return matrix[0][0];
    }

    let det = 0;

    for (let i = 0; i < matrix.length; i++) {
      const sub = matrix
        .slice(1)
        .map((row) => row.filter((_, idx) => idx !== i));

      det += Math.pow(-1, i) * matrix[0][i] * this.determinant(sub);
    }

    return det;
  }

  public abstract save(): Promise<void>;

  public abstract solve(
    matrix: number[][],
    vector: number[],
    x0?: number[],
  ): number[];

  public abstract random(size: number): Promise<{ [key: string]: any }>;
}
