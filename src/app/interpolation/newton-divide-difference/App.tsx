"use client";

import { Interpolation } from "classes/Interpolation";
import { withInterpolation } from "../withInterpolation";

class Newton extends Interpolation {
  public interpolate(target: number, points?: number[]): number {
    this.problem = {
      target,
      x: this.data.map((d) => d.x),
      y: this.data.map((d) => d.y),
    };

    if (this.data.length < 2) {
      throw new Error("Not enough data to interpolate");
    }

    const { x, y } = this.filter(points);
    const f = new Array(x.length)
      .fill(0)
      .map(() => new Array(x.length).fill(0));

    for (let i = 0; i < x.length; i++) {
      f[i][0] = y[i];
    }

    for (let i = 1; i < x.length; i++) {
      for (let j = 0; j < x.length - i; j++) {
        f[j][i] = (f[j + 1][i - 1] - f[j][i - 1]) / (x[j + i] - x[j]);
      }
    }

    let result = f[0][0];

    for (let i = 1; i < x.length; i++) {
      let term = f[0][i];

      for (let j = 0; j < i; j++) {
        term *= target - x[j];
      }

      result += term;
    }

    return result;
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

export default withInterpolation({ Solver: Newton });
