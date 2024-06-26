"use client";

import { RoE } from "classes/RoE";
import { withRoE } from "app/root-of-equation/withRoE";
import { TextInput } from "@mantine/core";

class FalsePosition extends RoE {
  public solve(equation: string, x: number[]): number[] {
    this.problem = {
      x,
      equation,
      type: "f(x)",
    };

    let xr = 0;
    let xl = x[0];
    let xu = x[1];
    let {
      evaluate: f,
      result: { roots },
    } = this;

    for (let i = 0; i < this.max; i++) {
      xr = xu - (f(xu) * (xl - xu)) / (f(xl) - f(xu));

      if (f(xr) * f(xl) < 0) {
        xu = xr;
      } else if (f(xr) * f(xl) > 0) {
        xl = xr;
      }

      if (xr === roots.at(-1)) {
        break;
      }

      roots.push(xr);
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
          label="xU"
          type="number"
          onBlur={onBlur}
          placeholder="xU"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[1].value}
          error={inputs.x[1].error}
        />
      </>
    );
  },
  Solver: FalsePosition,
});
