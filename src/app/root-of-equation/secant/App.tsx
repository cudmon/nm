"use client";

import { RoE } from "classes/RoE";
import { withRoE } from "app/root-of-equation/withRoE";
import { TextInput } from "@mantine/core";

class Secant extends RoE {
  public solve(equation: string, x: number[]): number[] {
    this.problem = {
      x,
      equation,
      type: "f(x)",
    };

    let x0 = x[0];
    let x1 = x[1];
    let x2 = 0;
    let {
      evaluate,
      result: { roots },
    } = this;

    for (let i = 0; i < this.max; i++) {
      x2 = x1 - (evaluate(x1) * (x1 - x0)) / (evaluate(x1) - evaluate(x0));

      if (x2 === roots.at(-1)) {
        break;
      }

      roots.push(x2);

      x0 = x1;
      x1 = x2;
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
        <TextInput
          required
          size="md"
          name="x1"
          label="x1"
          type="number"
          onBlur={onBlur}
          placeholder="x1"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[1].value}
          error={inputs.x[1].error}
        />
      </>
    );
  },
  Solver: Secant,
});
