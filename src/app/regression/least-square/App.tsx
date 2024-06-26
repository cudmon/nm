"use client";

import { Regression } from "classes/Regression";
import { withRegression } from "../withRegression";
import { LU } from "app/linear-algebra/lu-decomposition/App";

export class LeastSquare extends Regression {
  public polynomial(m: number, target: number): { value: number; a: number[] } {
    this.problem = {
      multiple: false,
      x: this.data.map((d) => [d.x[0]]),
      y: this.data.map((d) => d.y),
      target: [target],
    };

    let value = 0;

    const x = this.data.map((d) => d.x[0]);
    const y = this.data.map((d) => d.y);

    const Ax: number[][] = Array(m + 1)
      .fill(null)
      .map(() =>
        Array(m + 1)
          .fill(null)
          .map(() => 0),
      );

    const B: number[] = Array(m + 1)
      .fill(null)
      .map(() => 0);

    Ax[0][0] = x.length;

    for (let i = 0; i < m + 1; i++) {
      B[i] = x.reduce((sum, cur, idx) => sum + Math.pow(cur, i) * y[idx], 0);

      for (let j = 0; j < m + 1; j++) {
        if (i === 0 && j === 0) {
          continue;
        }

        Ax[i][j] = x.reduce((sum, cur) => sum + Math.pow(cur, i + j), 0);
      }
    }

    const a: number[] = new LU().solve(Ax, B);

    for (let i = 0; i < a.length; i++) {
      value += a[i] * Math.pow(target, i);
    }

    return {
      a,
      value,
    };
  }

  public multipleLinear(target: number[]): { value: number; a: number[] } {
    this.problem = {
      multiple: true,
      x: this.data.map((d) => d.x),
      y: this.data.map((d) => d.y),
      target,
    };

    const x = this.data.map((d) => d.x);
    const y = this.data.map((d) => d.y);

    const Ax: number[][] = Array(x[0].length + 1)
      .fill(null)
      .map(() =>
        Array(x[0].length + 1)
          .fill(null)
          .map(() => 0),
      );

    const B: number[] = Array(x[0].length + 1)
      .fill(null)
      .map(() => 0);

    Ax[0][0] = x.length;

    for (let i = 0; i < x[0].length + 1; i++) {
      B[i] = x.reduce(
        (sum, cur, idx) => sum + (i === 0 ? 1 : cur[i - 1]) * y[idx],
        0,
      );

      for (let j = 0; j < x[0].length + 1; j++) {
        if (i === 0 && j === 0) {
          continue;
        }

        Ax[i][j] = x.reduce(
          (sum, cur) =>
            sum + (i === 0 ? 1 : cur[i - 1]) * (j === 0 ? 1 : cur[j - 1]),
          0,
        );
      }
    }

    const a: number[] = new LU().solve(Ax, B);

    let value = 0;

    for (let i = 0; i < a.length; i++) {
      value += a[i] * (i === 0 ? 1 : target[i - 1]);
    }

    return {
      a,
      value,
    };
  }

  public async save(): Promise<void> {
    await this.http.post("/api/regression", {
      ...this.problem,
    });
  }

  public async random(multiple: boolean): Promise<{ [key: string]: any }> {
    const { data } = await this.http.get("/api/regression/random", {
      params: {
        multiple,
      },
    });

    return data;
  }
}

export default withRegression({
  Solver: LeastSquare,
});
