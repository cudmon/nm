"use client";

import { Flex } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

class Inversion extends Matrix {
  public override solve(matrix: number[][], vector: number[]): number[] {
    this.problem = {
      matrix,
      vector,
      symetric: false,
    };

    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      let maxRow = i;

      for (let j = i + 1; j < n; j++) {
        if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = j;
        }
      }

      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
      [vector[i], vector[maxRow]] = [vector[maxRow], vector[i]];

      for (let j = i + 1; j < n; j++) {
        const factor = matrix[j][i] / matrix[i][i];

        vector[j] -= factor * vector[i];

        for (let k = i; k < n; k++) {
          matrix[j][k] -= factor * matrix[i][k];
        }
      }
    }

    for (let i = n - 1; i >= 0; i--) {
      const factor = matrix[i][i];

      for (let j = i; j < n; j++) {
        matrix[i][j] /= factor;
      }

      vector[i] /= factor;

      for (let j = i - 1; j >= 0; j--) {
        vector[j] -= matrix[j][i] * vector[i];
        matrix[j][i] = 0;
      }
    }

    const x: number[] = new Array(n);

    for (let i = 0; i < n; i++) {
      x[i] = vector[i];
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
  Solver: Inversion,
});
