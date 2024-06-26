"use client";

import { Fieldset, Flex, Group, TextInput } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

class Seidel extends Matrix {
  public override solve(
    matrix: number[][],
    vector: number[],
    x0: number[],
  ): number[] {
    this.problem = {
      matrix,
      vector,
      symetric: false,
      iteration: true,
      x: x0,
    };

    const n = matrix.length;
    const x = [...x0];

    while (true) {
      for (let i = 0; i < n; i++) {
        x[i] = vector[i];
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            x[i] -= matrix[i][j] * x[j];
          }
        }

        x[i] /= matrix[i][i];
      }

      if (Math.abs(x[0] - x0[0]) < 0.0001) {
        break;
      }

      x0 = x;
    }

    return x;
  }

  public override async save(): Promise<void> {
    await this.http.post("/api/matrix", {
      ...this.problem,
    });
  }

  public override async random(size: number): Promise<{ [key: string]: any }> {
    const { data } = await this.http.get("/api/matrix/random", {
      params: {
        size,
        symetric: false,
        iteration: true,
      },
    });

    return data;
  }
}

export default withMatrix({
  Component: ({ inputs, x0, onBlur, onChange, onFocus }) => {
    return (
      <>
        <Fieldset legend="Initial value">
          <Group grow gap={16}>
            {x0.map((input, index) => (
              <TextInput
                key={index}
                name={`x${index}`}
                placeholder={`x${index}`}
                value={input.value}
                error={input.error}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            ))}
          </Group>
        </Fieldset>
        <Flex gap={16}>
          <Input.Matrix
            inputs={inputs.matrix}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <Input.Vector
            inputs={inputs.vector}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </Flex>
      </>
    );
  },
  Solver: Seidel,
});
