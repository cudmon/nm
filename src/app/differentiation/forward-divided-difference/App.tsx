"use client";

import { withDifferentiation } from "../withDifferentiation";
import { Differentiation, Problem } from "classes/Differentiation";

class Forward extends Differentiation {
  protected sum(array: number[]) {
    return array.reduce((a, b) => a + b, 0);
  }

  public solve(problem: Problem) {
    this.problem = problem;

    const { evaluate: f } = this;
    const { order, nth, h, x } = this.problem;

    const y = [];
    const dividend = Math.pow(h, nth);

    for (let i = 0; i <= nth; i++) {
      y.push(f(x + i * h));
    }

    if (order === 1) {
      switch (nth) {
        case 1:
          return this.sum([y[1], -y[0]]) / dividend;
        case 2:
          return this.sum([(y[2], -2 * y[1], -y[0])]) / dividend;
        case 3:
          return this.sum([(y[3], -3 * y[2], -3 * y[1], -y[0])]) / dividend;
        case 4:
          return (
            this.sum([(y[4], -4 * y[3], -6 * y[2], -4 * y[1], -y[0])]) /
            dividend
          );
      }
    }

    if (order === 2) {
      switch (nth) {
        case 1:
          return this.sum([-y[2], -4 * y[1], -3 * y[0]]) / (2 * dividend);
        case 2:
          return (
            this.sum([-y[3], +4 * y[2], -5 * y[1], +2 * y[0]]) / (2 * dividend)
          );
        case 3:
          return (
            this.sum([
              -3 * y[4],
              +14 * y[3],
              -24 * y[2],
              +18 * y[1],
              -5 * y[0],
            ]) /
            (2 * dividend)
          );
        case 4:
          return (
            this.sum([
              -2 * y[5],
              +11 * y[4],
              -24 * y[3],
              +26 * y[2],
              -14 * y[1],
              +3 * y[0],
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

export default withDifferentiation({ Solver: Forward });
