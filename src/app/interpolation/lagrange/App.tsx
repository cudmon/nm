"use client";

import { Interpolation } from "classes/Interpolation";
import { withInterpolation } from "../withInterpolation";

class Lagrange extends Interpolation {
  public interpolate(target: number, points?: number[]): number {
    this.problem = {
      target,
      x: this.data.map((d) => d.x),
      y: this.data.map((d) => d.y),
    };

    if (this.data.length < 2) {
      throw new Error("Not enough data to interpolate");
    }

    let value = 0;

    const { x, y } = this.filter(points);

    for (let i = 0; i < x.length; i++) {
      let dividend = 1;
      let divisor = 1;

      for (let j = 0; j < y.length; j++) {
        if (j !== i) {
          dividend *= target - x[j];
          divisor *= x[i] - x[j];
        }
      }

      value += (dividend / divisor) * y[i];
    }

    return value;
  }

  public async save(): Promise<void> {
    await this.http.post("/api/interpolation", {
      ...this.problem,
    });
  }

  public async random(): Promise<{ [key: string]: any }> {
    const { data } = await this.http.get("/api/interpolation/random", {});

    return data;
  }
}

export default withInterpolation({ Solver: Lagrange });
