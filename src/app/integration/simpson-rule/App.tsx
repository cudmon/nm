"use client";

import nerdamer from "nerdamer";
import { Integration } from "classes/Integration";
import { withIntegration } from "../withIntegration";

class Simpson extends Integration {
  public solve(equation: string, from: number, to: number, n: number): number {
    this.problem = {
      equation,
      from,
      to,
    };

    const h = (to - from) / (2 * n);

    let sum = 0;

    for (let i = 0; i < n * 2 + 1; i++) {
      const x = from + i * h;

      const y = Number(
        nerdamer(equation, { x: x.toString() }).evaluate().text(),
      );

      if (i === 0 || i === n) {
        sum += y;
      } else if (i % 2 === 0) {
        sum += 2 * y;
      } else {
        sum += 4 * y;
      }
    }

    return (h / 3) * sum;
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

export default withIntegration({ Solver: Simpson });
