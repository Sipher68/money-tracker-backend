import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error',
  };

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    response.error = 'Validation failed';
    response.message = error.message;
    return res.status(400).json(response);
  }

  if (error.name === 'UnauthorizedError') {
    response.error = 'Unauthorized';
    response.message = 'Invalid or expired authentication token';
    return res.status(401).json(response);
  }

  if (error.name === 'CastError') {
    response.error = 'Invalid ID format';
    return res.status(400).json(response);
  }

  // Default to 500 server error
  res.status(500).json(response);
};
