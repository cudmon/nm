"use client";

import { withDifferentiation } from "../withDifferentiation";
import { Differentiation, Problem } from "classes/Differentiation";

class Backward extends Differentiation {
  protected sum(array: number[]) {
    return array.reduce((a, b) => a + b, 0);
  }

  public solve(problem: Problem) {
    this.problem = problem;

    const { evaluate: f } = this;
    const { order, nth, h, x } = this.problem;

    const dividend = Math.pow(h, nth);

    const y = (i: number) => f(x + i * h);

    if (order === 1) {
      switch (nth) {
        case 1:
          return this.sum([y(0), -y(-1)]) / dividend;
        case 2:
          return this.sum([(y(0), -2 * y(-1), -y(-2))]) / dividend;
        case 3:
          return this.sum([(y(0), -3 * y(-1), -3 * y(-2), -y(-3))]) / dividend;
        case 4:
          return (
            this.sum([(y(0), -4 * y(-1), -6 * y(-2), -4 * y(-3), -y(-4))]) /
            dividend
          );
      }
    }

    if (order === 2) {
      switch (nth) {
        case 1:
          return this.sum([3 * y(0), -4 * y(-1), y(-2)]) / (2 * dividend);
        case 2:
          return this.sum([2 * y(0), -5 * y(-1), 4 * y(-2), -y(-3)]) / dividend;
        case 3:
          return (
            this.sum([5 * y(0), -18 * y(-1), 24 * y(-2), -14 * y(-3), -y(-4)]) /
            (2 * dividend)
          );
        case 4:
          return (
            this.sum([
              3 * y(0),
              -14 * y(-1),
              26 * y(-2),
              -24 * y(-3),
              11 * y(-4),
              -2 * y(-5),
            ]) / dividend
          );
      }
    }

    return NaN;
  }

  public override async save(): Promise<void> {
    await this.http.post("/api/differentiation", {
      ...this.problem,
    });
  }

  public override async random(): Promise<{ [key: string]: any }> {
    const { data } = await this.http.get("/api/differentiation/random", {});

    return data;
  }
}

export default withDifferentiation({ Solver: Backward });
