import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(5, { message: 'Comment must be at least 5 characters long' })
  @MaxLength(1024, { message: 'Comment must be at most 1024 characters long' })
  public text!: string;

  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  public rating!: number;
}
