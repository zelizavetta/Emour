import { Response } from "express";


export class ApiSuccess {
  static ok<T>(res: Response, data: T) {
    return res.status(200).json({ data });
  }
  
  static created<T>(res: Response, data: T) {
    return res.status(201).json({ data });
  }
  
  static noContent(res: Response) {
    return res.status(204).send();
  }
}