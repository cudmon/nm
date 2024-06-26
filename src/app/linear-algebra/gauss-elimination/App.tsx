"use client";

import { Flex } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

class Gauss extends Matrix {
  public override solve(matrix: number[][], vector: number[]): number[] {
    this.problem = {
      matrix,
      vector,
      symetric: false,
    };

    const numRows = matrix.length;
    const numCols = matrix[0].length;

    if (vector.length !== numRows) {
      throw new Error("Matrix dimensions are not compatible.");
    }

    const augmentedMatrix = matrix.map((row, i) => [...row, vector[i]]);

    for (let col = 0; col < numCols; col++) {
      let pivotRow = col;
      for (let i = col + 1; i < numRows; i++) {
        if (
          Math.abs(augmentedMatrix[i][col]) >
          Math.abs(augmentedMatrix[pivotRow][col])
        ) {
          pivotRow = i;
        }
      }

      [augmentedMatrix[col], augmentedMatrix[pivotRow]] = [
        augmentedMatrix[pivotRow],
        augmentedMatrix[col],
      ];

      const pivotElement = augmentedMatrix[col][col];
      for (let j = col; j <= numCols; j++) {
        augmentedMatrix[col][j] /= pivotElement;
      }

      for (let i = 0; i < numRows; i++) {
        if (i !== col) {
          const factor = augmentedMatrix[i][col];
          for (let j = col; j <= numCols; j++) {
            augmentedMatrix[i][j] -= factor * augmentedMatrix[col][j];
          }
        }
      }
    }

    const solution = augmentedMatrix.map((row) => row[numCols]);

    return solution;
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
  Solver: Gauss,
});
