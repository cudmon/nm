"use client";

import { RoE } from "classes/RoE";
import { withRoE } from "app/root-of-equation/withRoE";
import { TextInput } from "@mantine/core";

class Bisection extends RoE {
  public override solve(equation: string, x: number[]): number[] {
    this.problem = {
      x,
      equation,
      type: "f(x)",
    };

    let xm = 0;
    let xl = x[0];
    let xr = x[1];

    let {
      tolerance,
      evaluate: f,
      result: { roots, error },
    } = this;

    for (let i = 0; i < this.max; i++) {
      xm = (xl + xr) / 2;

      const fxr: number = f(xr);
      const fxm: number = f(xm);

      if (fxr * fxm > 0) {
        xr = xm;
      } else {
        xl = xm;
      }

      roots.push(xm);

      if (i > 0) {
        error.push(Math.abs((roots[i] - roots[i - 1]) / roots[i]));

        if (error.at(-1)! * 100 < tolerance) {
          break;
        }
      }
    }

    return roots;
  }

  public override async save(): Promise<void> {
    await this.http.post("/api/roe", {
      ...this.problem,
    });
  }

  public override async random(): Promise<{ [key: string]: any }> {
    const { data } = await this.http.get("/api/roe/random", {
      params: {
        type: "f(x)",
      },
    });

    return data;
  }
}

export default withRoE({
  Component: ({ onChange, onFocus, onBlur, inputs }) => {
    return (
      <>
        <TextInput
          required
          size="md"
          name="x0"
          label="xL"
          type="number"
          onBlur={onBlur}
          placeholder="xL"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[0].value}
          error={inputs.x[0].error}
        />
        <TextInput
          required
          size="md"
          name="x1"
          label="xR"
          type="number"
          onBlur={onBlur}
          placeholder="xR"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[1].value}
          error={inputs.x[1].error}
        />
      </>
    );
  },
  Solver: Bisection,
});
