import Link from "next/link";
import {
  Card,
  Text,
  Title,
  SimpleGrid,
  Box,
  Container,
  Flex,
} from "@mantine/core";

import classes from "styles/Home.module.css";

export const metadata = {
  title: "Numerical Method",
};

const contents = [
  {
    name: "Root of Equation",
    menus: [
      {
        name: "Graphical",
        path: "/root-of-equation/graphical",
      },
      {
        name: "Bisection",
        path: "/root-of-equation/bisection",
      },
      {
        name: "False Position",
        path: "/root-of-equation/false-position",
      },
      {
        name: "One Point",
        path: "/root-of-equation/one-point",
      },
      {
        name: "Newton Raphson",
        path: "/root-of-equation/newton-raphson",
      },
      {
        name: "Secant",
        path: "/root-of-equation/secant",
      },
    ],
  },
  {
    name: "Linear Algebra",
    menus: [
      {
        name: "Cramer's Rule",
        path: "/linear-algebra/cramer-rule",
      },
      {
        name: "Gauss Elimination",
        path: "/linear-algebra/gauss-elimination",
      },
      {
        name: "Gauss Jordan",
        path: "/linear-algebra/gauss-jordan",
      },
      {
        name: "Matrix Inversion",
        path: "/linear-algebra/matrix-inversion",
      },
      {
        name: "LU Decomposition",
        path: "/linear-algebra/lu-decomposition",
      },
      {
        name: "Cholesky Decomposition",
        path: "/linear-algebra/cholesky-decomposition",
      },
      {
        name: "Jacobi Iteration",
        path: "/linear-algebra/jacobi-iteration",
      },
      {
        name: "Gauss Seidel Iteration",
        path: "/linear-algebra/gauss-seidel-iteration",
      },
      {
        name: "Conjugate Gradient",
        path: "/linear-algebra/conjugate-gradient",
      },
    ],
  },
  {
    name: "Interpolation",
    menus: [
      {
        name: "Newton Divide Difference",
        path: "/interpolation/newton-divide-difference",
      },
      {
        name: "Lagrange",
        path: "/interpolation/lagrange",
      },
      {
        name: "Spline",
        path: "/interpolation/spline",
      },
    ],
  },
  {
    name: "Regression",
    menus: [
      {
        name: "Least Square",
        path: "/regression/least-square",
      },
    ],
  },
  {
    name: "Integration",
    menus: [
      {
        name: "Trapezoidal Rule",
        path: "/integration/trapezoidal-rule",
      },
      {
        name: "Simpson's Rule",
        path: "/integration/simpson-rule",
      },
    ],
  },
  {
    name: "Differentiation",
    menus: [
      {
        name: "Forward Divided Difference",
        path: "/differentiation/forward-divided-difference",
      },
      {
        name: "Backward Divided Difference",
        path: "/differentiation/backward-divided-difference",
      },
      {
        name: "Central Divided Difference",
        path: "/differentiation/central-divided-difference",
      },
    ],
  },
];

export default function Page() {
  return (
    <Container>
      {contents.map((content) => (
        <Box mb={48} key={content.name}>
          <Title my={24} order={2} fw={500}>
            {content.name}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={32}>
            {content.menus.map((menu) => (
              <Card
                key={menu.name}
                withBorder
                padding="xl"
                component={Link}
                href={menu.path}
                className={classes.card}
              >
                <Flex justify="center" my={"auto"}>
                  <Text ta="center" fz={22} fw={500}>
                    {menu.name}
                  </Text>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Container>
  );
}
