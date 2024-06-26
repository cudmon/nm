"use client";

import { Flex } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

class Jordan extends Matrix {
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

    for (let row = 0; row < numRows; row++) {
      let pivotRow = row;

      while (pivotRow < numRows && augmentedMatrix[pivotRow][row] === 0) {
        pivotRow++;
      }

      if (pivotRow === numRows) {
        continue;
      }

      [augmentedMatrix[row], augmentedMatrix[pivotRow]] = [
        augmentedMatrix[pivotRow],
        augmentedMatrix[row],
      ];

      const pivotElement = augmentedMatrix[row][row];
      for (let j = row; j <= numCols; j++) {
        augmentedMatrix[row][j] /= pivotElement;
      }

      for (let i = 0; i < numRows; i++) {
        if (i !== row) {
          const factor = augmentedMatrix[i][row];
          for (let j = row; j <= numCols; j++) {
            augmentedMatrix[i][j] -= factor * augmentedMatrix[row][j];
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
  Solver: Jordan,
});
