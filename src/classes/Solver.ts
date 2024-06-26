import axios, { Axios } from "axios";
import { MAX_ITERATION, TOLERANCE } from "constant";

export abstract class Solver {
  protected http: Axios;
  protected max = MAX_ITERATION;
  protected tolerance: number = TOLERANCE;

  constructor() {
    this.http = axios.create({
      baseURL: process.env.VERCEL_URL,
    });
  }
}
