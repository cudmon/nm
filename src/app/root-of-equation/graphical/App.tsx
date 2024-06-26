"use client";

import { RoE } from "classes/RoE";
import { withRoE } from "app/root-of-equation/withRoE";
import { TextInput } from "@mantine/core";

class Graphical extends RoE {
  public solve(equation: string, x: number[]): number[] {
    this.problem = {
      x,
      equation,
      type: "f(x)",
    };

    let end = x[1];
    let start = x[0];

    let {
      evaluate: f,
      result: { roots },
    } = this;

    for (let i = start; i <= end; i += 0.1) {
      roots.push(i);

      if (f(i) * f(i + 0.1) < 0) {
        break;
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
          label="Start"
          type="number"
          onBlur={onBlur}
          placeholder="Start"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[0].value}
          error={inputs.x[0].error}
        />
        <TextInput
          required
          size="md"
          name="x1"
          label="End"
          type="number"
          onBlur={onBlur}
          placeholder="End"
          onFocus={onFocus}
          onChange={onChange}
          value={inputs.x[1].value}
          error={inputs.x[1].error}
        />
      </>
    );
  },
  Solver: Graphical,
});
