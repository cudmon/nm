"use client";

import { Interpolation } from "classes/Interpolation";
import { withInterpolation } from "../withInterpolation";

type Mode = "linear" | "quadratic" | "cubic";

class Spline extends Interpolation {
  private mode: Mode = "linear";

  setMode(mode: Mode): void {
    this.mode = mode;
  }

  public interpolate(target: number, points?: number[]): number {
    this.problem = {
      target,
      x: this.data.map((d) => d.x),
      y: this.data.map((d) => d.y),
    };

    if (this.data.length < 2) {
      throw new Error("Not enough data to interpolate");
    }

    return 0;
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

export default withInterpolation({ Solver: Spline });
