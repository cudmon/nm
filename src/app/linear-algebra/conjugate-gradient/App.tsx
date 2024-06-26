"use client";

import { Fieldset, Flex, Group, TextInput } from "@mantine/core";
import { Matrix } from "classes/Matrix";
import { Input, withMatrix } from "app/linear-algebra/withMatrix";

class Conjugate extends Matrix {
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

    const dotProduct = (a: number[], b: number[]) => {
      return a.reduce(
        (acc: number, val: number, index: number) => acc + val * b[index],
        0,
      );
    };

    const matrixVectorMult = (A: number[][], vec: number[]) => {
      return A.map((row) => dotProduct(row, vec));
    };

    const subtractVectors = (a: number[], b: number[]) => {
      return a.map((val, index) => val - b[index]);
    };

    const addVectors = (a: number[], b: number[]) => {
      return a.map((val, index) => val + b[index]);
    };

    const scalarMult = (scalar: number, vec: number[]) => {
      return vec.map((val) => scalar * val);
    };

    let x = [...x0];
    let r = subtractVectors(vector, matrixVectorMult(matrix, x0));
    let p = [...r];
    let rsold = dotProduct(r, r);

    for (const i of matrix) {
      const Ap = matrixVectorMult(matrix, p);
      const alpha = rsold / dotProduct(p, Ap);
      x = addVectors(x, scalarMult(alpha, p));
      r = subtractVectors(r, scalarMult(alpha, Ap));

      const rsnew = dotProduct(r, r);
      if (Math.sqrt(rsnew) < 1e-10) break;
      p = addVectors(r, scalarMult(rsnew / rsold, p));
      rsold = rsnew;
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
  Solver: Conjugate,
});
