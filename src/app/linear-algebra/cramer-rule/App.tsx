"use client";

import { Flex } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

class Cramer extends Matrix {
  public override solve(matrix: number[][], vector: number[]): number[] {
    this.problem = {
      matrix,
      vector,
      symetric: false,
    };

    const detA = this.determinant(matrix);

    const result: number[] = [];

    for (let i = 0; i < matrix.length; i++) {
      const detAx = this.determinant(
        matrix.map((row, idx) =>
          row.map((_, jdx) => (jdx === i ? vector[idx] : row[jdx])),
        ),
      );

      result.push(detAx / detA);
    }

    return result;
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
  Solver: Cramer,
});
