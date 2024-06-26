"use client";

import nerdamer from "nerdamer";
import { Integration } from "classes/Integration";
import { withIntegration } from "../withIntegration";

const evaluate = (equation: string, x: number): number => {
  return Number(nerdamer(equation, { x: x.toString() }).evaluate().text());
};

export class Trapezoidal extends Integration {
  public solve(equation: string, from: number, to: number, n: number): number {
    this.problem = {
      equation,
      from,
      to,
    };

    const h = (to - from) / n;

    let sum = 0;

    for (let i = 1; i < n; i++) {
      const x = from + i * h;
      sum += evaluate(equation, x);
    }

    sum += (evaluate(equation, from) + evaluate(equation, to)) / 2;

    return sum * h;
  }

  public override async save(): Promise<void> {
    await this.http.post("/api/integration", {
      ...this.problem,
    });
  }

  public override async random(): Promise<{ [key: string]: any }> {
    const { data } = await this.http.get("/api/integration/random");

    return data;
  }
}

export default withIntegration({ Solver: Trapezoidal });
