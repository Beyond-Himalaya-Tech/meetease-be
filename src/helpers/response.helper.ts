import { NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';

export function notFoundResponse(message: string) {
    return new NotFoundException(message);
}

export function responseFormatter(data, level = 'info') {
  if (level === 'error') {

    // ✅ If already an HTTP exception, rethrow it
    if (data instanceof HttpException) {
      throw data;
    }

    // Otherwise, treat as real server error
    throw new InternalServerErrorException(
      data?.message || 'Something went wrong',
    );
  }

  return { data };
}
