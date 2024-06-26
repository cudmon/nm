"use client";

import { withDifferentiation } from "../withDifferentiation";
import { Differentiation, Problem } from "classes/Differentiation";

class Central extends Differentiation {
  protected sum(array: number[]) {
    return array.reduce((a, b) => a + b, 0);
  }

  public solve(problem: Problem) {
    this.problem = problem;

    const { evaluate: f } = this;
    const { order, nth, h, x } = this.problem;

    const dividend = Math.pow(h, nth);

    const y = (i: number) => f(x + i * h);

    if (order === 2) {
      switch (nth) {
        case 1:
          return this.sum([y(1), -y(-1)]) / (2 * dividend);
        case 2:
          return this.sum([y(1), -2 * y(0), y(-1)]) / dividend;
        case 3:
          return (
            this.sum([y(2), -2 * y(1), 2 * y(-1), -y(-2)]) / (2 * dividend)
          );
        case 4:
          return (
            this.sum([y(2), -4 * y(1), 6 * y(0), -4 * y(-1), y(-2)]) / dividend
          );
      }
    }

    if (order === 4) {
      switch (nth) {
        case 1:
          return this.sum([-y(2), 8 * y(1), -8 * y(-1), y(-2)]) / (12 * h);
        case 2:
          return (
            this.sum([-y(2), 16 * y(1), -30 * y(0), 16 * y(-1), -y(-2)]) /
            (12 * dividend)
          );
        case 3:
          return (
            this.sum([
              -y(3),
              8 * y(2),
              -13 * y(1),
              +13 * y(-1),
              -8 * y(-2),
              +y(-3),
            ]) /
            (8 * dividend)
          );
        case 4:
          return (
            this.sum([
              -y(3),
              12 * y(2),
              -39 * y(1),
              +56 * y(0),
              -39 * y(-1),
              +12 * y(-2),
              -y(-3),
            ]) /
            (6 * dividend)
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

export default withDifferentiation({ Solver: Central, isCentral: true });
