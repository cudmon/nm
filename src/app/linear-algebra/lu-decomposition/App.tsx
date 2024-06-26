"use client";

import { Flex } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

export class LU extends Matrix {
  public override solve(matrix: number[][], vector: number[]): number[] {
    this.problem = {
      matrix,
      vector,
      symetric: false,
    };

    const n = matrix.length;

    const L: number[][] = new Array(n).fill(0).map(() => new Array(n).fill(0));
    const U: number[][] = new Array(n).fill(0).map(() => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      L[i][i] = 1;
    }

    for (let i = 0; i < n; i++) {
      for (let k = i; k < n; k++) {
        let sum = 0;

        for (let j = 0; j < i; j++) {
          sum += L[i][j] * U[j][k];
        }

        U[i][k] = matrix[i][k] - sum;
      }

      for (let k = i; k < n; k++) {
        let sum = 0;

        for (let j = 0; j < i; j++) {
          sum += L[k][j] * U[j][i];
        }

        L[k][i] = (matrix[k][i] - sum) / U[i][i];
      }
    }

    const y: number[] = new Array(n);

    for (let i = 0; i < n; i++) {
      let sum = 0;

      for (let j = 0; j < i; j++) {
        sum += L[i][j] * y[j];
      }

      y[i] = (vector[i] - sum) / L[i][i];
    }

    const x: number[] = new Array(n);

    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;

      for (let j = i + 1; j < n; j++) {
        sum += U[i][j] * x[j];
      }

      x[i] = (y[i] - sum) / U[i][i];
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
      },
    });

    return data;
  }
}

export default withMatrix({
  Component: ({ inputs, onBlur, onChange, onFocus }) => {
    return (
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
    );
  },
  Solver: LU,
});
