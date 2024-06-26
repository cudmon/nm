"use client";

import nerdamer from "nerdamer";
import { RoE } from "classes/RoE";
import { TextInput } from "@mantine/core";
import { withRoE } from "app/root-of-equation/withRoE";

class NewtonRaphson extends RoE {
  public solve(equation: string, x: number[]): number[] {
    this.problem = {
      x,
      equation,
      type: "f(x)",
    };

    let x0 = x[0];
    let {
      result: { roots },
    } = this;

    for (let i = 0; i < this.max; i++) {
      const diviend = this.differentiate(x0);

      const x1 = x0 - this.evaluate(x0) / diviend;

      if (x1 === roots.at(-1)) {
        break;
      }

      roots.push(x1);

      x0 = x1;
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
          label="x0"
          type="number"
          onBlur={onBlur}
          placeholder="x0"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[0].value}
          error={inputs.x[0].error}
        />
      </>
    );
  },
  Solver: NewtonRaphson,
});
