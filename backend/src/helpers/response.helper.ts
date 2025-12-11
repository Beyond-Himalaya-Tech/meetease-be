import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

export function notFoundResponse(message: string) {
    return new NotFoundException(message);
}

export function responseFormatter(data, level = "info") {
    if(level == "error") {
        console.log("error ", data);
        return new InternalServerErrorException(data.message || data);;
        // return new InternalServerErrorException('Something went wrong');;
    }
    return { data };
}